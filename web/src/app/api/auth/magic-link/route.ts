import { NextRequest, NextResponse } from "next/server";
import { createMagicToken } from "@/lib/supabase";

// POST /api/auth/magic-link - Send magic link email
export async function POST(request: NextRequest) {
  try {
    const { email, appId, returnUrl } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // Create magic token
    const token = await createMagicToken(email.toLowerCase().trim(), appId);
    if (!token) {
      return NextResponse.json(
        { error: "Failed to create magic link" },
        { status: 500 }
      );
    }

    // Build magic link URL
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const verifyUrl = new URL("/api/auth/verify", baseUrl);
    verifyUrl.searchParams.set("token", token);
    if (returnUrl) {
      verifyUrl.searchParams.set("returnUrl", returnUrl);
    }

    // In production, send email via Resend/Sendgrid/etc.
    // For now, log and return the link (dev mode)
    console.log(`[Magic Link] ${email} → ${verifyUrl.toString()}`);

    // TODO: Send actual email
    // await sendEmail({
    //   to: email,
    //   subject: 'Your InternalHub login link',
    //   html: `<a href="${verifyUrl}">Click here to sign in</a>`,
    // });

    // For development, return the token (remove in production)
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        success: true,
        message: "Magic link created",
        // DEV ONLY - remove in production
        devToken: token,
        devLink: verifyUrl.toString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Check your email for the login link",
    });
  } catch (error) {
    console.error("[Magic Link] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
