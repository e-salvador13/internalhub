import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getServiceClient } from '@/lib/supabase';

// GET /api/apps/[id] - Get a single app
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServiceClient();

    const { data: app, error } = await supabase
      .from('apps')
      .select(`
        *,
        creator:users!apps_creator_id_fkey(id, name, email, avatar_url),
        stars(user_id)
      `)
      .eq('id', id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({ app });

  } catch (error) {
    console.error('[App] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// PATCH /api/apps/[id] - Update an app
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, status, tags } = body;

    const supabase = getServiceClient();

    // Build update object
    const updates: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'published') {
        updates.published_at = new Date().toISOString();
      }
    }

    const { data: app, error } = await supabase
      .from('apps')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[App] Update error:', error);
      return NextResponse.json({ error: 'Failed to update app' }, { status: 500 });
    }

    return NextResponse.json({ app });

  } catch (error) {
    console.error('[App] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// DELETE /api/apps/[id] - Delete an app
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getServiceClient();

    // First get the app to delete storage files
    const { data: app } = await supabase
      .from('apps')
      .select('storage_path')
      .eq('id', id)
      .single();

    // Delete associated stars first
    await supabase.from('stars').delete().eq('app_id', id);
    
    // Delete app views
    await supabase.from('app_views').delete().eq('app_id', id);

    // Delete the app
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[App] Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 });
    }

    // Delete storage files if exists
    if (app?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('apps')
        .remove([app.storage_path]);
      
      if (storageError) {
        console.error('[App] Storage delete error:', storageError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[App] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
