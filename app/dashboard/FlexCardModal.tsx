"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { FlexCardNew as FlexCard } from "./FlexCardNew";
import { Sparkles } from "lucide-react";
import { 
  calculateClickPercentageChange, 
  getTodayDateString, 
  getYesterdayDateString 
} from "@/lib/analytics-utils";

interface FlexCardModalProps {
  projectId: string;
  projectName: string;
}

export function FlexCardModal({ projectId, projectName }: FlexCardModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<{
    percentChange: number;
    clicksToday: number;
    clicksYesterday: number;
    equippedDesignId: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectUrl, setProjectUrl] = useState<string | null>(null);

  const handleOpenFlexCard = async () => {
    setLoading(true);
    
    // Fetch project stats
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    
    // Get project to find owner and project URL
    const { data: project } = await supabase
      .from("projects")
      .select("user_id, url, equipped_design_id")
      .eq("id", projectId)
      .single();

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
    // Save project url for click-through in the flex card
    setProjectUrl(project?.url || null);
    setLoading(false);
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpenFlexCard}
        disabled={loading}
        className="group relative flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white text-sm font-bold rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95 min-w-[120px]"
      >
        <Sparkles size={18} className="animate-pulse flex-shrink-0" />
        <span className="whitespace-nowrap">{loading ? "Loading..." : "Flex"}</span>
        {!loading && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" 
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite'
            }}
          />
        )}
      </button>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {isOpen && stats && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={(e) => {
            // Only close if clicking the backdrop, not the card
            if (e.target === e.currentTarget) {
              setIsOpen(false);
              setProjectUrl(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <FlexCard
              projectName={projectName}
              percentChange={stats.percentChange}
              clicksToday={stats.clicksToday}
              clicksYesterday={stats.clicksYesterday}
              equippedDesignId={stats.equippedDesignId}
              url={projectUrl || undefined}
            />
          </div>
          {/* Close button */}
          <button
            onClick={() => { setIsOpen(false); setProjectUrl(null); }}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light transition-colors"
          >
            ×
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
