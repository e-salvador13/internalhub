import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken, getOrCreateUser } from "@/lib/supabase";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";

// GET /api/auth/verify?token=xxx - Verify magic link and create session
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const returnUrl = request.nextUrl.searchParams.get("returnUrl") || "/dashboard";

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
    }

    // Verify token
    const result = await verifyMagicToken(token);
    if (!result) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
    }

    // Get or create user
    const user = await getOrCreateUser(result.email);
    if (!user) {
      return NextResponse.redirect(new URL("/login?error=user_error", request.url));
    }

    // Create NextAuth JWT
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[Verify] NEXTAUTH_SECRET not set");
      return NextResponse.redirect(new URL("/login?error=config_error", request.url));
    }

    const jwt = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
      },
      secret,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Set session cookie
    const response = NextResponse.redirect(new URL(returnUrl, request.url));
    
    // Get cookie name (NextAuth uses different names in secure vs non-secure)
    const cookieName = process.env.NODE_ENV === "production" 
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";
    
    response.cookies.set(cookieName, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Verify] Error:", error);
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}
