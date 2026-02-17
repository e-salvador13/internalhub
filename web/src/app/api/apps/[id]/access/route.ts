import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, logAppAccess } from "@/lib/supabase";
import { cookies } from "next/headers";

// POST /api/apps/[id]/access - Verify password access
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Get app
    const { data: app, error } = await supabase
      .from("apps")
      .select("id, access_type, access_password")
      .eq("id", id)
      .single();

    if (error || !app) {
      return NextResponse.json(
        { error: "App not found" },
        { status: 404 }
      );
    }

    if (app.access_type !== "password") {
      return NextResponse.json(
        { error: "This app is not password protected" },
        { status: 400 }
      );
    }

    // Check password
    if (app.access_password !== password) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Log access
    await logAppAccess(id, undefined, "password");

    // Set access cookie for this app
    const response = NextResponse.json({ success: true });
    
    // Cookie name specific to this app
    const cookieName = `app_access_${id}`;
    
    response.cookies.set(cookieName, "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Access] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
