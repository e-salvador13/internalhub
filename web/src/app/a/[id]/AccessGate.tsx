"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AccessGateProps {
  app: {
    id: string;
    name: string;
    access_type: string;
    access_domain?: string;
  };
  gateType: "password" | "email";
  returnUrl: string;
  message?: string;
}

export default function AccessGate({ app, gateType, returnUrl, message }: AccessGateProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Password form state
  const [password, setPassword] = useState("");
  
  // Email form state
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/apps/${app.id}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid password");
      }

      // Refresh the page to show the app
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid password");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          appId: app.id,
          returnUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setEmailSent(true);
      
      // Show dev link in development
      if (data.devLink) {
        setDevLink(data.devLink);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-white mb-2">{app.name}</h1>
          <p className="text-gray-400">
            {message || (gateType === "password" 
              ? "This app is password protected"
              : "Verify your email to continue"
            )}
          </p>
        </div>

        {gateType === "password" ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="off"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                "Unlock App"
              )}
            </button>
          </form>
        ) : emailSent ? (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">✉️</div>
              <p className="text-green-400 font-medium mb-2">
                Verification email sent!
              </p>
              <p className="text-gray-400 text-sm">
                Check <span className="text-white">{email}</span> for the access link
              </p>
            </div>

            {devLink && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-yellow-400 text-xs mb-2">DEV MODE: Click to verify</p>
                <a 
                  href={devLink}
                  className="text-blue-400 hover:text-blue-300 text-sm break-all"
                >
                  {devLink}
                </a>
              </div>
            )}

            <button
              onClick={() => {
                setEmailSent(false);
                setDevLink(null);
              }}
              className="w-full text-gray-400 hover:text-white text-sm py-2"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Sending...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
