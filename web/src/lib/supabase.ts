import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Server-side client with service key (full access)
export function getServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Types based on schema
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
}

export type AccessType = 'private' | 'public' | 'password' | 'email_list' | 'domain';

export interface App {
  id: string;
  slug: string;
  name: string;
  description?: string;
  owner_id: string;
  status: 'draft' | 'published' | 'archived';
  storage_path?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  // Access control
  access_type: AccessType;
  access_password?: string;
  access_emails?: string[];
  access_domain?: string;
  // Joined fields
  owner?: User;
  star_count?: number;
  is_starred?: boolean;
}

export interface MagicToken {
  id: string;
  email: string;
  token: string;
  app_id?: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export interface Star {
  id: string;
  user_id: string;
  app_id: string;
  created_at: string;
}

export interface AppAccessLog {
  id: string;
  app_id: string;
  accessor_email?: string;
  access_method: string;
  accessed_at: string;
}

// Helper: get or create user by email
export async function getOrCreateUser(email: string, name?: string): Promise<User | null> {
  const supabase = getServiceClient();
  
  // Try to get existing user
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (existingUser) {
    // Update last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', existingUser.id);
    return existingUser;
  }
  
  // Create new user
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ email, name })
    .select('*')
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  
  return newUser;
}

// Helper: generate magic link token
export async function createMagicToken(email: string, appId?: string): Promise<string | null> {
  const supabase = getServiceClient();
  
  // Generate random token
  const token = crypto.randomUUID().replace(/-/g, '');
  
  // Token expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  
  const { error } = await supabase
    .from('magic_tokens')
    .insert({
      email,
      token,
      app_id: appId,
      expires_at: expiresAt,
    });
  
  if (error) {
    console.error('Error creating magic token:', error);
    return null;
  }
  
  return token;
}

// Helper: verify magic token
export async function verifyMagicToken(token: string): Promise<{ email: string; appId?: string } | null> {
  const supabase = getServiceClient();
  
  const { data, error } = await supabase
    .from('magic_tokens')
    .select('*')
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (error || !data) {
    return null;
  }
  
  // Mark token as used
  await supabase
    .from('magic_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id);
  
  return { email: data.email, appId: data.app_id };
}

// Helper: check if email can access app
export function canAccessApp(
  app: App,
  userEmail?: string
): { allowed: boolean; reason?: string } {
  // Owner always has access
  if (userEmail && app.owner?.email === userEmail) {
    return { allowed: true };
  }
  
  switch (app.access_type) {
    case 'public':
      return { allowed: true };
    
    case 'private':
      return { allowed: false, reason: 'This app is private' };
    
    case 'password':
      // Password check happens separately
      return { allowed: false, reason: 'password_required' };
    
    case 'email_list':
      if (!userEmail) {
        return { allowed: false, reason: 'email_required' };
      }
      if (app.access_emails?.includes(userEmail)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Your email is not on the access list' };
    
    case 'domain':
      if (!userEmail) {
        return { allowed: false, reason: 'email_required' };
      }
      const domain = userEmail.split('@')[1];
      if (domain === app.access_domain) {
        return { allowed: true };
      }
      return { allowed: false, reason: `Only @${app.access_domain} emails can access this app` };
    
    default:
      return { allowed: false, reason: 'Unknown access type' };
  }
}

// Helper: log app access
export async function logAppAccess(
  appId: string,
  accessorEmail?: string,
  accessMethod?: string
): Promise<void> {
  const supabase = getServiceClient();
  
  await supabase.from('app_access_log').insert({
    app_id: appId,
    accessor_email: accessorEmail,
    access_method: accessMethod,
  });
}
