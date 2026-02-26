import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Get password from env var (default for demo)
    const correctPassword = process.env.IH_PASSWORD || 'demo123';
    
    if (password === correctPassword) {
      // Set auth cookie
      const cookieStore = await cookies();
      cookieStore.set('ih-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  // Logout - clear cookie
  const cookieStore = await cookies();
  cookieStore.delete('ih-auth');
  return NextResponse.json({ success: true });
}
