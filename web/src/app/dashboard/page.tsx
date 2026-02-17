"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import AppCard from "@/components/AppCard";
import SearchBar from "@/components/SearchBar";
import FilterTabs from "@/components/FilterTabs";
import EmptyState from "@/components/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AppCardData } from "@/lib/types";

type FilterTab = "all" | "starred";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apps state
  const [apps, setApps] = useState<AppCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");

  // Fetch apps
  const fetchApps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (activeTab === "starred") params.set("starred", "true");
      params.set("sort", sortBy);

      const response = await fetch(`/api/apps?${params}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to fetch apps");
      }

      setApps(data.apps || []);
    } catch (err) {
      console.error("Error fetching apps:", err);
      setError(err instanceof Error ? err.message : "Failed to load apps");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, sortBy, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchApps();
    }
  }, [status, fetchApps]);

  // Upload handlers
  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress("Preparing upload...");

    try {
      const formData = new FormData();
      const appName = files[0].name.replace(/\.[^/.]+$/, "");
      formData.append("appName", appName);
      formData.append("description", `Uploaded ${files.length} file(s)`);
      
      for (const file of files) {
        formData.append("files", file);
      }

      setUploadProgress(`Uploading ${files.length} file(s)...`);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadProgress("Done!");
      
      // Refresh apps list
      await fetchApps();

    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress("Upload failed. Try again.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress("");
      }, 1500);
    }
  };

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
    await uploadFiles(files);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // App actions
  const handleStar = async (appId: string) => {
    try {
      const response = await fetch(`/api/apps/${appId}/star`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setApps(prev =>
          prev.map(app =>
            app.id === appId
              ? {
                  ...app,
                  is_starred: data.starred,
                  star_count: data.starred ? app.star_count + 1 : app.star_count - 1,
                }
              : app
          )
        );
      }
    } catch (error) {
      console.error("Star error:", error);
    }
  };

  const handlePublish = async (appId: string) => {
    try {
      const response = await fetch(`/api/apps/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });

      if (response.ok) {
        setApps(prev =>
          prev.map(app =>
            app.id === appId ? { ...app, status: "published" as const } : app
          )
        );
      }
    } catch (error) {
      console.error("Publish error:", error);
    }
  };

  const handleDelete = async (appId: string) => {
    try {
      const response = await fetch(`/api/apps/${appId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setApps(prev => prev.filter(app => app.id !== appId));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Tab counts
  const allCount = apps.length;
  const starredApps = apps.filter(a => a.is_starred);

  const tabs = [
    { id: "all", label: "All Apps", count: allCount },
    { id: "starred", label: "Starred", count: starredApps.length },
  ];

  // Filter apps based on current tab
  const filteredApps = activeTab === "starred" ? starredApps : apps;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 sticky top-0 bg-gray-950/95 backdrop-blur-sm z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">InternalHub</h1>
            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
              Your Apps
            </span>
          </div>
          <div className="flex items-center gap-4">
            {session?.user?.email && (
              <>
                <span className="text-gray-400 text-sm">{session.user.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all mb-8 cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
              : "border-gray-700 hover:border-gray-600 hover:bg-gray-900/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".html,.css,.js,.json,.png,.jpg,.jpeg,.gif,.svg,.zip"
          />
          {uploading ? (
            <div className="text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
              <p className="text-sm">{uploadProgress}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <div className="text-3xl">📦</div>
              <div className="text-left">
                <p className="text-gray-300 font-medium">
                  Drag & drop your app files
                </p>
                <p className="text-gray-500 text-sm">
                  HTML, CSS, JS, images — or click to browse
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <FilterTabs
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as FilterTab)}
            tabs={tabs}
          />
          <div className="flex items-center gap-3">
            <div className="w-64">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search apps..."
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "name")}
              className="px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Apps Grid */}
        {loading ? (
          <LoadingSpinner text="Loading apps..." />
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">⚠️ {error}</div>
            <button
              onClick={fetchApps}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredApps.length === 0 ? (
          <EmptyState
            icon={activeTab === "starred" ? "⭐" : "📦"}
            title={
              activeTab === "starred"
                ? "No starred apps"
                : searchQuery
                ? "No results found"
                : "No apps yet"
            }
            description={
              activeTab === "starred"
                ? "Star apps to quickly access them here"
                : searchQuery
                ? "Try a different search term"
                : "Drag & drop files above to create your first app"
            }
            action={
              !searchQuery && activeTab !== "starred"
                ? {
                    label: "Upload Files",
                    onClick: () => fileInputRef.current?.click(),
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onStar={handleStar}
                onPublish={handlePublish}
                onDelete={handleDelete}
                onUpdate={fetchApps}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {apps.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
            {apps.length} app{apps.length !== 1 ? "s" : ""} total
          </div>
        )}
      </main>
    </div>
  );
}
