import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ results: [], offline: true });
  }
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { operations } = await request.json() as {
      operations: Array<{ table: string; operation: 'insert' | 'update' | 'delete'; recordId: string; data: Record<string, unknown> }>;
    };

    const results: Array<{ table: string; operation: string; recordId: string; success: boolean; error?: string }> = [];
    const tableMap: Record<string, string> = { todos: 'todos', habit_logs: 'habit_logs', goals: 'goals', countdowns: 'countdowns', fitness_data: 'fitness_data', fitness_plans: 'fitness_plans', exercise_logs: 'exercise_logs', reading_logs: 'reading_logs', learning_categories: 'learning_categories', learning_plans: 'learning_plans', learning_logs: 'learning_logs', speaking_languages: 'speaking_languages', speaking_logs: 'speaking_logs', illness_logs: 'illness_logs', menstrual_logs: 'menstrual_logs', portfolio_items: 'portfolio_items' };

    for (const op of operations) {
      try {
        const tableName = tableMap[op.table] ?? op.table;
        switch (op.operation) {
          case 'insert': await (supabase.from(tableName) as any).upsert({ ...op.data, user_id: user.id, id: op.recordId }, { onConflict: 'id' }); break;
          case 'update': { const u = { ...op.data }; delete (u as any).id; await (supabase.from(tableName) as any).update(u).eq('id', op.recordId).eq('user_id', user.id); break; }
          case 'delete': await (supabase.from(tableName) as any).delete().eq('id', op.recordId).eq('user_id', user.id); break;
        }
        results.push({ table: op.table, operation: op.operation, recordId: op.recordId, success: true });
      } catch (err) {
        results.push({ table: op.table, operation: op.operation, recordId: op.recordId, success: false, error: String(err) });
      }
    }
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: {}, timestamp: new Date().toISOString(), offline: true });
  }
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ data: {}, timestamp: new Date().toISOString(), offline: true });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [todos, habitLogs, goals, countdowns] = await Promise.all([
      supabase.from('todos').select('*').eq('user_id', user.id),
      supabase.from('habit_logs').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('countdowns').select('*').eq('user_id', user.id),
    ]);

    return NextResponse.json({
      data: { todos: todos.data ?? [], habitLogs: habitLogs.data ?? [], goals: goals.data ?? [], countdowns: countdowns.data ?? [] },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
