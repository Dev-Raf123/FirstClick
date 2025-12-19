"use client";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { MousePointer2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { calculateClickPercentageChange } from "@/lib/analytics-utils";
import { ImageCard } from "@/components/ImageCard";

// Flex card design configurations
interface FlexCardConfig {
  gradient: string;
  pattern: string;
  glowColor: string;
  customStyle?: React.CSSProperties;
  image?: string;
}

const flexCardConfigs: Record<string, FlexCardConfig> = {
  'Abyssal-Waves': {
    gradient: '',
    pattern: 'image',
    glowColor: 'rgba(99,102,241,0.5)',
    image: '/116a690e6c1e4e1de9ebd801475d990c.jpg',
    customStyle: {
      background: 'none'
    }
  },
  'classic': {
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    pattern: 'dots',
    glowColor: 'rgba(99,102,241,0.5)'
  },
  'gold-metal': {
    gradient: 'metallic-gold',
    pattern: 'metallic',
    glowColor: 'rgba(255,215,0,0.9)',
    customStyle: {
      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 20%, #f5b800 40%, #ffe55c 60%, #d4af37 80%, #ffd700 100%)',
      backgroundSize: '400% 400%'
    }
  },
  'frosted-glass': {
    gradient: 'glass-frosted',
    pattern: 'glass',
    glowColor: 'rgba(255,255,255,0.3)',
    customStyle: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
      backdropFilter: 'blur(50px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)'
    }
  },
  // Removed chrome-metal and aurora-glass designs as requested
  'carbon-fiber': {
    gradient: 'material-carbon',
    pattern: 'carbon',
    glowColor: 'rgba(64,64,64,0.7)',
    customStyle: {
      background: 'repeating-linear-gradient(45deg, #1a1a1a 0px, #2d2d2d 2px, #1a1a1a 4px)',
      backgroundSize: '5px 5px'
    }
  },
  'holographic': {
    gradient: 'special-holo',
    pattern: 'hologram',
    glowColor: 'rgba(0,255,255,0.7)',
    customStyle: {
      background: 'linear-gradient(45deg, #ff0080 0%, #ff8c00 20%, #40e0d0 40%, #9370db 60%, #ff1493 80%, #ff0080 100%)',
      backgroundSize: '400% 400%',
      filter: 'contrast(1.2) brightness(1.1)'
    }
  },
  'neon-glass': {
    gradient: 'glass-neon',
    pattern: 'glass',
    glowColor: 'rgba(236,72,153,0.8)',
    customStyle: {
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(14, 165, 233, 0.12) 100%)',
      backdropFilter: 'blur(30px) saturate(150%)',
      border: '1px solid rgba(6, 182, 212, 0.3)',
      boxShadow: '0 0 40px rgba(6, 182, 212, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 8px 32px 0 rgba(6, 182, 212, 0.15)'
    }
  },
  'rose-gold': {
    gradient: 'metallic-rose-gold',
    pattern: 'metallic',
    glowColor: 'rgba(255,192,203,0.8)',
    customStyle: {
      background: 'linear-gradient(135deg, #f4c2c2 0%, #ffb6c1 25%, #ffc0cb 50%, #e6b8af 75%, #d4a5a5 100%)',
      backgroundSize: '400% 400%'
    }
  },
  'custom-image': {
    gradient: '',
    pattern: 'image',
    glowColor: 'rgba(99,102,241,0.5)',
    image: '/116a690e6c1e4e1de9ebd801475d990c.jpg',
    customStyle: {
      background: 'none'
    }
  }
};

