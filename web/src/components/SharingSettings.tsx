"use client";

import { useState } from "react";
import { AccessType } from "@/lib/types";

interface SharingSettingsProps {
  appId: string;
  appName: string;
  appSlug?: string;
  currentSettings: {
    access_type: AccessType;
    access_password?: string;
    access_emails?: string[];
    access_domain?: string;
  };
  onClose: () => void;
  onSave: () => void;
}

export default function SharingSettings({
  appId,
  appName,
  appSlug,
  currentSettings,
  onClose,
  onSave,
}: SharingSettingsProps) {
  const [accessType, setAccessType] = useState<AccessType>(currentSettings.access_type);
  const [password, setPassword] = useState(currentSettings.access_password || "");
  const [emails, setEmails] = useState(currentSettings.access_emails?.join("\n") || "");
  const [domain, setDomain] = useState(currentSettings.access_domain || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Use slug for nicer URLs when available
  const identifier = appSlug || appId;
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/a/${identifier}`
    : "";

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const updates: Record<string, any> = { access_type: accessType };
      
      if (accessType === "password") {
        if (!password) {
          throw new Error("Password is required");
        }
        updates.access_password = password;
      }
      
      if (accessType === "email_list") {
        const emailList = emails
          .split(/[\n,]/)
          .map(e => e.trim())
          .filter(e => e && e.includes("@"));
        if (emailList.length === 0) {
          throw new Error("At least one email is required");
        }
        updates.access_emails = emailList;
      }
      
      if (accessType === "domain") {
        if (!domain) {
          throw new Error("Domain is required");
        }
        updates.access_domain = domain;
      }

      const response = await fetch(`/api/apps/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Share "{appName}"</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm whitespace-nowrap"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Access Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Who can access?
            </label>
            <div className="space-y-2">
              {[
                { value: "private", label: "Private", desc: "Only you can access", icon: "🔒" },
                { value: "public", label: "Public", desc: "Anyone with the link", icon: "🌍" },
                { value: "password", label: "Password", desc: "Anyone with the password", icon: "🔑" },
                { value: "email_list", label: "Specific People", desc: "Only specific emails", icon: "📧" },
                { value: "domain", label: "Domain", desc: "Anyone @yourcompany.com", icon: "🏢" },
              ].map(option => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    accessType === option.value
                      ? "bg-blue-600/20 border border-blue-500/50"
                      : "bg-gray-800 border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="access_type"
                    value={option.value}
                    checked={accessType === option.value}
                    onChange={(e) => setAccessType(e.target.value as AccessType)}
                    className="sr-only"
                  />
                  <span className="text-xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{option.label}</div>
                    <div className="text-sm text-gray-400">{option.desc}</div>
                  </div>
                  {accessType === option.value && (
                    <span className="text-blue-400">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Conditional Fields */}
          {accessType === "password" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {accessType === "email_list" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Addresses
              </label>
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="Enter emails (one per line or comma-separated)"
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                These people will receive a magic link to access the app
              </p>
            </div>
          )}

          {accessType === "domain" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Domain
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-gray-700 border border-gray-700 border-r-0 rounded-l-lg text-gray-400">
                  @
                </span>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.replace("@", ""))}
                  placeholder="company.com"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-r-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Anyone with an @{domain || "domain"} email can access
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
