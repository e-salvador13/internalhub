import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getServiceClient, getOrCreateUser } from '@/lib/supabase';

// POST /api/apps/[id]/star - Toggle star for an app
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: appId } = await params;
    const supabase = getServiceClient();

    // Get or create user
    const user = await getOrCreateUser(userEmail, session?.user?.name || undefined);
    if (!user) {
      return NextResponse.json({ error: 'User error' }, { status: 500 });
    }

    // Check if already starred
    const { data: existingStar } = await supabase
      .from('stars')
      .select('id')
      .eq('user_id', user.id)
      .eq('app_id', appId)
      .single();

    if (existingStar) {
      // Unstar
      await supabase
        .from('stars')
        .delete()
        .eq('id', existingStar.id);

      return NextResponse.json({ starred: false });
    } else {
      // Star
      await supabase
        .from('stars')
        .insert({
          user_id: user.id,
          app_id: appId,
        });

      return NextResponse.json({ starred: true });
    }

  } catch (error) {
    console.error('[Star] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
