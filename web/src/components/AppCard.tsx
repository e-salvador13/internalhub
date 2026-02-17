"use client";

import { useState, useEffect } from "react";
import { AppCardData, AccessType } from "@/lib/types";
import SharingSettings from "./SharingSettings";
import EditAppModal from "./EditAppModal";

interface AppCardProps {
  app: AppCardData;
  onStar: (appId: string) => void;
  onPublish: (appId: string) => void;
  onDelete: (appId: string) => void;
  onUpdate?: () => void;
}

interface StorageFile {
  name: string;
  id?: string;
  metadata?: {
    mimetype?: string;
    size?: number;
  };
}

export default function AppCard({ app, onStar, onPublish, onDelete, onUpdate }: AppCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [hasHtml, setHasHtml] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Fetch files to determine thumbnail
  useEffect(() => {
    async function loadFiles() {
      if (!app.storage_path || !supabaseUrl) return;

      try {
        const response = await fetch(`/api/apps/${app.id}/files`);
        if (response.ok) {
          const data = await response.json();
          const files: StorageFile[] = data.files || [];
          
          // Check if has HTML
          const htmlFile = files.find(f => /\.(html|htm)$/i.test(f.name));
          setHasHtml(!!htmlFile);
          
          // Find first image for thumbnail
          const imageFile = files.find(f => 
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name)
          );
          
          if (imageFile) {
            setThumbnailUrl(
              `${supabaseUrl}/storage/v1/object/public/apps/${app.storage_path}/${imageFile.name}`
            );
          }
        }
      } catch (err) {
        console.error("Failed to load files for thumbnail:", err);
      }
    }

    loadFiles();
  }, [app.id, app.storage_path, supabaseUrl]);

  // Use slug for URL if available
  const getShareUrl = () => {
    const identifier = app.slug || app.id;
    return `/a/${identifier}`;
  };

  const getPreviewUrl = () => {
    return getShareUrl();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this app?')) return;
    setIsDeleting(true);
    try {
      await onDelete(app.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const copyShareLink = () => {
    const identifier = app.slug || app.id;
    navigator.clipboard.writeText(`${window.location.origin}/a/${identifier}`);
    setShowMenu(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getAccessIcon = (type: AccessType) => {
    switch (type) {
      case 'public': return '🌍';
      case 'password': return '🔑';
      case 'email_list': return '📧';
      case 'domain': return '🏢';
      default: return '🔒';
    }
  };

  const getAccessLabel = (type: AccessType) => {
    switch (type) {
      case 'public': return 'Public';
      case 'password': return 'Password';
      case 'email_list': return 'Email List';
      case 'domain': return app.access_domain ? `@${app.access_domain}` : 'Domain';
      default: return 'Private';
    }
  };

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group">
        {/* Preview/Thumbnail Area */}
        <div className="relative h-36 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
          {thumbnailUrl ? (
            // Show actual image thumbnail
            <img
              src={thumbnailUrl}
              alt={app.name}
              className="w-full h-full object-cover"
              onError={() => setThumbnailUrl(null)}
            />
          ) : hasHtml ? (
            // Has HTML - show web icon with preview hint
            <div className="flex flex-col items-center">
              <div className="text-4xl">🌐</div>
              <span className="text-xs text-gray-500 mt-1">Web App</span>
            </div>
          ) : app.storage_path ? (
            <div className="text-4xl">📁</div>
          ) : (
            <div className="text-4xl">📄</div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                app.status === "published"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : app.status === "archived"
                  ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}
            >
              {app.status}
            </span>
          </div>

          {/* Star Button */}
          <button
            onClick={() => onStar(app.id)}
            className={`absolute top-3 right-3 p-2 rounded-lg transition-all ${
              app.is_starred
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-gray-800/80 text-gray-400 hover:text-yellow-400"
            } hover:scale-110`}
          >
            {app.is_starred ? "⭐" : "☆"}
          </button>

          {/* More Menu */}
          <div className="absolute top-3 right-12">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg bg-gray-800/80 text-gray-400 hover:bg-gray-700 transition-all"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => { setShowMenu(false); setShowEdit(true); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg flex items-center gap-2"
                >
                  ✏️ Edit Details
                </button>
                <button
                  onClick={() => { setShowMenu(false); setShowSharing(true); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  🔗 Share Settings
                </button>
                <button
                  onClick={copyShareLink}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  📋 Copy Link
                </button>
                <div className="border-t border-gray-700" />
                <button
                  onClick={() => { setShowMenu(false); handleDelete(); }}
                  disabled={isDeleting}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 rounded-b-lg flex items-center gap-2"
                >
                  🗑️ {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-white truncate mb-1">{app.name}</h3>
          
          {app.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{app.description}</p>
          )}

          {/* Access Type Badge */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
              {getAccessIcon(app.access_type)} {getAccessLabel(app.access_type)}
            </span>
            {app.slug && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
                /{app.slug}
              </span>
            )}
          </div>

          {/* Tags */}
          {app.tags && app.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {app.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-gray-800 text-gray-500 text-xs rounded">
                  #{tag}
                </span>
              ))}
              {app.tags.length > 3 && (
                <span className="px-1.5 py-0.5 text-gray-500 text-xs">
                  +{app.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span>{formatDate(app.created_at)}</span>
            <div className="flex items-center gap-3">
              {app.star_count > 0 && (
                <span>⭐ {app.star_count}</span>
              )}
              {app.view_count !== undefined && app.view_count > 0 && (
                <span>👁 {app.view_count}</span>
              )}
            </div>
          </div>

          {/* Actions - Mobile responsive */}
          <div className="flex gap-2">
            {app.status === "draft" ? (
              <button
                onClick={() => onPublish(app.id)}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors active:scale-95"
              >
                Publish
              </button>
            ) : (
              <button
                onClick={() => setShowSharing(true)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
              >
                Share
              </button>
            )}
            <button
              onClick={() => setShowEdit(true)}
              className="px-3 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors active:scale-95"
              title="Edit app"
            >
              ✏️
            </button>
            <a
              href={getPreviewUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors active:scale-95"
            >
              Open
            </a>
          </div>
        </div>
      </div>

      {/* Sharing Modal */}
      {showSharing && (
        <SharingSettings
          appId={app.id}
          appName={app.name}
          appSlug={app.slug}
          currentSettings={{
            access_type: app.access_type,
            access_emails: app.access_emails,
            access_domain: app.access_domain,
          }}
          onClose={() => setShowSharing(false)}
          onSave={() => {
            setShowSharing(false);
            onUpdate?.();
          }}
        />
      )}

      {/* Edit Modal */}
      {showEdit && (
        <EditAppModal
          app={app}
          onClose={() => setShowEdit(false)}
          onSave={() => {
            setShowEdit(false);
            onUpdate?.();
          }}
        />
      )}
    </>
  );
}
