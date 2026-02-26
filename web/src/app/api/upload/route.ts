import { NextRequest, NextResponse } from 'next/server';
import { createApp, saveUploadedFiles } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
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

    // Generate slug with timestamp for uniqueness
    const appSlug = appName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const timestamp = Date.now();
    const storagePath = `${appSlug}-${timestamp}`;

    // Process files
    const filesToSave: { name: string; data: Buffer }[] = [];
    const uploadedFiles: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      filesToSave.push({ name: file.name, data: buffer });
      uploadedFiles.push(file.name);
    }

    // Save files to local storage
    await saveUploadedFiles(storagePath, filesToSave);

    // Create app record
    const app = await createApp({
      name: appName,
      description,
      storage_path: storagePath,
    });

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
      url: `/a/${app.id}`,
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
