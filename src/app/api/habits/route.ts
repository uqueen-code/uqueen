import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ data: [], offline: true });
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    let query = supabase.from('habit_logs').select('*').eq('user_id', user.id);
    if (date) query = query.eq('date', date);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.json({ data: null, offline: true }, { status: 201 });
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ data: null, offline: true }, { status: 201 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { data, error } = await (supabase.from('habit_logs') as any).upsert({
      user_id: user.id, date: body.date, category: body.category,
      completed: body.completed ?? true, notes: body.notes,
    }, { onConflict: 'user_id,date,category' }).select().single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
