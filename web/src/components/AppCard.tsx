"use client";

import { useState } from "react";
import { AppCardData } from "@/lib/types";

interface AppCardProps {
  app: AppCardData;
  onStar: (appId: string) => void;
  onPublish: (appId: string) => void;
  onDelete: (appId: string) => void;
  onUpdate?: () => void;
}

export default function AppCard({ app, onStar, onPublish, onDelete }: AppCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

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
    const url = `${window.location.origin}/a/${app.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setShowMenu(false);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group">
      {/* Preview Area */}
      <div className="relative h-36 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="text-4xl">📦</div>
          <span className="text-xs text-gray-500 mt-1">Web App</span>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              app.status === "published"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            }`}
          >
            {app.status}
          </span>
        </div>

        {/* Star Button */}
        <button
          onClick={() => onStar(app.id)}
          className={`absolute top-3 right-3 min-w-[44px] min-h-[44px] p-2 rounded-lg transition-all ${
            app.is_starred
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-gray-800/80 text-gray-400 hover:text-yellow-400"
          } hover:scale-110 active:scale-95`}
        >
          {app.is_starred ? "⭐" : "☆"}
        </button>

        {/* More Menu */}
        <div className="absolute top-3 right-14">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="min-w-[44px] min-h-[44px] p-2 rounded-lg bg-gray-800/80 text-gray-400 hover:bg-gray-700 transition-all"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
              <button
                onClick={copyShareLink}
                className="w-full min-h-[44px] px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg flex items-center gap-2"
              >
                {copied ? '✅ Copied!' : '📋 Copy Link'}
              </button>
              <div className="border-t border-gray-700" />
              <button
                onClick={() => { setShowMenu(false); handleDelete(); }}
                disabled={isDeleting}
                className="w-full min-h-[44px] px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 rounded-b-lg flex items-center gap-2"
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

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{formatDate(app.created_at)}</span>
          {app.star_count > 0 && (
            <span>⭐ {app.star_count}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {app.status === "draft" ? (
            <button
              onClick={() => onPublish(app.id)}
              className="flex-1 min-h-[44px] px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors active:scale-95"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={copyShareLink}
              className="flex-1 min-h-[44px] px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
            >
              {copied ? '✅ Copied!' : '📋 Share'}
            </button>
          )}
          <a
            href={`/a/${app.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors active:scale-95 flex items-center"
          >
            Open ↗
          </a>
        </div>
      </div>
    </div>
  );
}
