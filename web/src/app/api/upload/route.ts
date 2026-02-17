import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { getServiceClient } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const userEmail = session?.user?.email;
    const userDomain = userEmail?.split('@')[1] || 'demo';

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const appName = formData.get('appName') as string;
    const description = formData.get('description') as string || '';

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!appName) {
      return NextResponse.json({ error: 'App name is required' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const appSlug = appName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const timestamp = Date.now();
    const storagePath = `${appSlug}-${timestamp}`;
    const uploadedFiles: string[] = [];

    // Upload files to storage
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const filePath = `${storagePath}/${file.name}`;

      const { error } = await supabase.storage
        .from('apps')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error('[Upload] Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
      }

      uploadedFiles.push(filePath);
    }

    // Get public URL for the main file (index.html or first file)
    const mainFile = uploadedFiles.find(f => f.endsWith('index.html')) || uploadedFiles[0];
    const { data: urlData } = supabase.storage
      .from('apps')
      .getPublicUrl(mainFile);

    // Get or create workspace and user, then save app to database
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

    // Create app record in database
    const { data: app, error: appError } = await supabase
      .from('apps')
      .insert({
        name: appName,
        slug: appSlug,
        description,
        storage_path: storagePath,
        workspace_id: workspace!.id,
        creator_id: user!.id,
        status: 'draft',
        tags: [],
      })
      .select('*')
      .single();

    if (appError) {
      console.error('[Upload] App creation error:', appError);
      // Files uploaded but DB failed - still return success with files
      return NextResponse.json({
        success: true,
        appSlug,
        files: uploadedFiles,
        url: urlData.publicUrl,
        warning: 'Files uploaded but database record failed',
      });
    }

    return NextResponse.json({
      success: true,
      app: {
        id: app.id,
        slug: app.slug,
        name: app.name,
        description: app.description,
        status: app.status,
        storage_path: app.storage_path,
        created_at: app.created_at,
      },
      files: uploadedFiles,
      url: urlData.publicUrl,
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
