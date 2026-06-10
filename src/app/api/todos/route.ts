import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * GET /api/todos — fetch all todos for the authenticated user.
 * When Supabase is not configured, returns empty data (client uses IndexedDB).
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: [], offline: true });
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = supabase.from('todos').select('*').eq('user_id', user.id);
    if (category) query = query.eq('category', category);
    if (status === 'pending') query = query.eq('is_completed', false);
    if (status === 'completed') query = query.eq('is_completed', true);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/todos — create a new todo.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: null, offline: true }, { status: 201 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ data: null, offline: true }, { status: 201 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data, error } = await (supabase.from('todos') as any).insert({
      user_id: user.id, title: body.title, description: body.description,
      category: body.category, priority: body.priority ?? 'normal',
      is_recurring: body.isRecurring ?? false, recur_type: body.recurType,
      recur_config: body.recurConfig, due_date: body.dueDate, due_time: body.dueTime,
      is_birthday_reminder: body.isBirthdayReminder ?? false,
      birthday_person: body.birthdayPerson, birthday_is_lunar: body.birthdayIsLunar ?? false,
      source: body.source ?? 'manual',
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
