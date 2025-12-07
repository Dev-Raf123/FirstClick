"use client";
import Link from "next/link";

export default function FlexStorePage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold text-white mb-4">Flex Store Removed</h1>
      <p className="text-neutral-400 mb-6 text-lg">Paid designs and the Paddle integration have been removed.</p>
      <div className="flex gap-3">
        <Link href="/dashboard/trending" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Browse Trending</Link>
        <Link href="/dashboard/library" className="bg-neutral-800 text-white px-4 py-2 rounded-md hover:bg-neutral-700">My Library</Link>
      </div>
    </div>
  );
}
