// Frontend types (may differ slightly from DB types)

export interface AppCardData {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  creator_name?: string;
  creator_email?: string;
  storage_path?: string;
  preview_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  star_count: number;
  is_starred: boolean;
  view_count?: number;
}

export interface AppsFilter {
  search?: string;
  status?: 'draft' | 'published' | 'all';
  tags?: string[];
  starred_only?: boolean;
  my_apps_only?: boolean;
  sort?: 'recent' | 'popular' | 'name';
}
