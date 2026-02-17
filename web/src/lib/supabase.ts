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
export interface Workspace {
  id: string;
  name: string;
  domain: string;
  google_workspace_id?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  workspace_id?: string;
  role: 'admin' | 'member';
  created_at: string;
  last_login?: string;
}

export interface App {
  id: string;
  slug: string;
  name: string;
  description?: string;
  workspace_id: string;
  creator_id: string;
  status: 'draft' | 'published' | 'archived';
  storage_path?: string;
  github_repo?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  // Joined fields
  creator?: User;
  star_count?: number;
  is_starred?: boolean;
}

export interface Star {
  id: string;
  user_id: string;
  app_id: string;
  created_at: string;
}

export interface AppView {
  id: string;
  app_id: string;
  user_id?: string;
  viewed_at: string;
}
