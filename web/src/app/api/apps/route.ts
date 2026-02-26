import { NextRequest, NextResponse } from 'next/server';
import { getApps, createApp } from '@/lib/store';

// GET /api/apps - List all apps
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const starred = searchParams.get('starred') === 'true';
    const sort = (searchParams.get('sort') as 'recent' | 'name') || 'recent';

    const apps = await getApps({ search, starred, sort });

    return NextResponse.json({ 
      apps, 
      total: apps.length 
    });

  } catch (error) {
    console.error('[Apps] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// POST /api/apps - Create a new app
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, storage_path } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const app = await createApp({
      name,
      description: description || '',
      storage_path: storage_path || '',
    });

    return NextResponse.json({ app });

  } catch (error) {
    console.error('[Apps] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
