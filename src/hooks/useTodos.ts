'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase, type OfflineTodo } from '@/lib/db/indexeddb';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Todo, RecurConfig } from '@/types/models';
import { Priority, RecurType, TodoSource } from '@/types/enums';

// ---- Helpers ----

function generateId(): string {
  return crypto.randomUUID?.() ?? `todo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function offlineToTodo(offline: OfflineTodo): Todo {
  return {
    id: offline.id,
    userId: offline.userId,
    title: offline.title,
    description: offline.description,
    category: offline.category as Todo['category'],
    priority: offline.priority as Priority,
    isRecurring: offline.isRecurring,
    recurType: offline.recurType as RecurType | null,
    recurConfig: offline.recurConfig as RecurConfig | null,
    dueDate: offline.dueDate,
    dueTime: offline.dueTime,
    isCompleted: offline.isCompleted,
    completedAt: offline.completedAt,
    isBirthdayReminder: offline.isBirthdayReminder,
    birthdayPerson: offline.birthdayPerson,
    birthdayIsLunar: offline.birthdayIsLunar,
    source: offline.source as TodoSource,
    sourceId: offline.sourceId,
    createdAt: offline.createdAt,
    updatedAt: offline.updatedAt,
  };
}

const PLACEHOLDER_USER_ID = 'local-user';

/**
 * Hook for todo CRUD operations.
 * Offline-first: writes to IndexedDB, queues sync to Supabase when online.
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const isOnline = useOfflineStore((s) => s.isOnline);
  const offlineMode = useOfflineStore((s) => s.offlineModeEnabled);
  const addToSyncQueue = useOfflineStore((s) => s.addToSyncQueue);

  const userId = user?.id ?? PLACEHOLDER_USER_ID;
  const effectiveOnline = isOnline && !offlineMode;

  // Load todos from IndexedDB on mount
  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const offlineTodos = await db.todos
        .where('userId')
        .equals(userId)
        .toArray();
      setTodos(offlineTodos.map(offlineToTodo));
    } catch (err) {
      console.error('Failed to load todos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Create a new todo
  const createTodo = useCallback(async (data: {
    title: string;
    description?: string;
    category?: string;
    priority?: Priority;
    isRecurring?: boolean;
    recurType?: RecurType;
    recurConfig?: RecurConfig;
    dueDate?: string;
    dueTime?: string;
    isBirthdayReminder?: boolean;
    birthdayPerson?: string;
    birthdayIsLunar?: boolean;
  }): Promise<Todo> => {
    const now = new Date().toISOString();
    const newTodo: Todo = {
      id: generateId(),
      userId,
      title: data.title,
      description: data.description ?? null,
      category: (data.category as Todo['category']) ?? null,
      priority: data.priority ?? Priority.NORMAL,
      isRecurring: data.isRecurring ?? false,
      recurType: data.recurType ?? null,
      recurConfig: data.recurConfig ?? null,
      dueDate: data.dueDate ?? null,
      dueTime: data.dueTime ?? null,
      isCompleted: false,
      completedAt: null,
      isBirthdayReminder: data.isBirthdayReminder ?? false,
      birthdayPerson: data.birthdayPerson ?? null,
      birthdayIsLunar: data.birthdayIsLunar ?? false,
      source: TodoSource.MANUAL,
      sourceId: null,
      createdAt: now,
      updatedAt: now,
    };

    // Save to IndexedDB
    const db = getDatabase();
    await db.todos.put({
      ...newTodo,
      _synced: false,
      _modifiedAt: Date.now(),
    });

    // Queue for sync
    addToSyncQueue({
      table: 'todos',
      operation: 'insert',
      recordId: newTodo.id,
      data: newTodo as unknown as Record<string, unknown>,
    });

    // Try Supabase if online
    if (effectiveOnline) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.from('todos').insert({
          id: newTodo.id,
          user_id: userId,
          title: newTodo.title,
          description: newTodo.description,
          category: newTodo.category,
          priority: newTodo.priority,
          is_recurring: newTodo.isRecurring,
          recur_type: newTodo.recurType,
          recur_config: newTodo.recurConfig as Record<string, unknown> | null,
          due_date: newTodo.dueDate,
          due_time: newTodo.dueTime,
          is_completed: false,
          is_birthday_reminder: newTodo.isBirthdayReminder,
          birthday_person: newTodo.birthdayPerson,
          birthday_is_lunar: newTodo.birthdayIsLunar,
          source: newTodo.source,
        });
        // Mark as synced
        await db.todos.update(newTodo.id, { _synced: true });
      } catch {
        // Will sync later via sync engine
      }
    }

    setTodos((prev) => [newTodo, ...prev]);
    return newTodo;
  }, [userId, effectiveOnline, addToSyncQueue]);

  // Toggle todo completion
  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const now = new Date().toISOString();
    const updated = {
      ...todo,
      isCompleted: !todo.isCompleted,
      completedAt: !todo.isCompleted ? now : null,
      updatedAt: now,
    };

    const db = getDatabase();
    await db.todos.update(id, {
      isCompleted: updated.isCompleted,
      completedAt: updated.completedAt,
      updatedAt: now,
      _synced: false,
      _modifiedAt: Date.now(),
    });

    addToSyncQueue({
      table: 'todos',
      operation: 'update',
      recordId: id,
      data: { isCompleted: updated.isCompleted, completedAt: updated.completedAt },
    });

    if (effectiveOnline) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.from('todos').update({
          is_completed: updated.isCompleted,
          completed_at: updated.completedAt,
        }).eq('id', id);
        await db.todos.update(id, { _synced: true });
      } catch { /* will sync later */ }
    }

    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, [todos, userId, effectiveOnline, addToSyncQueue]);

  // Update a todo
  const updateTodo = useCallback(async (id: string, data: Partial<Todo>) => {
    const now = new Date().toISOString();
    const db = getDatabase();
    await db.todos.update(id, {
      ...data,
      updatedAt: now,
      _synced: false,
      _modifiedAt: Date.now(),
    } as Partial<OfflineTodo>);

    addToSyncQueue({
      table: 'todos',
      operation: 'update',
      recordId: id,
      data: data as Record<string, unknown>,
    });

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: now } : t))
    );
  }, [addToSyncQueue]);

  // Delete a todo
  const deleteTodo = useCallback(async (id: string) => {
    const db = getDatabase();
    await db.todos.delete(id);

    addToSyncQueue({
      table: 'todos',
      operation: 'delete',
      recordId: id,
      data: {},
    });

    if (effectiveOnline) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.from('todos').delete().eq('id', id);
      } catch { /* will sync later */ }
    }

    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, [effectiveOnline, addToSyncQueue]);

  // Today's todos (sorted by priority)
  const todayTodos = todos
    .filter((t) => {
      if (t.isCompleted) return false;
      if (!t.dueDate) return true; // no date = today
      const today = new Date().toISOString().split('T')[0]!;
      return t.dueDate <= today;
    })
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, important: 1, normal: 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
             (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2);
    });

  // Tomorrow's todos
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0]!;
  const tomorrowTodos = todos
    .filter((t) => !t.isCompleted && t.dueDate === tomorrowStr)
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, important: 1, normal: 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
             (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2);
    });

  // Completed todos
  const completedTodos = todos.filter((t) => t.isCompleted);

  return {
    todos,
    todayTodos,
    tomorrowTodos,
    completedTodos,
    isLoading,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    refresh: loadTodos,
  };
}
