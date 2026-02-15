import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Check auth (will work once OAuth is working)
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const appName = formData.get('appName') as string;

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const appSlug = appName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    const uploadedFiles: string[] = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const filePath = `${appSlug}-${timestamp}/${file.name}`;

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

    return NextResponse.json({
      success: true,
      appSlug,
      files: uploadedFiles,
      url: urlData.publicUrl,
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
