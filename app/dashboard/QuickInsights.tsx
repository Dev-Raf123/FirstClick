"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, MousePointer2, Monitor, Smartphone, Globe } from "lucide-react";

interface QuickInsightsProps {
  projectId: string;
}

export function QuickInsights({ projectId }: QuickInsightsProps) {
  const [insights, setInsights] = useState<{
    trendingRank: number | null;
    topPage: string;
    topPageClicks: number;
    deviceBreakdown: { desktop: number; mobile: number; tablet: number };
    topReferrer: string;
    totalProjects: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      const supabase = createClient();

      // Get today's date range
      const now = new Date();
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
      const yesterdayEnd = new Date(todayEnd);
      yesterdayEnd.setUTCDate(yesterdayEnd.getUTCDate() - 1);

      // Fetch all projects for trending calculation
      const { data: allProjects } = await supabase.from("projects").select("id");
      
      // Calculate trending rank
      let rank = null;
      if (allProjects) {
        const projectStats = await Promise.all(
          allProjects.map(async (proj) => {
            const [{ count: todayCount }, { count: yesterdayCount }] = await Promise.all([
              supabase
                .from("page_visits")
                .select("*", { count: "exact", head: true })
                .eq("project_id", proj.id)
                .gte("timestamp", todayStart.toISOString())
                .lte("timestamp", todayEnd.toISOString()),
              supabase
                .from("page_visits")
                .select("*", { count: "exact", head: true })
                .eq("project_id", proj.id)
                .gte("timestamp", yesterdayStart.toISOString())
                .lte("timestamp", yesterdayEnd.toISOString())
            ]);

            const today = todayCount || 0;
            const yesterday = yesterdayCount || 0;
            const percent = yesterday === 0 ? (today > 0 ? 100 : 0) : ((today - yesterday) / yesterday) * 100;

            return { id: proj.id, percent };
          })
        );

        const sorted = projectStats
          .filter(p => p.percent > 0)
          .sort((a, b) => b.percent - a.percent);
        
        const position = sorted.findIndex(p => p.id === projectId);
        rank = position >= 0 ? position + 1 : null;
      }

      // Fetch page visits for this project (today)
      const { data: visits } = await supabase
        .from("page_visits")
        .select("url, referrer, user_agent")
        .eq("project_id", projectId)
        .gte("timestamp", todayStart.toISOString())
        .lte("timestamp", todayEnd.toISOString())
        .limit(10000);

      // Calculate top page
      const urlCounts: Record<string, number> = {};
      visits?.forEach((visit) => {
        urlCounts[visit.url] = (urlCounts[visit.url] || 0) + 1;
      });
      const topPageEntry = Object.entries(urlCounts).sort(([, a], [, b]) => b - a)[0];
      const topPage = topPageEntry ? topPageEntry[0] : "N/A";
      const topPageClicks = topPageEntry ? topPageEntry[1] : 0;

      // Calculate device breakdown
      let desktop = 0, mobile = 0, tablet = 0;
      visits?.forEach((visit) => {
        const ua = visit.user_agent?.toLowerCase() || "";
        if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
          mobile++;
        } else if (ua.includes("tablet") || ua.includes("ipad")) {
          tablet++;
        } else {
          desktop++;
        }
      });

      // Calculate top referrer
      const referrerCounts: Record<string, number> = {};
      visits?.forEach((visit) => {
        const ref = visit.referrer || "Direct";
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      });
      const topReferrerEntry = Object.entries(referrerCounts).sort(([, a], [, b]) => b - a)[0];
      const topReferrer = topReferrerEntry ? topReferrerEntry[0] : "Direct";

      setInsights({
        trendingRank: rank,
        topPage,
        topPageClicks,
        deviceBreakdown: { desktop, mobile, tablet },
        topReferrer,
        totalProjects: allProjects?.length || 0
      });
      setLoading(false);
    }

    fetchInsights();
  }, [projectId]);

  if (loading) {
    return (
      <div className="border border-neutral-700 rounded-xl bg-black p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Insights</h3>
        <div className="text-neutral-400">Loading insights...</div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="border border-neutral-700 rounded-xl bg-black p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <MousePointer2 className="w-5 h-5 text-indigo-400" />
        Quick Insights
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Trending Rank */}
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-neutral-400 uppercase font-semibold">Trending Rank</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {insights.trendingRank ? `#${insights.trendingRank}` : "N/A"}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            out of {insights.totalProjects} projects
          </div>
        </div>

        {/* Top Page */}
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-neutral-400 uppercase font-semibold">Top Page</span>
          </div>
          <div className="text-sm font-semibold text-white truncate" title={insights.topPage}>
            {insights.topPage}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {insights.topPageClicks} clicks today
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-neutral-400 uppercase font-semibold">Devices</span>
          </div>
          <div className="flex gap-3 text-xs">
            <div>
              <div className="text-white font-bold">{insights.deviceBreakdown.desktop}</div>
              <div className="text-neutral-500">Desktop</div>
            </div>
            <div>
              <div className="text-white font-bold">{insights.deviceBreakdown.mobile}</div>
              <div className="text-neutral-500">Mobile</div>
            </div>
            <div>
              <div className="text-white font-bold">{insights.deviceBreakdown.tablet}</div>
              <div className="text-neutral-500">Tablet</div>
            </div>
          </div>
        </div>

        {/* Top Referrer */}
        <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-neutral-400 uppercase font-semibold">Top Referrer</span>
          </div>
          <div className="text-sm font-semibold text-white truncate" title={insights.topReferrer}>
            {insights.topReferrer}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Today's main source
          </div>
        </div>
      </div>
    </div>
  );
}
