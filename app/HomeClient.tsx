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
            🎉 Launch Special: <span className="text-emerald-100">Free for 14 Days!</span> No credit card required.
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

      {/* Flex Card Demo */}
      <section className="w-full max-w-2xl mx-auto text-center py-20">
        <h2 className="text-4xl font-extrabold text-white mb-4">Your Growth, Visualized</h2>
        <p className="text-lg text-neutral-300 mb-12">Create Flex Cards to showcase your project's success</p>
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

      {/* User Flow Section */}
      <section className="w-full max-w-5xl mx-auto text-center py-24">
        <h2 className="text-5xl font-extrabold text-white mb-6">Track User Journeys</h2>
        <p className="text-xl text-neutral-300 mb-12 max-w-3xl mx-auto">
          Understand how users navigate your project with detailed flow charts and insights. Graphs, sessions, and devices all in one workplace. Just drag and drop!
        </p>
        <div className="flex justify-center">
          <Image
            src="/Dashboard.png"
            alt="User Flow Chart Screenshot"
            width={950}
            height={400}
            className="rounded-2xl border border-neutral-800 shadow-2xl"
            priority={false}
            unoptimized
          />
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
    </main>
  );
}