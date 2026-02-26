'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface App {
  id: string;
  name: string;
  description: string;
  storage_path: string;
  status: string;
}

export default function AppViewerPage() {
  const params = useParams();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadApp() {
      try {
        const res = await fetch(`/api/apps/${params.id}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || 'App not found');
          return;
        }
        
        setApp(data.app);
      } catch {
        setError('Failed to load app');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadApp();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading app...</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-white mb-2">App Not Found</h1>
          <p className="text-gray-400">{error || 'This app does not exist or has been removed.'}</p>
          <a 
            href="/dashboard" 
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Render the app in an iframe pointing to the static files
  const iframeSrc = `/uploads/${app.storage_path}/index.html`;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a 
            href="/dashboard"
            className="text-gray-400 hover:text-white"
          >
            ← Back
          </a>
          <span className="text-gray-600">|</span>
          <h1 className="text-white font-medium">{app.name}</h1>
          {app.status === 'draft' && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
              Draft
            </span>
          )}
        </div>
        <div className="text-gray-400 text-sm">
          InternalHub
        </div>
      </div>

      {/* App iframe */}
      <div className="flex-1 relative">
        <iframe
          src={iframeSrc}
          className="absolute inset-0 w-full h-full border-0"
          title={app.name}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
