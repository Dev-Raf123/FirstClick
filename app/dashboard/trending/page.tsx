"use client";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { MousePointer2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeChallenges, setActiveChallenges] = useState<Set<string>>(new Set());
  const [challengeData, setChallengeData] = useState<Map<string, any>>(new Map());
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [victoryData, setVictoryData] = useState<{targetName: string, newRank: number} | null>(null);
  const [showFlexModal, setShowFlexModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [, forceUpdate] = useState({});

  // Update timer every 5 seconds instead of every second for better performance
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

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
      const dayBeforeStart = new Date(yesterdayStart);
      dayBeforeStart.setUTCDate(dayBeforeStart.getUTCDate() - 1);
      const dayBeforeEnd = new Date(yesterdayStart);
      dayBeforeEnd.setUTCMilliseconds(-1);

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
        setCurrentUserId(user.id);
        
        // Check onboarding status
        const { data: onboardingData } = await supabase
          .from('trending_onboarding')
          .select('completed')
          .eq('user_id', user.id)
          .single();
        
        // Show onboarding if not completed
        if (!onboardingData || !onboardingData.completed) {
          setShowOnboarding(true);
        }
        
        // Fetch active challenges for this user
        const { data: challenges } = await supabase
          .from('click_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true);
        
        if (challenges) {
          setActiveChallenges(new Set(challenges.map(c => c.target_project_id)));
          const challengeMap = new Map();
          challenges.forEach(c => challengeMap.set(c.target_project_id, c));
          setChallengeData(challengeMap);
        }
      }

      if (!projects || projects.length === 0) {
        setLoading(false);
        return;
      }

      // Designs will be read from each project's equipped_design_id field

      // Get counts for each project using proper count queries
      const todayCounts: Record<string, number> = {};
      const yesterdayCounts: Record<string, number> = {};
      const dayBeforeCounts: Record<string, number> = {};
      
      await Promise.all(
        projects.map(async (project) => {
          const [todayResult, yesterdayResult, dayBeforeResult] = await Promise.all([
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
              .lte("timestamp", yesterdayEnd.toISOString()),
            supabase
              .from("page_visits")
              .select("*", { count: "exact", head: true })
              .eq("project_id", project.id)
              .gte("timestamp", dayBeforeStart.toISOString())
              .lte("timestamp", dayBeforeEnd.toISOString())
          ]);
          
          todayCounts[project.id] = todayResult.count || 0;
          yesterdayCounts[project.id] = yesterdayResult.count || 0;
          dayBeforeCounts[project.id] = dayBeforeResult.count || 0;
        })
      );

      // Calculate percent change for each project
      const trendingData = projects.map((project) => {
        const clicksToday = todayCounts[project.id] || 0;
        const clicksYesterday = yesterdayCounts[project.id] || 0;
        const clicksDayBefore = dayBeforeCounts[project.id] || 0;
        const percent = calculateClickPercentageChange(clicksToday, clicksYesterday);

        // Get equipped design from project
        const equippedDesignId = project.equipped_design_id || 'classic';
        const designConfig = flexCardConfigs[equippedDesignId] || flexCardConfigs['classic'];

        return {
          ...project,
          percent,
          clicksToday,
          clicksPrev: clicksYesterday,
          clicksDayBefore,
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

      // Calculate yesterday's rankings for movement indicators
      const yesterdayTrendingData = trendingData.map(project => ({
        ...project,
        percent: calculateClickPercentageChange(project.clicksPrev, project.clicksDayBefore),
        clicksToday: project.clicksPrev,
      }));
      
      const yesterdayRankings = yesterdayTrendingData
        .filter(project => project.percent !== 0)
        .sort((a, b) => {
          if (b.percent !== a.percent) return b.percent - a.percent;
          return b.clicksToday - a.clicksToday;
        });
      
      const yesterdayRankMap = new Map();
      yesterdayRankings.forEach((proj, idx) => {
        yesterdayRankMap.set(proj.id, idx + 1);
      });

      // Filter out 0% projects and sort by percent descending, then by clicks today descending (tiebreaker)
      const filteredData = trendingData
        .filter(project => project.percent !== 0)
        .sort((a, b) => {
          // Primary sort: by percentage (descending)
          if (b.percent !== a.percent) {
            return b.percent - a.percent;
          }
          // Secondary sort (tiebreaker): by today's clicks (descending)
          return b.clicksToday - a.clicksToday;
        })
        .map((project, idx) => {
          const todayRank = idx + 1;
          const yesterdayRank = yesterdayRankMap.get(project.id);
          let rankChange = null; // null means no previous rank data
          if (yesterdayRank) {
            rankChange = yesterdayRank - todayRank; // Positive = moved up, Negative = moved down
          }
          return {
            ...project,
            rankChange,
          };
        });

      setTrending(filteredData);
      
      // Check if user has won any active challenges
      if (user?.id) {
        const { data: activeChallenges } = await supabase
          .from('click_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true);
        
        if (activeChallenges && activeChallenges.length > 0) {
          for (const challenge of activeChallenges) {
            const userProjectRank = filteredData.findIndex(p => p.id === challenge.user_project_id);
            const targetProjectRank = filteredData.findIndex(p => p.id === challenge.target_project_id);
            const challengeExpired = new Date(challenge.expires_at) < new Date();
            
            // User won if their project ranks higher than target (lower index)
            if (userProjectRank !== -1 && targetProjectRank !== -1 && userProjectRank < targetProjectRank && !challengeExpired) {
              // Mark challenge as won
              await supabase
                .from('click_challenges')
                .update({ active: false, won: true, completed_at: new Date().toISOString() })
                .eq('id', challenge.id);
              
              // Show victory modal
              setVictoryData({
                targetName: challenge.target_project_name,
                newRank: userProjectRank + 1
              });
              setShowVictoryModal(true);
              break; // Show one victory at a time
            } else if (challengeExpired) {
              // Challenge expired
              await supabase
                .from('click_challenges')
                .update({ active: false, won: false, completed_at: new Date().toISOString() })
                .eq('id', challenge.id);
            }
          }
        }
      }
      
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
      <main className="bg-neutral-950 py-12 px-6" style={{ zoom: 0.67 }}>
      <div className="max-w-[1600px] mx-auto pause-animations">
        
        {/* User's Rank Display */}
        {currentUserId && trending.some(p => p.user_id === currentUserId) && (() => {
          
          const userRankIndex = trending.findIndex(p => p.user_id === currentUserId);
          const userProject = trending.find(p => p.user_id === currentUserId);
          const activeChallenge = Array.from(challengeData.values())[0];
          
          return (
            <div className="mb-12">
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600">
                    #{userRankIndex + 1}
                  </div>
                  <div>
                    <div className="text-sm text-neutral-500 uppercase tracking-wide font-semibold mb-1">Your Ranking</div>
                    <div className="text-2xl text-white font-bold mb-3">
                      {userProject?.name}
                    </div>
                    <button 
                      onClick={() => {
                        const userCard = document.getElementById(`project-${userProject?.id}`);
                        userCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    >
                      Go to Project 
                    </button>
                  </div>
                </div>
                
                {/* Active Challenge Timer */}
                {activeChallenges.size > 0 && activeChallenge && (() => {
                  const expiresAt = new Date(activeChallenge.expires_at);
                  const now = new Date();
                  const timeLeft = expiresAt.getTime() - now.getTime();
                  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                  const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
                  
                  if (timeLeft > 0) {
                    return (
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-5 rounded-2xl shadow-2xl ml-auto">
                        <div className="flex items-center gap-6">
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">Challenge</div>
                            <div className="text-lg font-black">
                              {userProject?.name || 'You'} <span className="opacity-75 text-base">vs</span> {activeChallenge.target_project_name}
                            </div>
                          </div>
                          <div className="border-l-2 border-white/40 pl-6 ml-6">
                            <div className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">Time Left</div>
                            <div className="text-4xl font-black font-mono tabular-nums">
                              {String(hoursLeft).padStart(2, '0')}:{String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            
            {/* Projects to Watch Section */}
            {trending.findIndex(p => p.user_id === currentUserId) >= 2 && (
              <div className="border-t border-neutral-800 pt-8">
                <div className="mb-4">
                  <h3 className="text-xl text-white font-bold mb-1">Projects to Watch</h3>
                  <p className="text-neutral-400 text-sm">Closest projects ahead of you</p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {(() => {
                    const userRank = trending.findIndex(p => p.user_id === currentUserId);
                    const userProject = trending[userRank];
                    const userPercent = userProject?.percent || 0;
                    const projectsToWatch = trending.slice(Math.max(0, userRank - 3), userRank);
                    return projectsToWatch.map((proj, idx) => {
                      const actualRank = Math.max(0, userRank - 3) + idx + 1;
                      const percentGap = proj.percent - userPercent;
                      const gapText = percentGap > 0 
                        ? `Reach +${percentGap.toFixed(1)}% to pass`
                        : `You're ${Math.abs(percentGap).toFixed(1)}% behind`;
                      
                      return (
                        <div 
                          key={proj.id}
                          onClick={() => {
                            const targetCard = document.getElementById(`project-${proj.id}`);
                            targetCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="min-w-[200px] p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl cursor-pointer hover:from-orange-500/20 hover:to-red-500/20 transition-all"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-xs font-bold text-white">
                              {actualRank}
                            </div>
                            <span className="text-orange-400 text-xs font-semibold uppercase tracking-wide">Watch</span>
                          </div>
                          <h4 className="text-white font-bold mb-1 truncate">{proj.name}</h4>
                          <p className="text-neutral-400 text-xs mb-2">{proj.percent}% growth</p>
                          <p className="text-orange-300 text-xs font-semibold">{gapText}</p>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            
            {/* Call-to-Action Section */}
            <div className="border-t border-neutral-800 pt-8 mt-8">
              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Boost your momentum</h3>
                    <p className="text-neutral-400 text-sm">Share your trending card on social media to drive more clicks and climb higher</p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/UserProjects/${userProject?.id}`}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/50 whitespace-nowrap"
                    >
                      View Full Breakdown
                    </Link>
                    <button
                      onClick={() => setShowFlexModal(true)}
                      className="px-8 py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 text-white font-black text-lg rounded-xl transition-all duration-200 transform hover:scale-110 shadow-[0_0_30px_rgba(251,146,60,0.6)] hover:shadow-[0_0_40px_rgba(251,146,60,0.8)] whitespace-nowrap animate-pulse"
                    >
                      💪 FLEX
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })()}
        
        {/* Strict Grid Leaderboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {trending.map((proj, idx) => {
            const isTop3 = idx < 3;
            const isUserProject = proj.user_id === currentUserId;
            const rank = idx + 1;
            
            // Check if this is a "project to watch" (2-3 projects ahead of user)
            const userRank = trending.findIndex(p => p.user_id === currentUserId);
            const isProjectToWatch = userRank >= 2 && idx >= Math.max(0, userRank - 3) && idx < userRank;
            
            // Check if user can track against this project (it's ahead of them and not their own)
            const canTrackAgainst = !isUserProject && userRank !== -1 && idx < userRank;
            const isChallengeActive = activeChallenges.has(proj.id);
            
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
                <div key={proj.id} id={`project-${proj.id}`} className="relative">
                  {/* User's Project Indicator */}
                  {isUserProject && (
                    <div className="absolute top-3 right-3 z-30 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg animate-pulse">
                      Your Project
                    </div>
                  )}
                  
                  {/* Project to Watch Indicator */}
                  {isProjectToWatch && (
                    <div className="absolute top-3 right-3 z-30 bg-orange-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-md">
                      Watch
                    </div>
                  )}
                  
                  {/* Highlight border for user's project or projects to watch */}
                  <div className={`${
                    isUserProject 
                      ? 'ring-4 ring-indigo-500 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.5)] transform scale-[1.02]' 
                      : isProjectToWatch 
                        ? 'ring-2 ring-orange-500/50 rounded-3xl' 
                        : ''
                  } relative`}>
                    {/* Rank Badge - Outside card on top left */}
                    <div className="absolute -top-2 -left-2 z-30 flex items-center gap-1">
                      <div className={`${
                        isTop3 
                          ? 'w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600' 
                          : 'w-6 h-6 rounded-md bg-neutral-800'
                      } flex items-center justify-center text-xs font-bold shadow-lg ${
                        isTop3 ? 'text-black' : 'text-white'
                      }`}>
                        {rank}
                      </div>
                      {/* Movement Indicator */}
                      {proj.rankChange !== null && proj.rankChange !== undefined && proj.rankChange !== 0 && (
                        <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold shadow-md ${
                          proj.rankChange > 0 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {proj.rankChange > 0 ? '↑' : '↓'} {Math.abs(proj.rankChange)}
                        </div>
                      )}
                      {proj.rankChange === 0 && (
                        <div className="w-2 h-2 rounded-full bg-neutral-500" title="No change"></div>
                      )}
                    </div>
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
                      projectId={proj.id}
                      canTrackAgainst={canTrackAgainst && !isChallengeActive && activeChallenges.size === 0}
                      onTrackAgainst={() => {
                        if (activeChallenges.size > 0) {
                          alert('You can only track against one project at a time. Complete your current challenge first!');
                          return;
                        }
                        setSelectedProject(proj);
                        setShowTimerModal(true);
                      }}
                    />
                  </div>
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
    
    {/* Timer Selection Modal */}
    {showTimerModal && selectedProject && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowTimerModal(false)}>
        <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full z-[201]" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold text-white mb-1.5">Choose Challenge Duration</h2>
          <p className="text-neutral-400 text-sm mb-5">How long do you want to compete against <span className="text-white font-semibold">{selectedProject.name}</span>?</p>
          
          <div className="space-y-3">
            {[3, 12, 24].map(hours => (
              <button
                key={hours}
                onClick={async () => {
                  if (!currentUserId) return;
                  const supabase = createClient();
                  const expiresAt = new Date();
                  expiresAt.setHours(expiresAt.getHours() + hours);
                  
                  const challengeRecord = {
                    user_id: currentUserId,
                    user_project_id: trending.find(p => p.user_id === currentUserId)?.id,
                    target_project_id: selectedProject.id,
                    target_project_name: selectedProject.name,
                    active: true,
                    duration_hours: hours,
                    expires_at: expiresAt.toISOString(),
                    created_at: new Date().toISOString()
                  };
                  
                  const { error } = await supabase
                    .from('click_challenges')
                    .insert(challengeRecord);
                  
                  if (!error) {
                    setActiveChallenges(prev => new Set([...prev, selectedProject.id]));
                    setChallengeData(prev => new Map(prev).set(selectedProject.id, challengeRecord));
                    setShowTimerModal(false);
                    setSelectedProject(null);
                  }
                }}
                className="w-full p-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-between cursor-pointer"
              >
                <span>{hours === 24 ? '1 Day' : `${hours} Hours`}</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              setShowTimerModal(false);
              setSelectedProject(null);
            }}
            className="w-full mt-4 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
    
    {/* Victory Modal */}
    {showVictoryModal && victoryData && (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowVictoryModal(false)}>
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-indigo-400 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Confetti animation background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute top-0 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-5xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-3xl font-black text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">Victory!</h2>
            <p className="text-lg text-white mb-1.5">You've overtaken</p>
            <p className="text-2xl font-bold text-indigo-300 mb-3">{victoryData.targetName}</p>
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-3 mb-5">
              <p className="text-neutral-300 text-xs mb-1">Your New Rank</p>
              <p className="text-4xl font-black text-white">#{victoryData.newRank}</p>
            </div>
            <p className="text-neutral-300 text-sm mb-6">Keep up the momentum and climb even higher!</p>
            <button
              onClick={() => setShowVictoryModal(false)}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Awesome! 🎉
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* Flex Card Modal */}
    {showFlexModal && currentUserId && (() => {
      const userProject = trending.find(p => p.user_id === currentUserId);
      if (!userProject) return null;
      
      const userRankIndex = trending.findIndex(p => p.user_id === currentUserId);
      
      // Dynamically import DashboardFlexCard
      const DashboardFlexCardComponent = require("../DashboardFlexCard").DashboardFlexCard;
      
      return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowFlexModal(false)} style={{ zoom: 1 }}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowFlexModal(false)}
              className="absolute -top-4 -right-4 z-50 w-10 h-10 bg-white rounded-full flex items-center justify-center text-neutral-900 hover:bg-neutral-200 transition-all shadow-lg font-bold text-xl"
            >
              ✕
            </button>
            
            <div className="text-center mb-3" style={{ zoom: 1 }}>
              <h2 className="text-2xl font-black text-white mb-1">Flex Your Card</h2>
              <p className="text-neutral-400 text-sm">Rank #{userRankIndex + 1} • {userProject.percent > 0 ? '+' : ''}{userProject.percent}% Growth</p>
            </div>
            
            {/* Embedded Flex Card - Reset zoom to normal */}
            <div style={{ zoom: 1 }}>
              <DashboardFlexCardComponent projectId={userProject.id} projectName={userProject.name} />
            </div>
            
            <p className="text-center text-neutral-300 mt-3 text-sm" style={{ zoom: 1 }}>👇 Click the download button on the card to save and share</p>
          </div>
        </div>
      );
    })()}
    
    {/* Onboarding Modal */}
    {showOnboarding && currentUserId && (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[300] flex items-center justify-center p-4" style={{ zoom: 1 }}>
        <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 border-2 border-indigo-500 rounded-3xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === onboardingStep ? 'bg-indigo-500 w-8' : step < onboardingStep ? 'bg-indigo-500/50' : 'bg-neutral-700'
                }`}
              />
            ))}
          </div>

          {/* Step 0: Welcome */}
          {onboardingStep === 0 && (
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-4xl font-black text-white mb-4">Welcome to Trending!</h2>
              <p className="text-neutral-300 text-lg mb-8">
                Compete with other projects, climb the leaderboard, and flex your growth. Let's show you how it works!
              </p>
              <button
                onClick={() => setOnboardingStep(1)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Let's Go! 🚀
              </button>
            </div>
          )}

          {/* Step 1: Ranking System */}
          {onboardingStep === 1 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">📊</div>
                <div>
                  <h2 className="text-3xl font-black text-white">How Rankings Work</h2>
                  <p className="text-indigo-400 font-semibold">Growth percentage + Click count tiebreaker</p>
                </div>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-6 mb-6 border border-neutral-700">
                <p className="text-neutral-300 mb-4">
                  Rankings are based on your <span className="text-green-400 font-bold">growth percentage</span> (today vs yesterday).
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">+100%</span>
                    <span className="text-neutral-400">→ 10 clicks yesterday, 20 today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">+50%</span>
                    <span className="text-neutral-400">→ 100 clicks yesterday, 150 today</span>
                  </div>
                </div>
                <p className="text-neutral-400 mt-4 text-sm">
                  💡 If two projects have the same percentage, the one with <span className="text-white font-semibold">more total clicks today</span> ranks higher.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setOnboardingStep(0)}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Movement Indicators */}
          {onboardingStep === 2 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">📈</div>
                <div>
                  <h2 className="text-3xl font-black text-white">Track Your Momentum</h2>
                  <p className="text-indigo-400 font-semibold">See who's rising and falling</p>
                </div>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-6 mb-6 border border-neutral-700">
                <p className="text-neutral-300 mb-4">Movement indicators show rank changes from yesterday:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-neutral-900/50 p-3 rounded-lg">
                    <div className="px-2 py-1 rounded bg-green-500 text-white text-sm font-bold">↑ +2</div>
                    <span className="text-neutral-300">Moved up 2 positions</span>
                  </div>
                  <div className="flex items-center gap-3 bg-neutral-900/50 p-3 rounded-lg">
                    <div className="px-2 py-1 rounded bg-red-500 text-white text-sm font-bold">↓ -1</div>
                    <span className="text-neutral-300">Fell down 1 position</span>
                  </div>
                  <div className="flex items-center gap-3 bg-neutral-900/50 p-3 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-neutral-500"></div>
                    <span className="text-neutral-300">Same rank as yesterday</span>
                  </div>
                  <div className="flex items-center gap-3 bg-neutral-900/50 p-3 rounded-lg">
                    <span className="text-neutral-500 text-sm italic">No indicator</span>
                    <span className="text-neutral-300">New to trending today</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setOnboardingStep(1)}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setOnboardingStep(3)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Click Challenges */}
          {onboardingStep === 3 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">⚔️</div>
                <div>
                  <h2 className="text-3xl font-black text-white">Click Challenges</h2>
                  <p className="text-indigo-400 font-semibold">Compete against projects ahead of you</p>
                </div>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-6 mb-6 border border-neutral-700">
                <p className="text-neutral-300 mb-4">
                  Challenge any project ranked above you. Pick a duration (3h, 12h, or 24h) and race to overtake them!
                </p>
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold">Your Project vs Target</span>
                    <span className="text-orange-400 font-mono text-sm">⏱️ 12:45:30</span>
                  </div>
                  <p className="text-neutral-300 text-sm">Climb past them before time runs out to win! 🏆</p>
                </div>
                <p className="text-neutral-400 text-sm">
                  💡 You can only have <span className="text-white font-semibold">one active challenge</span> at a time.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setOnboardingStep(4)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Flex Your Card */}
          {onboardingStep === 4 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">💪</div>
                <div>
                  <h2 className="text-3xl font-black text-white">Flex Your Growth</h2>
                  <p className="text-indigo-400 font-semibold">Share on social media to boost clicks</p>
                </div>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-6 mb-6 border border-neutral-700">
                <p className="text-neutral-300 mb-4">
                  Click the <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-lg text-sm">💪 FLEX</span> button to download your trending card.
                </p>
                <div className="bg-neutral-900/50 rounded-lg p-4 mb-4">
                  <p className="text-neutral-300 text-sm mb-2">✨ Your card includes:</p>
                  <ul className="text-neutral-400 text-sm space-y-1 ml-4">
                    <li>• Your current rank</li>
                    <li>• Growth percentage</li>
                    <li>• Today vs yesterday clicks</li>
                    <li>• Your project branding</li>
                  </ul>
                </div>
                <p className="text-neutral-300 text-sm">
                  <span className="text-green-400 font-bold">Pro tip:</span> Share your card on Twitter, LinkedIn, or Reddit to drive more clicks and climb higher! 🚀
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setOnboardingStep(3)}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    // Mark onboarding as completed
                    await supabase
                      .from('trending_onboarding')
                      .upsert({
                        user_id: currentUserId,
                        completed: true,
                        completed_at: new Date().toISOString()
                      }, {
                        onConflict: 'user_id'
                      });
                    setShowOnboarding(false);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  Done! Let's Go 🎉
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}