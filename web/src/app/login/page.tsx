"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const returnUrl = searchParams.get("returnUrl");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          returnUrl: returnUrl || "/dashboard",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setSent(true);
      
      // Show dev link in development
      if (data.devLink) {
        setDevLink(data.devLink);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "missing_token":
        return "Login link is missing. Please try again.";
      case "invalid_token":
        return "Login link is expired or invalid. Please request a new one.";
      case "user_error":
        return "Could not create account. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm text-center">
          {getErrorMessage(error)}
        </div>
      )}

      {sent ? (
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">✉️</div>
            <p className="text-green-400 font-medium mb-2">
              Magic link sent!
            </p>
            <p className="text-gray-400 text-sm">
              We sent a login link to <span className="text-white">{email}</span>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Link expires in 15 minutes
            </p>
          </div>

          {/* Dev mode: show link directly */}
          {devLink && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-400 text-xs mb-2">DEV MODE: Click to sign in</p>
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
              setSent(false);
              setDevLink(null);
            }}
            className="w-full text-gray-400 hover:text-white text-sm py-2"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm text-center">
              {errorMessage}
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
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Sending...
              </>
            ) : (
              <>
                <span>✨</span>
                Send Magic Link
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            No password needed. We&apos;ll send you a link to sign in.
          </p>
        </form>
      )}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full"></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white mb-2">InternalHub</h1>
          </Link>
          <p className="text-gray-400">
            Sign in with your email
          </p>
        </div>

        <Suspense fallback={<LoadingFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
