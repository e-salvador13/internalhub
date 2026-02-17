import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getServiceClient, getOrCreateUser } from '@/lib/supabase';

// GET /api/apps - List apps for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const starred = searchParams.get('starred') === 'true';
    const myApps = searchParams.get('my_apps') === 'true';
    const sort = searchParams.get('sort') || 'recent';

    const supabase = getServiceClient();

    // Get or create user
    const user = await getOrCreateUser(userEmail, session?.user?.name || undefined);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build query - only show user's own apps in dashboard
    let query = supabase
      .from('apps')
      .select(`
        *,
        owner:users!apps_owner_id_fkey(id, name, email, avatar_url),
        stars(user_id)
      `)
      .eq('owner_id', user.id);

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sort) {
      case 'popular':
        query = query.order('created_at', { ascending: false });
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
      const isStarred = app.stars?.some((s: any) => s.user_id === user.id);

      return {
        id: app.id,
        slug: app.slug,
        name: app.name,
        description: app.description,
        status: app.status,
        owner_name: app.owner?.name,
        owner_email: app.owner?.email,
        storage_path: app.storage_path,
        tags: app.tags,
        created_at: app.created_at,
        updated_at: app.updated_at,
        published_at: app.published_at,
        star_count: starCount,
        is_starred: isStarred,
        // Access control
        access_type: app.access_type,
        access_emails: app.access_emails,
        access_domain: app.access_domain,
      };
    });

    // Filter starred if needed
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

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, storage_path, tags } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Get or create user
    const user = await getOrCreateUser(userEmail, session?.user?.name || undefined);
    if (!user) {
      return NextResponse.json({ error: 'User error' }, { status: 500 });
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
        owner_id: user.id,
        status: 'draft',
        access_type: 'private', // Default to private
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
