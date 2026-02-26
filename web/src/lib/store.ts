import { promises as fs } from 'fs';
import path from 'path';

// Simple JSON file-based storage for apps
// In production, replace with a real database

export interface App {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: 'draft' | 'published';
  storage_path: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  star_count: number;
  is_starred: boolean;
}

interface Store {
  apps: App[];
  starred: string[]; // app IDs
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

async function readStore(): Promise<Store> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(STORE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Initialize empty store
    const initial: Store = { apps: [], starred: [] };
    await fs.writeFile(STORE_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

async function writeStore(store: Store): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2));
}

// App operations
export async function getApps(options?: {
  search?: string;
  starred?: boolean;
  sort?: 'recent' | 'name';
}): Promise<App[]> {
  const store = await readStore();
  let apps = store.apps.map(app => ({
    ...app,
    is_starred: store.starred.includes(app.id),
  }));

  // Filter by search
  if (options?.search) {
    const search = options.search.toLowerCase();
    apps = apps.filter(app => 
      app.name.toLowerCase().includes(search) ||
      app.description.toLowerCase().includes(search)
    );
  }

  // Filter starred
  if (options?.starred) {
    apps = apps.filter(app => app.is_starred);
  }

  // Sort
  if (options?.sort === 'name') {
    apps.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return apps;
}

export async function getApp(id: string): Promise<App | null> {
  const store = await readStore();
  const app = store.apps.find(a => a.id === id);
  if (!app) return null;
  return {
    ...app,
    is_starred: store.starred.includes(app.id),
  };
}

export async function createApp(data: {
  name: string;
  description: string;
  storage_path: string;
}): Promise<App> {
  const store = await readStore();
  
  const id = `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  
  const app: App = {
    id,
    slug,
    name: data.name,
    description: data.description,
    status: 'draft',
    storage_path: data.storage_path,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    star_count: 0,
    is_starred: false,
  };
  
  store.apps.push(app);
  await writeStore(store);
  
  return app;
}

export async function updateApp(id: string, updates: Partial<App>): Promise<App | null> {
  const store = await readStore();
  const index = store.apps.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  store.apps[index] = {
    ...store.apps[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  if (updates.status === 'published' && !store.apps[index].published_at) {
    store.apps[index].published_at = new Date().toISOString();
  }
  
  await writeStore(store);
  
  return {
    ...store.apps[index],
    is_starred: store.starred.includes(id),
  };
}

export async function deleteApp(id: string): Promise<boolean> {
  const store = await readStore();
  const index = store.apps.findIndex(a => a.id === id);
  
  if (index === -1) return false;
  
  // Delete files
  const app = store.apps[index];
  if (app.storage_path) {
    try {
      await fs.rm(path.join(UPLOADS_DIR, app.storage_path), { recursive: true });
    } catch {
      // Files might not exist
    }
  }
  
  store.apps.splice(index, 1);
  store.starred = store.starred.filter(s => s !== id);
  await writeStore(store);
  
  return true;
}

export async function toggleStar(appId: string): Promise<boolean> {
  const store = await readStore();
  const index = store.starred.indexOf(appId);
  
  if (index === -1) {
    store.starred.push(appId);
  } else {
    store.starred.splice(index, 1);
  }
  
  await writeStore(store);
  return index === -1; // Returns true if now starred
}

// File operations
export async function saveUploadedFiles(
  appSlug: string,
  files: { name: string; data: Buffer }[]
): Promise<string> {
  await ensureDataDir();
  
  const appDir = path.join(UPLOADS_DIR, appSlug);
  await fs.mkdir(appDir, { recursive: true });
  
  for (const file of files) {
    const filePath = path.join(appDir, file.name);
    // Ensure subdirectories exist
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, file.data);
  }
  
  return appSlug;
}

export function getUploadsDir(): string {
  return UPLOADS_DIR;
}