export default function TrendingProjectsPage() {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {

    async function fetchTrending() {
      const supabase = createClient();
      
      // Calculate UTC date ranges for today and yesterday
      const now = new Date();
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
      const yesterdayEnd = new Date(todayStart);
      yesterdayEnd.setUTCMilliseconds(-1);

      // OPTIMIZATION: Fetch all data in parallel instead of sequentially
      const [
        { data: { user } },
        { data: projects }
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("projects").select("id, name, description, url, user_id, background_url, background_position, background_size, background_repeat, equipped_design_id, text_color")
      ]);
      
      if (user) {
        setUserEmail(user.email || null);
      }

      if (!projects || projects.length === 0) {
        setLoading(false);
        return;
      }

      // Designs will be read from each project's equipped_design_id field

      // Get counts for each project using proper count queries
      const todayCounts: Record<string, number> = {};
      const yesterdayCounts: Record<string, number> = {};
      
      await Promise.all(
        projects.map(async (project) => {
          const [todayResult, yesterdayResult] = await Promise.all([
            supabase
              .from("page_visits")
              .select("*", { count: "exact", head: true })
              .eq("project_id", project.id)
              .gte("timestamp", todayStart.toISOString())
              .lte("timestamp", todayEnd.toISOString()),
            supabase
              .from("page_visits")
              .select("*", { count: "exact", head: true })
              .eq("project_id", project.id)
              .gte("timestamp", yesterdayStart.toISOString())
              .lte("timestamp", yesterdayEnd.toISOString())
          ]);
          
          todayCounts[project.id] = todayResult.count || 0;
          yesterdayCounts[project.id] = yesterdayResult.count || 0;
        })
      );

      // Calculate percent change for each project
      const trendingData = projects.map((project) => {
        const clicksToday = todayCounts[project.id] || 0;
        const clicksYesterday = yesterdayCounts[project.id] || 0;
        const percent = calculateClickPercentageChange(clicksToday, clicksYesterday);

        // Get equipped design from project
        const equippedDesignId = project.equipped_design_id || 'classic';
        const designConfig = flexCardConfigs[equippedDesignId] || flexCardConfigs['classic'];

        return {
          ...project,
          percent,
          clicksToday,
          clicksPrev: clicksYesterday,
          prevDay: 'yesterday',
          equippedDesignId,
          designConfig,
          // Explicitly include background fields (already in ...project, but for clarity)
          background_url: project.background_url,
          background_position: project.background_position,
          background_size: project.background_size,
          background_repeat: project.background_repeat,
        };
      });

      // Filter out 0% projects and sort by percent descending
      const filteredData = trendingData
        .filter(project => project.percent !== 0)
        .sort((a, b) => b.percent - a.percent);

      setTrending(filteredData);
      setLoading(false);
    }

    fetchTrending();
    
    // ...existing code...
    const interval = setInterval(() => {
      fetchTrending();
    }, 60000);

    // Refresh when page becomes visible (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchTrending();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <MousePointer2 className="w-16 h-16 text-indigo-400 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .pause-animations, .pause-animations * {
          animation-play-state: paused !important;
        }
      `}</style>
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] w-full border-b border-neutral-800 bg-neutral-900/80 px-2 sm:px-4 py-0 mb-8 backdrop-blur">
        <div className="flex flex-row items-center gap-8 h-12">
          {/* Horizontal nav tabs */}
          <div className="flex gap-2 h-full">
            <Link href="/dashboard/trending" className="relative flex items-center h-full px-4 text-white font-semibold hover:text-indigo-400 transition-colors">
              <span>Trending</span>
              {/* Active underline */}
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-white rounded transition-all duration-200" style={{ opacity: "1" }} />
            </Link>
            <Link href="/dashboard" className="relative flex items-center h-full px-4 text-neutral-400 font-semibold hover:text-indigo-400 transition-colors">
              <span>Dashboard</span>
            </Link>
            {/* Flex Store link removed */}
            <Link href="/dashboard/library" className="relative flex items-center h-full px-4 text-neutral-400 font-semibold hover:text-indigo-400 transition-colors">
              <span>Library</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <MousePointer2 className="w-7 h-7 text-white -scale-x-100" />
            <span className="border border-indigo-500 text-indigo-400 text-xs px-2 py-0.5 rounded uppercase font-semibold tracking-wide ml-1">
              beta
            </span>
            <span className="text-white text-2xl font-bold">/</span>
            {userEmail ? (
              <div className="flex items-center gap-4">
                <span className="text-white font-medium bg-neutral-800 px-4 py-2 rounded-full">
                  {userEmail}
                </span>
                <LogoutButton />
              </div>
            ) : (
              <Link href="/auth/login" className="text-white hover:text-indigo-400">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="min-h-screen bg-neutral-950 py-12 px-6">
      <div className="max-w-[1600px] mx-auto pause-animations">
        

        {/* Strict Grid Leaderboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {trending.map((proj, idx) => {
            const isTop3 = idx < 3;
            const medalEmoji = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
            
            // Get pattern style based on equipped design
            const getPatternStyle = (pattern: string) => {
              switch (pattern) {
                case 'dots':
                  return {
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                  };
                case 'grid':
                  return {
                    backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                  };
                case 'metallic':
                  return {
                    backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    backgroundSize: '200% 100%'
                  };
                case 'glass':
                  return {
                    backdropFilter: 'blur(20px)',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                  };
                case 'carbon':
                  return {
                    backgroundImage: 'repeating-linear-gradient(0deg, #2a2a2a 0px, #2a2a2a 1px, #1a1a1a 1px, #1a1a1a 2px)',
                  };
                case 'hologram':
                  return {
                    background: 'linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff)',
                    backgroundSize: '200% 200%'
                  };
                default:
                  return {
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                  };
              }
            };

            // Calculate glow intensity
            const getGlowIntensity = (percent: number) => {
              if (percent < 0) return { base: 20, hover: 30 };
              if (percent === 0) return { base: 15, hover: 20 };
              if (percent >= 1000) return { base: 50, hover: 70 };
              if (percent >= 500) return { base: 40, hover: 60 };
              if (percent >= 100) return { base: 30, hover: 50 };
              return { base: 20, hover: 35 };
            };
            
            const glow = getGlowIntensity(proj.percent);
            
            // Override colors for negative/zero growth, but keep the custom design style
            let cardStyle: React.CSSProperties = {
              boxShadow: `0 0 ${glow.base}px ${proj.designConfig.glowColor}`,
            };
            
            let baseGradient = '';
            
            if (proj.percent < 0) {
              // Red gradient for negative growth
              cardStyle = {
                ...cardStyle,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)',
              };
            } else if (proj.percent === 0) {
              // Gray gradient for zero growth
              cardStyle = {
                ...cardStyle,
                background: 'linear-gradient(135deg, #525252 0%, #404040 50%, #262626 100%)',
              };
            } else {
              // Use equipped design's custom style
              if (proj.designConfig.customStyle) {
                cardStyle = {
                  ...cardStyle,
                  ...proj.designConfig.customStyle
                };
              } else if (proj.designConfig.gradient.startsWith('from-')) {
                baseGradient = `bg-gradient-to-br ${proj.designConfig.gradient}`;
              }
            }
            
            // Render default image card for all designs (user requested default image for trending cards)
            // Use the equipped design's image if available, or custom background if set
            const imageSrc = proj.designConfig.pattern === 'image' && proj.designConfig.image
              ? proj.designConfig.image
              : "/664b6af1e2428aed06246af0c6581efb.jpg";
            
            // Build custom background object if background_url exists
            const customBg = proj.background_url ? {
              url: proj.background_url,
              position: proj.background_position || 'center',
              size: proj.background_size || 'cover',
              repeat: proj.background_repeat || 'no-repeat',
            } : undefined;

            return (
                <div key={proj.id} className="relative">

                  <ImageCard
                    image={imageSrc}
                    name={proj.name}
                    description={proj.description}
                    percent={proj.percent}
                    clicksToday={proj.clicksToday}
                    clicksPrev={proj.clicksPrev}
                    date={new Date().toLocaleDateString()}
                    url={proj.url}
                    customBackground={customBg}
                    textColor={proj.text_color as 'white' | 'black' || 'white'}
                  />
                </div>
            );
          })}
        </div>

        {trending.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">No trending projects yet. Start tracking!</p>
          </div>
        )}
      </div>
    </main>
    </>
  );
}