"use client";

import { useState } from "react";
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

interface AppViewerProps {
  app: App;
  isOwner: boolean;
}

export default function AppViewer({ app, isOwner }: AppViewerProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Build the iframe URL for the app content
  // Assuming storage_path points to Supabase storage
  const appUrl = app.storage_path 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/apps/${app.storage_path}/index.html`
    : null;

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
          </div>
        </div>
      )}

      {/* App Content */}
      <div className="flex-1 relative">
        {appUrl ? (
          <iframe
            src={appUrl}
            className="w-full h-full absolute inset-0 border-0"
            title={app.name}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
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
        )}
      </div>
    </div>
  );
}
