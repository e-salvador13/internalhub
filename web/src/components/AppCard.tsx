"use client";

import { useState } from "react";
import { AppCardData, AccessType } from "@/lib/types";
import SharingSettings from "./SharingSettings";

interface AppCardProps {
  app: AppCardData;
  onStar: (appId: string) => void;
  onPublish: (appId: string) => void;
  onDelete: (appId: string) => void;
  onUpdate?: () => void;
}

export default function AppCard({ app, onStar, onPublish, onDelete, onUpdate }: AppCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSharing, setShowSharing] = useState(false);

  const getPreviewUrl = () => {
    // Link to the public app viewer
    return `/a/${app.id}`;
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
    navigator.clipboard.writeText(`${window.location.origin}/a/${app.id}`);
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
        <div className="relative h-36 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          {app.storage_path ? (
            <div className="text-4xl">🌐</div>
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
                : "bg-gray-800/50 text-gray-500 opacity-0 group-hover:opacity-100"
            } hover:scale-110`}
          >
            {app.is_starred ? "⭐" : "☆"}
          </button>

          {/* More Menu */}
          <div className="absolute top-3 right-12">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg bg-gray-800/50 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-700 transition-all"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => { setShowMenu(false); setShowSharing(true); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg"
                >
                  🔗 Share Settings
                </button>
                <button
                  onClick={copyShareLink}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                >
                  📋 Copy Link
                </button>
                <button
                  onClick={() => { setShowMenu(false); handleDelete(); }}
                  disabled={isDeleting}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 rounded-b-lg"
                >
                  {isDeleting ? 'Deleting...' : '🗑 Delete'}
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
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
              {getAccessIcon(app.access_type)} {getAccessLabel(app.access_type)}
            </span>
          </div>

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

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowSharing(true)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share
            </button>
            <a
              href={getPreviewUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors"
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
    </>
  );
}
