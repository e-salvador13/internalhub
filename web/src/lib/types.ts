// App types

export interface AppCardData {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: 'draft' | 'published';
  storage_path?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  star_count: number;
  is_starred: boolean;
}
