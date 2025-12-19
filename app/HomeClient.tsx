"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { MousePointer2 } from "lucide-react";

export default function HomeClient() {
  // 3D card interaction state
  const cardRef = useRef(null);
  const [cardTransform, setCardTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  
  // Modal state for images
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Mouse/touch event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
  };
  const handlePointerUp = () => {
    setDragging(false);
    setCardTransform({ rotateX: 0, rotateY: 0, scale: 1 });
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // Clamp rotation for realism
    const rotateY = Math.max(-30, Math.min(30, dx / 5));
    const rotateX = Math.max(-30, Math.min(30, -dy / 5));
    setCardTransform({ rotateX, rotateY, scale: 1.04 });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#18181B] via-[#1A1333] to-black flex flex-col items-center px-4 relative overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-20 bg-black/80 border-b border-neutral-900 backdrop-blur flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <MousePointer2 className="w-6 h-6 text-white" />
          <span className="text-2xl font-extrabold text-white tracking-tight">FirstClick</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/auth/login" className="text-neutral-400 hover:text-white transition-colors font-semibold">Sign In</Link>
          <Link href="/auth/sign-up" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2 rounded-xl shadow transition">Get Started</Link>
        </nav>
      </header>
      
      {/* Launch Banner */}
      <div className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 py-3 mt-16 border-y border-emerald-400/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white font-bold text-lg">
            🎉 Launch Special: <span className="text-emerald-100">Free for Lifetime!</span> No credit card required.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto text-center pt-20 pb-16 relative z-10">
        {/* Spotlight effect */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-40 pointer-events-none" style={{width:'600px',height:'400px',background:'radial-gradient(circle,rgba(120,86,255,0.5) 0%,transparent 70%)'}} />
        <h1 className="text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          Track Every Click.<br />Flex Your Growth.
        </h1>
        <p className="text-2xl text-neutral-300 mb-8 font-light max-w-3xl mx-auto">
          FirstClick is the simplest way to track user analytics and showcase your project's success. 
          Create stunning Flex Cards, climb the leaderboard, and watch your metrics soar.
        </p>
        <div className="flex justify-center gap-4 mb-6">
          <Link href="/auth/sign-up" className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold px-10 py-4 rounded-xl shadow-xl text-lg transition hover:shadow-indigo-500/50 hover:scale-105">
            Start Your Free 14-Day Trial
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 font-semibold text-sm">
            ✨ Launch Offer: 14 Days Free
          </span>
        </div>
        <p className="text-sm text-neutral-500">No credit card required • Cancel anytime</p>
      </section>

      {/* Compatible Platforms - Infinite Scroll */}
      <section className="w-full py-16 bg-gradient-to-b from-transparent via-neutral-900/30 to-transparent overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-8">
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-4">Works with your favorite tools</p>
        </div>
        <div className="relative">
          <div className="flex animate-scroll">
            {/* First set */}
            <div className="flex gap-12 items-center px-6 whitespace-nowrap">
              <span className="text-3xl font-bold text-neutral-400">React</span>
              <span className="text-3xl font-bold text-neutral-400">Next.js</span>
              <span className="text-3xl font-bold text-neutral-400">Vue</span>
              <span className="text-3xl font-bold text-neutral-400">Angular</span>
              <span className="text-3xl font-bold text-neutral-400">Svelte</span>
              <span className="text-3xl font-bold text-neutral-400">WordPress</span>
              <span className="text-3xl font-bold text-neutral-400">Shopify</span>
              <span className="text-3xl font-bold text-neutral-400">WooCommerce</span>
              <span className="text-3xl font-bold text-neutral-400">Webflow</span>
              <span className="text-3xl font-bold text-neutral-400">Wix</span>
              <span className="text-3xl font-bold text-neutral-400">Squarespace</span>
              <span className="text-3xl font-bold text-neutral-400">Django</span>
              <span className="text-3xl font-bold text-neutral-400">Flask</span>
              <span className="text-3xl font-bold text-neutral-400">Laravel</span>
              <span className="text-3xl font-bold text-neutral-400">Ruby on Rails</span>
              <span className="text-3xl font-bold text-neutral-400">Express</span>
              <span className="text-3xl font-bold text-neutral-400">HTML/CSS</span>
              <span className="text-3xl font-bold text-neutral-400">Static Sites</span>
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="flex gap-12 items-center px-6 whitespace-nowrap">
              <span className="text-3xl font-bold text-neutral-400">React</span>
              <span className="text-3xl font-bold text-neutral-400">Next.js</span>
              <span className="text-3xl font-bold text-neutral-400">Vue</span>
              <span className="text-3xl font-bold text-neutral-400">Angular</span>
              <span className="text-3xl font-bold text-neutral-400">Svelte</span>
              <span className="text-3xl font-bold text-neutral-400">WordPress</span>
              <span className="text-3xl font-bold text-neutral-400">Shopify</span>
              <span className="text-3xl font-bold text-neutral-400">WooCommerce</span>
              <span className="text-3xl font-bold text-neutral-400">Webflow</span>
              <span className="text-3xl font-bold text-neutral-400">Wix</span>
              <span className="text-3xl font-bold text-neutral-400">Squarespace</span>
              <span className="text-3xl font-bold text-neutral-400">Django</span>
              <span className="text-3xl font-bold text-neutral-400">Flask</span>
              <span className="text-3xl font-bold text-neutral-400">Laravel</span>
              <span className="text-3xl font-bold text-neutral-400">Ruby on Rails</span>
              <span className="text-3xl font-bold text-neutral-400">Express</span>
              <span className="text-3xl font-bold text-neutral-400">HTML/CSS</span>
              <span className="text-3xl font-bold text-neutral-400">Static Sites</span>
            </div>
          </div>
        </div>
      </section>

      {/* Flex Card Demo */}
      <section className="w-full max-w-2xl mx-auto text-center py-20">
        <h2 className="text-4xl font-extrabold text-white mb-4">Your Growth, Visualized</h2>
        <p className="text-lg text-neutral-300 mb-12">Create Flex Cards to showcase your project&apos;s success</p>
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* Glassy Flex Card demo with 3D interaction */}
          <div
            ref={cardRef}
            className="relative rounded-3xl p-8 aspect-[3/4] overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 w-full max-w-md mx-auto shadow-2xl flex flex-col border border-white/10 backdrop-blur-xl cursor-grab select-none"
            style={{
              transform: `perspective(900px) rotateX(${cardTransform.rotateX}deg) rotateY(${cardTransform.rotateY}deg) scale(${cardTransform.scale})`,
              transition: dragging ? "none" : "transform 0.3s cubic-bezier(.25,.8,.25,1)",
              boxShadow: dragging ? "0 20px 60px 0 rgba(120,86,255,0.25), 0 2px 8px 0 rgba(0,0,0,0.25)" : "0 8px 32px 0 rgba(120,86,255,0.15), 0 2px 8px 0 rgba(0,0,0,0.15)"
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerMove={handlePointerMove}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px'}} />
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-white/20 px-4 py-2 rounded-full">
                  <span className="text-base font-bold text-white">FLEX CARD</span>
                </div>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
              </div>
              <h2 className="mb-6 text-4xl font-extrabold text-white text-center">Your Project</h2>
              <div className="bg-white/10 rounded-xl p-6 mb-6 flex flex-col items-center">
                <div className="text-5xl font-black text-green-300 mb-2 leading-none">+569%</div>
                <div className="text-lg text-white/80">Growth Rate</div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center">
                  <div className="text-3xl font-bold text-white">194</div>
                  <div className="text-base text-white/70 mt-2">Today</div>
                </div>
                <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center">
                  <div className="text-3xl font-bold text-white">29</div>
                  <div className="text-base text-white/70 mt-2">Yesterday</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2">
                <div className="text-white/60 text-base">Powered by FirstClick</div>
                <div className="text-white/60 text-base">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Easy Setup Section */}
      <section className="w-full max-w-6xl mx-auto py-24 px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-white mb-4">Setup in Seconds</h2>
          <p className="text-xl text-neutral-300">Three simple steps to start tracking</p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Steps */}
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Create Your Project</h3>
                <p className="text-neutral-400">Sign up and create a new project in less than 30 seconds</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Copy the Snippet</h3>
                <p className="text-neutral-400">Get your unique tracking code instantly</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Paste & Track</h3>
                <p className="text-neutral-400">Add it to your site and start collecting insights immediately</p>
              </div>
            </div>
          </div>

          {/* Right: Code Snippet Mockup */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-neutral-500 text-sm ml-2">snippet.html</span>
            </div>
            <pre className="text-sm text-neutral-300 overflow-x-auto">
              <code>{`<script 
  src="https://firstclick.vercel.app/track.js"
  data-project-id="your-project-id"
></script>`}</code>
            </pre>
            <div className="mt-4 pt-4 border-t border-neutral-800">
              <p className="text-xs text-neutral-500">✨ That&apos;s it! No complex setup or configuration needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Features Section */}
      <section className="w-full py-24 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold text-white mb-4">Powerful Analytics Dashboard</h2>
            <p className="text-xl text-neutral-300">Everything you need to understand your users</p>
          </div>

          {/* Dashboard Mockup */}
          <div className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-3xl p-8 shadow-2xl mb-16">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Real-Time Analytics Card */}
              <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur border border-neutral-700 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Real-Time Analytics</h3>
                <p className="text-sm text-neutral-400 mb-4">Track clicks, page views, and user behavior as it happens. See hourly breakdowns for today or lifetime trends.</p>
                <div className="space-y-2">
                  <div className="h-2 bg-indigo-500/30 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <div className="h-2 bg-indigo-500/30 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{width: '45%'}}></div>
                  </div>
                  <div className="h-2 bg-indigo-500/30 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>
              </div>

              {/* User Journey Mapping Card */}
              <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur border border-neutral-700 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">User Journey Mapping</h3>
                <p className="text-sm text-neutral-400 mb-4">Visualize how users navigate through your site with interactive flow charts. Drag and drop widgets to customize your view.</p>
                <div 
                  className="relative h-24 bg-neutral-950/50 rounded-lg border border-neutral-700/50 overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all group"
                  onClick={() => setModalImage('/referrers.png')}
                >
                  <Image
                    src="/referrers.png"
                    alt="User Journey Flow Chart"
                    width={280}
                    height={96}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Device Breakdown Card */}
              <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur border border-neutral-700 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Device Breakdown</h3>
                <p className="text-sm text-neutral-400 mb-4">Understand your audience with detailed device analytics. See mobile, desktop, and tablet traffic at a glance.</p>
                {/* Pie Chart Visualization */}
                <div className="flex items-center justify-center gap-6">
                  <svg width="80" height="80" viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Mobile - 50% (blue) */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="20" strokeDasharray="125.6 125.6" strokeDashoffset="0" />
                    {/* Desktop - 30% (purple) */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="20" strokeDasharray="75.36 125.6" strokeDashoffset="-125.6" />
                    {/* Tablet - 20% (pink) */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="20" strokeDasharray="50.24 125.6" strokeDashoffset="-200.96" />
                  </svg>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="text-neutral-300">Mobile 50%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-neutral-300">Desktop 30%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      <span className="text-neutral-300">Tablet 20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Session Logs Card */}
              <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur border border-neutral-700 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Session Logs</h3>
                <p className="text-sm text-neutral-400 mb-4">View detailed session data with timestamps, referrers, and user agents. Filter by date range for deeper insights.</p>
                <div className="space-y-2">
                  <div className="bg-neutral-800/50 rounded-lg p-2 border border-neutral-700/50">
                    <div className="text-xs text-neutral-400">12:34 PM - /home</div>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-2 border border-neutral-700/50">
                    <div className="text-xs text-neutral-400">12:35 PM - /about</div>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-2 border border-neutral-700/50">
                    <div className="text-xs text-neutral-400">12:36 PM - /contact</div>
                  </div>
                </div>
              </div>

              {/* Flex Cards Card */}
              <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur border border-neutral-700 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Flex Cards</h3>
                <p className="text-sm text-neutral-400 mb-4">Create beautiful cards showcasing your growth. Share your success on social media and climb the leaderboard.</p>
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-4 border border-white/10">
                  <div className="text-3xl font-black text-green-300 text-center">+569%</div>
                  <div className="text-xs text-white/70 text-center mt-1">Growth Rate</div>
                </div>
              </div>

              {/* Lightning Fast Card */}
              <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur border border-neutral-700 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
                <p className="text-sm text-neutral-400 mb-4">Optimized for performance with real-time updates. Your analytics load instantly without slowing down your site.</p>
                <div 
                  className="relative h-20 bg-neutral-950/50 rounded-lg border border-neutral-700/50 overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all group"
                  onClick={() => setModalImage('/clicks.png')}
                >
                  <Image
                    src="/clicks.png"
                    alt="Clicks Graph"
                    width={280}
                    height={80}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Leaderboard Section */}
      <section className="w-full py-24 bg-gradient-to-b from-transparent via-indigo-950/30 to-transparent">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-extrabold text-white mb-4">🔥 Climb the Leaderboard</h2>
            <p className="text-xl text-neutral-300 mb-2">Compete with top projects and watch your ranking soar</p>
            <p className="text-base text-neutral-400">Get more clicks than yesterday and claim your spot on the trending page</p>
          </div>
          
          {/* Trending Page Mockup */}
          <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-8 shadow-2xl mb-12">
            {/* Mock Header */}
            <div className="flex items-center gap-8 border-b border-neutral-800 pb-6 mb-8">
              <div className="text-white font-bold text-xl border-b-2 border-white pb-3">Trending</div>
              <div className="text-neutral-500 font-bold text-xl pb-3">Dashboard</div>
              <div className="text-neutral-500 font-bold text-xl pb-3">Library</div>
            </div>

            {/* Mock Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-2xl p-6 aspect-[3/4] flex flex-col border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold text-white">FLEX CARD</div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff200" strokeWidth="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-4">Super Kashif</h3>
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <div className="text-4xl font-black text-green-300 leading-none">+1186%</div>
                  <div className="text-sm text-white/70 mt-1">Growth Rate</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-auto">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-white">193</div>
                    <div className="text-xs text-white/70">Today</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-white">15</div>
                    <div className="text-xs text-white/70">Yesterday</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                  <div className="text-white/60 text-xs">FirstClick</div>
                  <div className="text-white/60 text-xs">12/6/2025</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 aspect-[3/4] flex flex-col border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold text-white">FLEX CARD</div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff200" strokeWidth="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-4">TumblerBlend</h3>
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <div className="text-4xl font-black text-green-300 leading-none">+175%</div>
                  <div className="text-sm text-white/70 mt-1">Growth Rate</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-auto">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-white">11</div>
                    <div className="text-xs text-white/70">Today</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-white">4</div>
                    <div className="text-xs text-white/70">Yesterday</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                  <div className="text-white/60 text-xs">FirstClick</div>
                  <div className="text-white/60 text-xs">12/6/2025</div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 aspect-[3/4] flex flex-col border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold text-white">FLEX CARD</div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff200" strokeWidth="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-4">Trestor</h3>
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <div className="text-4xl font-black text-green-300 leading-none">+50%</div>
                  <div className="text-sm text-white/70 mt-1">Growth Rate</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-auto">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-white">3</div>
                    <div className="text-xs text-white/70">Today</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-white">2</div>
                    <div className="text-xs text-white/70">Yesterday</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                  <div className="text-white/60 text-xs">FirstClick</div>
                  <div className="text-white/60 text-xs">12/6/2025</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/dashboard/trending" 
              className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold px-10 py-4 rounded-xl shadow-xl text-lg transition hover:shadow-indigo-500/50 hover:scale-105"
            >
              View Live Leaderboard →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl mx-auto text-center py-24">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-16 backdrop-blur relative overflow-hidden">
          <div className="absolute top-4 right-4 px-4 py-2 bg-emerald-500 rounded-full text-white font-bold text-sm animate-pulse">
            14 Days Free!
          </div>
          <h2 className="text-5xl font-extrabold text-white mb-6">Ready to Track Your Growth?</h2>
          <p className="text-xl text-neutral-300 mb-2">
            Join thousands of creators showcasing their success with FirstClick
          </p>
          <p className="text-lg text-emerald-400 font-semibold mb-8">
            🎉 Launch Special: Free for 14 Days
          </p>
          <Link 
            href="/auth/sign-up" 
            className="inline-block bg-white text-black font-bold px-12 py-5 rounded-xl shadow-xl text-xl transition hover:bg-neutral-100 hover:scale-105"
          >
            Start Your Free Trial
          </Link>
          <p className="text-sm text-neutral-400 mt-6">No credit card required • Takes less than 2 minutes</p>
        </div>
      </section>

      <footer className="mt-12 pb-8 text-neutral-500 text-sm text-center">
        &copy; {new Date().getFullYear()} FirstClick. All rights reserved.
      </footer>

      {/* Image Modal */}
      {modalImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-neutral-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
              <Image
                src={modalImage}
                alt="Zoomed View"
                width={1200}
                height={800}
                className="w-full h-auto"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}