"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface App {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  storage_path?: string;
  owner?: {
    name?: string;
    email: string;
  };
  created_at: string;
  access_type: string;
}

interface StorageFile {
  name: string;
  id: string;
  metadata?: {
    mimetype?: string;
    size?: number;
  };
}

interface AppViewerProps {
  app: App;
  isOwner: boolean;
}

export default function AppViewer({ app, isOwner }: AppViewerProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const storagePath = app.storage_path;

  useEffect(() => {
    async function loadFiles() {
      if (!storagePath || !supabaseUrl) {
        setLoading(false);
        return;
      }

      try {
        // List files in the storage path
        const response = await fetch(`/api/apps/${app.id}/files`);
        if (response.ok) {
          const data = await response.json();
          setFiles(data.files || []);
        }
      } catch (err) {
        console.error("Failed to load files:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [app.id, storagePath, supabaseUrl]);

  // Get file URL
  const getFileUrl = (fileName: string) => {
    return `${supabaseUrl}/storage/v1/object/public/apps/${storagePath}/${fileName}`;
  };

  // Check if file is an image
  const isImage = (fileName: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
  };

  // Check if file is HTML
  const isHtml = (fileName: string) => {
    return /\.(html|htm)$/i.test(fileName);
  };

  // Find main file (index.html or first file)
  const mainFile = files.find(f => f.name === "index.html") || files[0];
  const hasHtml = files.some(f => isHtml(f.name));

  // Share link uses slug when available
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/a/${app.slug || app.id}`
    : "";

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header - Mobile responsive */}
      <header className="border-b border-gray-800 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between bg-gray-950/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link 
            href="/dashboard" 
            className="text-gray-400 hover:text-white p-1 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-base sm:text-lg font-semibold text-white truncate">{app.name}</h1>
          <span className="hidden sm:inline px-2 py-0.5 text-xs bg-gray-800 rounded text-gray-400 flex-shrink-0">
            {app.access_type}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Copy link button */}
          <button
            onClick={copyShareLink}
            className="p-2 text-gray-400 hover:text-white active:scale-95"
            title="Copy share link"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          
          {isOwner && (
            <Link 
              href={`/dashboard?edit=${app.id}`}
              className="hidden sm:inline px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg"
            >
              Edit
            </Link>
          )}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg transition-colors ${showInfo ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Info Panel - Mobile responsive */}
      {showInfo && (
        <div className="border-b border-gray-800 px-3 sm:px-4 py-3 sm:py-4 bg-gray-900/50">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-300 text-sm sm:text-base mb-2">
              {app.description || "No description"}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <span>By {app.owner?.name || app.owner?.email}</span>
              <span className="hidden sm:inline">•</span>
              <span>Created {new Date(app.created_at).toLocaleDateString()}</span>
            </div>
            {files.length > 0 && (
              <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                <span>{files.length} file{files.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            {/* Mobile edit button */}
            {isOwner && (
              <Link 
                href={`/dashboard?edit=${app.id}`}
                className="sm:hidden mt-3 inline-block px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg"
              >
                Edit App
              </Link>
            )}
          </div>
        </div>
      )}

      {/* App Content */}
      <div className="flex-1 relative min-h-[50vh]">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[50vh]">
            <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[50vh] px-4">
            <div className="text-center">
              <div className="text-5xl sm:text-6xl mb-4">📦</div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">No Content Yet</h2>
              <p className="text-gray-400 text-sm sm:text-base">
                This app hasn&apos;t been deployed yet.
              </p>
              {isOwner && (
                <Link
                  href="/dashboard"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95"
                >
                  Upload Files
                </Link>
              )}
            </div>
          </div>
        ) : hasHtml && mainFile && isHtml(mainFile.name) ? (
          // Show HTML in iframe - full screen on mobile
          <iframe
            src={getFileUrl(mainFile.name)}
            className="w-full h-full absolute inset-0 border-0"
            style={{ minHeight: "calc(100vh - 60px)" }}
            title={app.name}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          // Show files gallery - Mobile responsive grid
          <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Files</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {files.map((file) => (
                  <a
                    key={file.id || file.name}
                    href={getFileUrl(file.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 active:scale-[0.98] transition-all"
                  >
                    {isImage(file.name) ? (
                      <div className="aspect-video bg-gray-800 flex items-center justify-center">
                        <img
                          src={getFileUrl(file.name)}
                          alt={file.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-800 flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl">📄</span>
                      </div>
                    )}
                    <div className="p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-white truncate">{file.name}</p>
                      {file.metadata?.size && (
                        <p className="text-xs text-gray-500">
                          {(file.metadata.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
