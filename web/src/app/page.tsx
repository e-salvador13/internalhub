'use client';

import Link from 'next/link';

export default function Home() {
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
          <Link 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-sm text-blue-300">Simple • Fast • Secure</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Host your AI apps,<br />share with anyone
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Upload your AI-generated tools. Get a shareable link. 
            Password protected—only people you share with can access.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              Get Started →
            </Link>
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
              desc="Deploy to Vercel? Now anyone can find it."
            />
            <ProblemCard 
              emoji="🛠"
              title="Hosting is complex"
              desc="Domains, SSL, servers... just to share a simple tool."
            />
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-400 text-center mb-12">Three steps to shareable apps</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              num={1}
              title="Upload"
              desc="Drag & drop your HTML, CSS, JS files. Or a ZIP. That's it."
            />
            <StepCard 
              num={2}
              title="Get a Link"
              desc="Instant shareable URL. Password protected by default."
            />
            <StepCard 
              num={3}
              title="Share"
              desc="Send the link + password. They can view your app immediately."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple by Design</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
              icon="🔐"
              title="Password protected"
              desc="One password for your hub. Share it with whoever needs access."
            />
            <FeatureCard 
              icon="📁"
              title="Drag & drop"
              desc="Upload files, get a link. No CLI, no config, no build steps."
            />
            <FeatureCard 
              icon="⚡"
              title="Instant preview"
              desc="See your app live immediately after upload."
            />
            <FeatureCard 
              icon="🔍"
              title="Browse & search"
              desc="All your apps in one place. Search, star, organize."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to share?</h2>
          <p className="text-gray-400 mb-8">
            Stop running localhost. Start sharing your AI creations.
          </p>
          <Link 
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Get Started →
          </Link>
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
            © 2026 InternalHub. Upload, share, done.
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
