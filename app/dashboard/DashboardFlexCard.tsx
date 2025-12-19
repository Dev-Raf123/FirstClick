"use client";
import { useState, useEffect } from "react";
import { FlexCardNew as FlexCard } from "./FlexCardNew";
import { 
  calculateClickPercentageChange
} from "@/lib/analytics-utils";
import { createClient } from "@/lib/supabase/client";

interface DashboardFlexCardProps {
  projectId: string;
  projectName: string;
}

export function DashboardFlexCard({ projectId, projectName }: DashboardFlexCardProps) {
  const [stats, setStats] = useState<{
    percentChange: number;
    clicksToday: number;
    clicksYesterday: number;
    equippedDesignId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectUrl, setProjectUrl] = useState<string | null>(null);
  const [customBackground, setCustomBackground] = useState<{
    url: string;
    position: string;
    size: string;
    repeat: string;
  } | null>(null);
  const [textColor, setTextColor] = useState<'white' | 'black'>('white');
  

  useEffect(() => {
    const supabase = createClient();
    
    async function fetchStats() {
      // Get project to find owner, project URL, and custom background
      const { data: project } = await supabase
        .from("projects")
        .select("user_id, url, background_url, background_position, background_size, background_repeat, equipped_design_id, text_color")
        .eq("id", projectId)
        .single();

      // Set custom background if exists
      if (project?.background_url) {
        setCustomBackground({
          url: project.background_url,
          position: project.background_position || 'center',
          size: project.background_size || 'cover',
          repeat: project.background_repeat || 'no-repeat',
        });
      } else {
        setCustomBackground(null);
      }

      // Set text color
      setTextColor(project?.text_color as 'white' | 'black' || 'white');

      // Get equipped design from project
      let equippedDesignId = project?.equipped_design_id || 'classic';
      
      // Calculate UTC date ranges
      const now = new Date();
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
      const yesterdayEnd = new Date(todayEnd);
      yesterdayEnd.setUTCDate(yesterdayEnd.getUTCDate() - 1);

      // Fetch today's clicks
      const { count: todayCount } = await supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId)
        .gte("timestamp", todayStart.toISOString())
        .lte("timestamp", todayEnd.toISOString());

      // Fetch yesterday's clicks
      const { count: yesterdayCount } = await supabase
        .from("page_visits")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId)
        .gte("timestamp", yesterdayStart.toISOString())
        .lte("timestamp", yesterdayEnd.toISOString());

      const clicksToday = todayCount || 0;
      const clicksYesterday = yesterdayCount || 0;
      const percentChange = calculateClickPercentageChange(clicksToday, clicksYesterday);

      setStats({
        percentChange,
        clicksToday,
        clicksYesterday,
        equippedDesignId,
      });
      setProjectUrl(project?.url || null);
      setLoading(false);
    }

    fetchStats();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 10000);

    // Refresh when page becomes visible (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="w-full max-w-[420px] aspect-[3/4] rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <FlexCard
      projectName={projectName}
      percentChange={stats.percentChange}
      clicksToday={stats.clicksToday}
      clicksYesterday={stats.clicksYesterday}
      equippedDesignId={stats.equippedDesignId}
      url={projectUrl || undefined}
      customBackground={customBackground || undefined}
      textColor={textColor}
    />
  );
}
