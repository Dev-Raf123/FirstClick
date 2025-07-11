"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MousePointer2 } from "lucide-react";
import Image from "next/image";

export default function HomeClient() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number;
    let offset = 0;
    const animate = () => {
      offset += 0.2;
      if (gridRef.current) {
        gridRef.current.style.backgroundPosition = `0px -${offset}px, -${offset}px 0px`;
      }
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  // Custom cursor state
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [isPressable, setIsPressable] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });

      // Detect if the element under the cursor is pressable
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (
        el &&
        (
          el.tagName === "BUTTON" ||
          el.tagName === "A" ||
          el.getAttribute("role") === "button" ||
          el.getAttribute("tabindex") === "0"
        )
      ) {
        setIsPressable(true);
      } else {
        setIsPressable(false);
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-4 relative overflow-hidden cursor-none">
      {/* Animated moving grid background */}
      <div
        ref={gridRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "0px 0px, 0px 0px",
        }}
      />
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-20 bg-neutral-900/80 border-b border-neutral-800 backdrop-blur flex items-center justify-between px-8 py-4">
        <span className="text-xl font-bold text-white tracking-tight">FirstClick</span>
        <nav className="flex items-center gap-6">
          <Link href="/auth/login" className="text-neutral-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/auth/sign-up" className="text-neutral-300 hover:text-white transition-colors">
            Get Started
          </Link>
        </nav>
      </header>
      <div className="max-w-2xl w-full text-center py-24 relative z-10">
        <div className="border border-neutral-700 rounded-2xl p-10 bg-neutral-900/80 backdrop-blur-sm shadow-2xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Know where your users{" "}
            <span className="text-indigo-400">click</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 mb-10">
            FirstClick helps you understand your users and optimize your website with privacy-friendly, real-time analytics. Just add one snippet—no setup headaches.
          </p>
          <div className="relative flex justify-center">
            {/* Glow animation behind the button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="animate-pulse w-48 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/40 via-blue-500/30 to-purple-500/40 blur-2xl" />
            </div>
            <Link
              href="/auth/sign-up"
              className="relative z-10 inline-block bg-neutral-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-neutral-600 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
          <div className="mt-16 flex flex-col items-center gap-2">
            <span className="text-neutral-400 text-sm">Already have an account?</span>
            <Link
              href="/auth/login"
              className="text-indigo-400 hover:underline text-sm"
            >
              Sign in
            </Link>
          </div>
        </div>
        {/* Feature section */}
        <section className="mt-12 grid md:grid-cols-3 gap-8">
          <div className="bg-neutral-800/80 rounded-xl p-6 border border-neutral-700 shadow">
            <h2 className="text-lg font-semibold text-white mb-2">1-Minute Setup</h2>
            <p className="text-neutral-300 text-sm">
              Add a single snippet to your site and start tracking instantly. No complex configuration.
            </p>
          </div>
          <div className="bg-neutral-800/80 rounded-xl p-6 border border-neutral-700 shadow">
            <h2 className="text-lg font-semibold text-white mb-2">Privacy-First</h2>
            <p className="text-neutral-300 text-sm">
              We never track personal data. Your visitors’ privacy is always protected.
            </p>
          </div>
          <div className="bg-neutral-800/80 rounded-xl p-6 border border-neutral-700 shadow">
            <h2 className="text-lg font-semibold text-white mb-2">Real-Time Insights</h2>
            <p className="text-neutral-300 text-sm">
              See your analytics update live as users interact with your site.
            </p>
          </div>
        </section>
      </div>

      <div className="relative w-full">
        {/* Left-aligned image with label above */}
        <div className="w-full flex flex-col items-start my-12 pl-0 md:pl-8">
          <span className="mb-4 ml-2 text-lg font-semibold text-indigo-300 float-animate">
            Track user navigation using nodes
          </span>
          <Image
            src="/referrers.png"
            alt="User Navigation"
            width={600}
            height={300}
            className="rounded-xl border-2 border-indigo-400 shadow-lg float-animate"
            priority
          />
        </div>

        {/* Right-aligned image with label above */}
        <div className="w-full flex flex-col items-end my-12 pr-0 md:pr-8">
          <span className="mb-4 mr-2 text-lg font-semibold text-indigo-300 text-right float-animate">
            Monitor the amount of clicks u recieve daily
          </span>
          <Image
            src="/clicks.png"
            alt="Clicks graph"
            width={500}
            height={400}
            className="rounded-xl border-2 border-indigo-400 shadow-lg float-animate"
            priority={false}
          />
        </div>

        <div className="w-full flex flex-col items-start my-12 pl-0 md:pl-8">
          <span className="mb-4 ml-2 text-lg font-semibold text-indigo-300 float-animate">
            Track devices used by your users
          </span>
          <Image
            src="/devices.png"
            alt="User devices"
            width={600}
            height={300}
            className="rounded-xl border-2 border-indigo-400 shadow-lg float-animate"
            priority= {false}
          />
        </div>
        <div className="w-full flex flex-col items-end my-12 pl-0 md:pl-8">
          <span className="mb-4 ml-2 text-lg font-semibold text-indigo-300 float-animate">
            View User logs 
          </span>
          <Image
            src="/logs.png"
            alt="User Logs"
            width={500}
            height={400}
            className="rounded-xl border-2 border-indigo-400 shadow-lg float-animate"
            priority= {false}
          />
        </div>
        <div className="w-full flex flex-col items-center my-12 pl-0 md:pl-8">
          <span className="mb-4 ml-2 text-lg font-semibold text-indigo-300 float-animate">
            All in one space 
          </span>
          <Image
            src="/dashboard.png"
            alt="User Logs"
            width={900}
            height={500}
            className="rounded-xl border-2 border-indigo-400 shadow-lg float-animate"
            priority= {false}
          />
        </div>
      </div>
      {/* Footer */}
      <footer className="mt-24 text-neutral-500 text-xs text-center">
        &copy; {new Date().getFullYear()} FirstClick. All rights reserved.
      </footer>
      {/* Custom cursor */}
      <div
        style={{
          left: cursor.x,
          top: cursor.y,
          pointerEvents: "none",
          position: "fixed",
          zIndex: 50,
          transform: "translate(-50%, -50%)",
        }}
      >
        <MousePointer2
          className={`w-6 h-6 drop-shadow-lg transition-colors duration-150 ${
            isPressable ? "text-indigo-400" : "text-white"
          }`}
        />
      </div>
    </main>
  );
}