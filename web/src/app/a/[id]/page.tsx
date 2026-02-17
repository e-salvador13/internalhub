import { getServiceClient, canAccessApp, logAppAccess } from "@/lib/supabase";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { redirect } from "next/navigation";
import AppViewer from "./AppViewer";
import AccessGate from "./AccessGate";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("next-auth.session-token")?.value 
    || cookieStore.get("__Secure-next-auth.session-token")?.value;
  
  if (!token) return null;
  
  try {
    const decoded = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    return decoded?.email as string || null;
  } catch {
    return null;
  }
}

async function hasPasswordAccess(appId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`app_access_${appId}`)?.value;
  return accessCookie === "granted";
}

// Check if user has email-verified access for this app
async function hasEmailAccess(appId: string, email: string): Promise<boolean> {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`app_email_access_${appId}`)?.value;
  return accessCookie === email;
}

export default async function AppPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  
  const supabase = getServiceClient();
  
  // Try to find app by ID first, then by slug
  let app;
  let error;
  
  // Check if id is a UUID (standard format)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  if (isUUID) {
    // Look up by ID
    const result = await supabase
      .from("apps")
      .select(`
        *,
        owner:users!apps_owner_id_fkey(id, name, email)
      `)
      .eq("id", id)
      .single();
    
    app = result.data;
    error = result.error;
  } else {
    // Look up by slug
    const result = await supabase
      .from("apps")
      .select(`
        *,
        owner:users!apps_owner_id_fkey(id, name, email)
      `)
      .eq("slug", id)
      .single();
    
    app = result.data;
    error = result.error;
    
    // If not found by slug, try by ID anyway (some IDs might not be UUID format)
    if (error || !app) {
      const fallbackResult = await supabase
        .from("apps")
        .select(`
          *,
          owner:users!apps_owner_id_fkey(id, name, email)
        `)
        .eq("id", id)
        .single();
      
      if (fallbackResult.data) {
        app = fallbackResult.data;
        error = null;
      }
    }
  }
  
  if (error || !app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">App Not Found</h1>
          <p className="text-gray-400">This app doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  // Get current user email from session
  const userEmail = await getSessionEmail();
  
  // Check if user is owner
  const isOwner = userEmail && app.owner?.email === userEmail;
  
  // Check access
  const accessResult = canAccessApp(app, userEmail || undefined);
  
  // If access denied, show appropriate gate
  if (!accessResult.allowed) {
    // Password protected - check for password cookie
    if (accessResult.reason === "password_required") {
      const hasAccess = await hasPasswordAccess(app.id);
      if (hasAccess) {
        // Already authenticated with password
        await logAppAccess(app.id, undefined, "password");
        return <AppViewer app={app} isOwner={false} />;
      }
      
      // Use slug in URL if available
      const returnPath = app.slug ? `/a/${app.slug}` : `/a/${app.id}`;
      
      return (
        <AccessGate 
          app={app} 
          gateType="password"
          returnUrl={returnPath}
        />
      );
    }
    
    // Email required (email_list or domain access)
    if (accessResult.reason === "email_required") {
      // Check if user verified email for this app
      if (userEmail) {
        const emailVerified = await hasEmailAccess(app.id, userEmail);
        if (emailVerified) {
          // Re-check access with the verified email
          const recheckResult = canAccessApp(app, userEmail);
          if (recheckResult.allowed) {
            await logAppAccess(app.id, userEmail, app.access_type);
            return <AppViewer app={app} isOwner={false} />;
          }
        }
      }
      
      // Use slug in URL if available
      const returnPath = app.slug ? `/a/${app.slug}` : `/a/${app.id}`;
      
      return (
        <AccessGate 
          app={app}
          gateType="email"
          returnUrl={returnPath}
          message={
            app.access_type === "domain" 
              ? `This app is restricted to @${app.access_domain} emails`
              : "This app is restricted to specific email addresses"
          }
        />
      );
    }
    
    // Not on list / wrong domain
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">{accessResult.reason}</p>
          {userEmail && (
            <p className="text-gray-500 text-sm">
              Signed in as: {userEmail}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Log access
  await logAppAccess(
    app.id,
    userEmail || undefined,
    isOwner ? "owner" : app.access_type
  );
  
  // Show the app
  return <AppViewer app={app} isOwner={isOwner || false} />;
}
