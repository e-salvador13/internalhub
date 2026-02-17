"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface App {
  id: string;
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

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between bg-gray-950/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">{app.name}</h1>
          <span className="px-2 py-0.5 text-xs bg-gray-800 rounded text-gray-400">
            {app.access_type}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <Link 
              href={`/dashboard?edit=${app.id}`}
              className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg"
            >
              Edit
            </Link>
          )}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Info Panel */}
      {showInfo && (
        <div className="border-b border-gray-800 px-4 py-4 bg-gray-900/50">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-300 mb-2">{app.description || "No description"}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>By {app.owner?.name || app.owner?.email}</span>
              <span>•</span>
              <span>Created {new Date(app.created_at).toLocaleDateString()}</span>
            </div>
            {files.length > 0 && (
              <div className="mt-3 text-sm text-gray-500">
                <span>Uploaded {files.length} file(s)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* App Content */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl font-semibold text-white mb-2">No Content Yet</h2>
              <p className="text-gray-400">
                This app hasn&apos;t been deployed yet.
              </p>
              {isOwner && (
                <Link
                  href="/dashboard"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload Files
                </Link>
              )}
            </div>
          </div>
        ) : hasHtml && mainFile && isHtml(mainFile.name) ? (
          // Show HTML in iframe
          <iframe
            src={getFileUrl(mainFile.name)}
            className="w-full h-full absolute inset-0 border-0"
            title={app.name}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          // Show files gallery
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-white mb-4">Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <a
                    key={file.id || file.name}
                    href={getFileUrl(file.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
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
                        <span className="text-4xl">📄</span>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm text-white truncate">{file.name}</p>
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
