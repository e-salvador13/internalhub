// Frontend types

export type AccessType = 'private' | 'public' | 'password' | 'email_list' | 'domain';

export interface AppCardData {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  owner_name?: string;
  owner_email?: string;
  storage_path?: string;
  preview_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  star_count: number;
  is_starred: boolean;
  view_count?: number;
  // Access control
  access_type: AccessType;
  access_emails?: string[];
  access_domain?: string;
}

export interface AppSharingSettings {
  access_type: AccessType;
  access_password?: string;
  access_emails?: string[];
  access_domain?: string;
}

export interface AppsFilter {
  search?: string;
  status?: 'draft' | 'published' | 'all';
  tags?: string[];
  starred_only?: boolean;
  my_apps_only?: boolean;
  sort?: 'recent' | 'popular' | 'name';
}

// Session types
export interface UserSession {
  email: string;
  name?: string;
  id?: string;
}
