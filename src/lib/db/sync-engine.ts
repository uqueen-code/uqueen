/**
 * Offline ↔ Online Sync Engine
 *
 * Handles synchronization between IndexedDB (local) and Supabase (cloud).
 *
 * Phase 1: Architecture definition and stubs.
 * Phase 2: Full CRDT-based sync with conflict resolution.
 */

import { getDatabase } from './indexeddb';

/**
 * Sync direction: push local changes to cloud, pull cloud changes to local.
 */
export type SyncDirection = 'push' | 'pull' | 'full';

/**
 * Result of a sync operation.
 */
export interface SyncResult {
  success: boolean;
  direction: SyncDirection;
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
  timestamp: string;
}

/**
 * Push local changes to Supabase.
 * Replays the sync queue in chronological order.
 */
export async function pushToCloud(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    direction: 'push',
    pushed: 0,
    pulled: 0,
    conflicts: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    const db = getDatabase();
    const queue = await db.syncQueue.orderBy('timestamp').toArray();

    for (const item of queue) {
      try {
        // Phase 2: Send to Supabase API
        // const supabase = getSupabaseBrowserClient();
        // switch (item.operation) { ... }

        // For now, just remove from queue
        await db.syncQueue.delete(item.id!);
        result.pushed++;
      } catch (err) {
        result.errors.push(`Failed to sync ${item.table}/${item.recordId}: ${err}`);
        // Increment retry count
        await db.syncQueue.update(item.id!, { retryCount: item.retryCount + 1 });
      }
    }

    result.success = result.errors.length === 0;
  } catch (err) {
    result.errors.push(`Sync engine error: ${err}`);
  }

  return result;
}

/**
 * Pull latest data from Supabase and merge into IndexedDB.
 * Uses Last-Write-Wins strategy for conflicts.
 */
export async function pullFromCloud(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    direction: 'pull',
    pushed: 0,
    pulled: 0,
    conflicts: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // Phase 2: Fetch from Supabase and merge into IndexedDB
    // Tables: todos, habitLogs, goals, countdowns, etc.

    result.pulled = 0; // Will be updated in Phase 2
    result.success = true;
  } catch (err) {
    result.errors.push(`Pull error: ${err}`);
  }

  return result;
}

/**
 * Perform a full two-way sync.
 */
export async function fullSync(): Promise<SyncResult> {
  // Push local changes first, then pull remote changes
  const pushResult = await pushToCloud();
  const pullResult = await pullFromCloud();

  return {
    success: pushResult.success && pullResult.success,
    direction: 'full',
    pushed: pushResult.pushed,
    pulled: pullResult.pulled,
    conflicts: pushResult.conflicts + pullResult.conflicts,
    errors: [...pushResult.errors, ...pullResult.errors],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if there are pending changes to sync.
 */
export async function hasPendingChanges(): Promise<boolean> {
  try {
    const db = getDatabase();
    const count = await db.syncQueue.count();
    return count > 0;
  } catch {
    return false;
  }
}
