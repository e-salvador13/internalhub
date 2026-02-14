'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Waitlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">IH</span>
            </div>
            <span className="font-bold text-lg">InternalHub</span>
          </div>
          <a 
            href="#waitlist" 
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-blue-300">Now accepting early access signups</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Internal apps,<br />zero security headaches
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Deploy AI-generated tools for your team. Drag, drop, done. 
            Only your coworkers can access—secured by Google Workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#waitlist"
              className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              Get Early Access →
            </a>
            <a 
              href="#how-it-works"
              className="bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">The Problem</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <ProblemCard 
              emoji="🔒"
              title="Localhost is lonely"
              desc="Built something cool with AI? Only you can see it."
            />
            <ProblemCard 
              emoji="🌐"
              title="Public is scary"
              desc="Deploy to Vercel? Now anyone can access your internal tool."
            />
            <ProblemCard 
              emoji="🛠"
              title="VPNs are painful"
              desc="IT overhead, config files, employees locked out constantly."
            />
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">The Solution</h2>
          <p className="text-gray-400 text-center mb-12">Three steps to internal app nirvana</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              num={1}
              title="Connect Workspace"
              desc="One-click Google Workspace integration. Everyone with @yourcompany.com can sign in."
            />
            <StepCard 
              num={2}
              title="Drag & Drop"
              desc="Upload your AI-generated HTML/JS or connect a GitHub repo. No CLI needed."
            />
            <StepCard 
              num={3}
              title="Share Internally"
              desc="Get a URL only your team can access. Browse, search, and star coworkers' apps."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
              icon="🔐"
              title="Zero-config security"
              desc="Google Workspace SSO out of the box. No firewall rules, no VPN."
            />
            <FeatureCard 
              icon="📁"
              title="Drag & drop deploy"
              desc="Upload a folder or connect GitHub. Your app is live in seconds."
            />
            <FeatureCard 
              icon="📝"
              title="Draft mode"
              desc="Test privately before publishing to your whole team."
            />
            <FeatureCard 
              icon="🔍"
              title="App directory"
              desc="Browse, search, and discover what your coworkers built."
            />
            <FeatureCard 
              icon="⭐"
              title="Stars & favorites"
              desc="Bookmark the apps you use most. See what's trending."
            />
            <FeatureCard 
              icon="👤"
              title="Creator profiles"
              desc="See all apps by a person. Build your internal reputation."
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Built for the AI Era</h2>
          <p className="text-gray-400 text-center mb-12">
            Your team is already building tools with Claude, ChatGPT, Cursor. 
            Now they can share them.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <UseCaseCard 
              title="Expense Dashboard"
              author="Sarah from Finance"
              desc="AI-generated dashboard tracking team expenses"
            />
            <UseCaseCard 
              title="Meeting Summarizer"
              author="Mike from Engineering"
              desc="Paste transcript, get action items"
            />
            <UseCaseCard 
              title="Candidate Scorer"
              author="Lisa from HR"
              desc="Compare resumes against job requirements"
            />
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get Early Access</h2>
          <p className="text-gray-400 mb-8">
            Be the first to deploy internal apps without security headaches.
          </p>

          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <span className="text-4xl mb-4 block">✅</span>
              <p className="text-green-400 font-medium">You're on the list!</p>
              <p className="text-gray-400 text-sm mt-2">We'll reach out when we're ready for you.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait px-6 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap"
              >
                {loading ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <span className="text-xs font-bold">IH</span>
            </div>
            <span className="font-medium">InternalHub</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 InternalHub. Deploy internal, stay secure.
          </p>
        </div>
      </footer>
    </main>
  );
}

function ProblemCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <span className="text-3xl mb-4 block">{emoji}</span>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function StepCard({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {num}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700/30">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}

function UseCaseCard({ title, author, desc }: { title: string; author: string; desc: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-blue-400 text-xs mb-2">{author}</p>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
