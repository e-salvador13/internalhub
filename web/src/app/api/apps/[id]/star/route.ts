import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getServiceClient } from '@/lib/supabase';

// POST /api/apps/[id]/star - Toggle star for an app
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const userEmail = session?.user?.email;
    const userDomain = userEmail?.split('@')[1] || 'demo';

    const { id: appId } = await params;
    const supabase = getServiceClient();

    // Get or create workspace
    let { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('domain', userDomain)
      .single();

    if (!workspace) {
      const { data: newWorkspace } = await supabase
        .from('workspaces')
        .insert({ name: userDomain, domain: userDomain })
        .select('id')
        .single();
      workspace = newWorkspace;
    }

    // Get or create user
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail || 'demo@demo.com')
      .single();

    if (!user) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({ 
          email: userEmail || 'demo@demo.com', 
          name: session?.user?.name || 'Demo User',
          workspace_id: workspace!.id,
          role: 'member'
        })
        .select('id')
        .single();
      user = newUser;
    }

    // Check if already starred
    const { data: existingStar } = await supabase
      .from('stars')
      .select('id')
      .eq('user_id', user!.id)
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
          user_id: user!.id,
          app_id: appId,
        });

      return NextResponse.json({ starred: true });
    }

  } catch (error) {
    console.error('[Star] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
