import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getServiceClient } from '@/lib/supabase';

// GET /api/apps - List apps for the user's workspace
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // For now, allow unauthenticated access for demo (will enforce later)
    const userEmail = session?.user?.email;
    const userDomain = userEmail?.split('@')[1] || 'demo';

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const starred = searchParams.get('starred') === 'true';
    const myApps = searchParams.get('my_apps') === 'true';
    const sort = searchParams.get('sort') || 'recent';

    const supabase = getServiceClient();

    // Get or create workspace for this domain
    let { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('domain', userDomain)
      .single();

    if (!workspace) {
      // Create workspace for demo
      const { data: newWorkspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({ name: userDomain, domain: userDomain })
        .select('id')
        .single();
      
      if (wsError) {
        console.error('[Apps] Error creating workspace:', wsError);
        return NextResponse.json({ apps: [], total: 0 });
      }
      workspace = newWorkspace;
    }

    // Get or create user
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail || 'demo@demo.com')
      .single();

    if (!user && userEmail) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({ 
          email: userEmail, 
          name: session?.user?.name,
          workspace_id: workspace.id,
          role: 'member'
        })
        .select('id')
        .single();
      user = newUser;
    }

    // Build query
    let query = supabase
      .from('apps')
      .select(`
        *,
        creator:users!apps_creator_id_fkey(id, name, email, avatar_url),
        stars(user_id)
      `)
      .eq('workspace_id', workspace.id);

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (myApps && user) {
      query = query.eq('creator_id', user.id);
    }

    // Apply sorting
    switch (sort) {
      case 'popular':
        query = query.order('created_at', { ascending: false }); // TODO: sort by view count
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data: apps, error } = await query;

    if (error) {
      console.error('[Apps] Error fetching:', error);
      return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 });
    }

    // Transform data
    const transformedApps = (apps || []).map(app => {
      const starCount = app.stars?.length || 0;
      const isStarred = user ? app.stars?.some((s: any) => s.user_id === user.id) : false;

      return {
        id: app.id,
        slug: app.slug,
        name: app.name,
        description: app.description,
        status: app.status,
        creator_name: app.creator?.name,
        creator_email: app.creator?.email,
        storage_path: app.storage_path,
        tags: app.tags,
        created_at: app.created_at,
        updated_at: app.updated_at,
        published_at: app.published_at,
        star_count: starCount,
        is_starred: isStarred,
      };
    });

    // Filter starred if needed (after transform since we need is_starred)
    const finalApps = starred 
      ? transformedApps.filter(app => app.is_starred)
      : transformedApps;

    return NextResponse.json({ 
      apps: finalApps, 
      total: finalApps.length 
    });

  } catch (error) {
    console.error('[Apps] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST /api/apps - Create a new app
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const userEmail = session?.user?.email;
    const userDomain = userEmail?.split('@')[1] || 'demo';

    const body = await request.json();
    const { name, description, storage_path, tags } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

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

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    // Create app
    const { data: app, error } = await supabase
      .from('apps')
      .insert({
        name,
        slug,
        description,
        storage_path,
        tags: tags || [],
        workspace_id: workspace!.id,
        creator_id: user!.id,
        status: 'draft',
      })
      .select('*')
      .single();

    if (error) {
      console.error('[Apps] Error creating:', error);
      return NextResponse.json({ error: 'Failed to create app' }, { status: 500 });
    }

    return NextResponse.json({ app });

  } catch (error) {
    console.error('[Apps] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
