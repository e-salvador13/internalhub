"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [apps, setApps] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // For now, just show what was dropped
    // TODO: Upload to Supabase Storage
    setUploading(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newApp = {
      id: Date.now(),
      name: files[0].name.replace(/\.[^/.]+$/, ""),
      files: files.map(f => f.name),
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    
    setApps(prev => [newApp, ...prev]);
    setUploading(false);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const domain = (session.user as any)?.domain || "unknown";

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">InternalHub</h1>
            <span className="px-2 py-1 bg-gray-800 rounded text-sm text-gray-400">
              @{domain}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-400 hover:text-white text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors mb-8 ${
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 hover:border-gray-600"
          }`}
        >
          {uploading ? (
            <div className="text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
              Uploading...
            </div>
          ) : (
            <>
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-300 text-lg mb-2">
                Drag & drop your app files here
              </p>
              <p className="text-gray-500 text-sm">
                HTML, CSS, JS, or a ZIP file
              </p>
            </>
          )}
        </div>

        {/* Apps Grid */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Your Apps</h2>
          
          {apps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No apps yet. Drag & drop to deploy your first app.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{app.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        app.status === "published"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">
                    {app.files.length} file(s)
                  </p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Publish
                    </button>
                    <button className="px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded hover:bg-gray-700">
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
