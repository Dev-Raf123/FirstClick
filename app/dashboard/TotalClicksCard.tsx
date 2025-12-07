"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface TotalClicksCardProps {
  projectIds: string[];
  initialTotalViews: number;
}

export function TotalClicksCard({ projectIds, initialTotalViews }: TotalClicksCardProps) {
  const [totalViews, setTotalViews] = useState(initialTotalViews);

  useEffect(() => {
    const supabase = createClient();

    async function fetchTotalClicks() {
      if (projectIds.length === 0) {
        setTotalViews(0);
        return;
      }

      const { count } = await supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true })
        .in("project_id", projectIds);

      const total = count || 0;
      setTotalViews(total);
      console.log('[TOTAL CLICKS] Updated:', total);
    }

    fetchTotalClicks();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      console.log('[TOTAL CLICKS] Auto-refreshing...');
      fetchTotalClicks();
    }, 10000);

    // Refresh when page becomes visible (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[TOTAL CLICKS] Page became visible, refetching...');
        fetchTotalClicks();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [projectIds]);

  return (
    <section className="w-full md:w-80 border border-neutral-700 rounded-xl bg-neutral-900/80 p-4 sm:p-6 shadow-lg flex flex-col items-center justify-center mb-4 md:mb-0">
      <h2 className="text-lg font-bold text-white mb-2 text-center">Total Clicks On All Projects</h2>
      <span className="text-4xl font-extrabold text-white">{totalViews}</span>
    </section>
  );
}
