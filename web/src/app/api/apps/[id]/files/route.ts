import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServiceClient } from "@/lib/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get app to find storage path
    const supabase = getServiceClient();
    const { data: app, error: appError } = await supabase
      .from("apps")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (appError || !app?.storage_path) {
      return NextResponse.json({ files: [] });
    }

    // List files in storage
    const storageClient = createClient(supabaseUrl, supabaseKey);
    const { data: files, error } = await storageClient.storage
      .from("apps")
      .list(app.storage_path, {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error("[Files] Error listing:", error);
      return NextResponse.json({ files: [] });
    }

    return NextResponse.json({ 
      files: files || [],
      storagePath: app.storage_path,
    });
  } catch (error) {
    console.error("[Files] Error:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}
