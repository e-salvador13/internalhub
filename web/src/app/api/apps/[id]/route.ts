import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getServiceClient, getOrCreateUser } from '@/lib/supabase';
import { AccessType } from '@/lib/types';

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
        owner:users!apps_owner_id_fkey(id, name, email, avatar_url),
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

// PATCH /api/apps/[id] - Update an app (including sharing settings)
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
    const { 
      name, 
      description, 
      status, 
      tags,
      // Sharing settings
      access_type,
      access_password,
      access_emails,
      access_domain,
    } = body;

    const supabase = getServiceClient();

    // Verify ownership
    const user = await getOrCreateUser(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: existingApp } = await supabase
      .from('apps')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!existingApp || existingApp.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Build update object
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    
    // Basic fields
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'published') {
        updates.published_at = new Date().toISOString();
      }
    }

    // Sharing settings
    if (access_type !== undefined) {
      const validTypes: AccessType[] = ['private', 'public', 'password', 'email_list', 'domain'];
      if (!validTypes.includes(access_type)) {
        return NextResponse.json({ error: 'Invalid access type' }, { status: 400 });
      }
      updates.access_type = access_type;
    }

    if (access_password !== undefined) {
      updates.access_password = access_password;
    }

    if (access_emails !== undefined) {
      // Validate emails
      if (!Array.isArray(access_emails)) {
        return NextResponse.json({ error: 'access_emails must be an array' }, { status: 400 });
      }
      updates.access_emails = access_emails.map((e: string) => e.toLowerCase().trim());
    }

    if (access_domain !== undefined) {
      // Clean domain (remove @ if present)
      updates.access_domain = access_domain.replace('@', '').toLowerCase().trim();
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

    // Verify ownership
    const user = await getOrCreateUser(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: existingApp } = await supabase
      .from('apps')
      .select('owner_id, storage_path')
      .eq('id', id)
      .single();

    if (!existingApp || existingApp.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Delete associated data
    await supabase.from('stars').delete().eq('app_id', id);
    await supabase.from('app_access_log').delete().eq('app_id', id);
    await supabase.from('magic_tokens').delete().eq('app_id', id);

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
    if (existingApp.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('apps')
        .remove([existingApp.storage_path]);
      
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
