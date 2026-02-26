import { NextRequest, NextResponse } from 'next/server';
import { toggleStar, getApp } from '@/lib/store';

// POST /api/apps/[id]/star - Toggle star on an app
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify app exists
    const app = await getApp(id);
    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const starred = await toggleStar(id);

    return NextResponse.json({ starred });

  } catch (error) {
    console.error('[Star] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
