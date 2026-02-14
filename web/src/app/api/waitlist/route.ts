import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseKey) {
      console.log('[Waitlist] Supabase not configured, logging email:', email);
      return NextResponse.json({ success: true, message: 'Added to waitlist' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already on waitlist' });
    }

    // Insert new signup
    const { error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase(),
        source: 'landing_page',
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[Waitlist] Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }

    console.log('[Waitlist] New signup:', email);
    return NextResponse.json({ success: true, message: 'Added to waitlist' });

  } catch (error) {
    console.error('[Waitlist] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Waitlist API',
    usage: 'POST { "email": "you@company.com" }',
  });
}
