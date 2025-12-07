"use client";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { MousePointer2, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface FlexCardDesign {
  id: string;
  name: string;
  description: string;
  price: number;
  gradient: string;
  icon: string;
  badge: string;
  pattern: string;
  glowColor: string;
  tier: 'basic' | 'premium' | 'elite' | 'legendary';
  image?: string; // Optional image for image-based cards
}

const flexCardDesigns: FlexCardDesign[] = [
  {
    id: 'Arora Waves',
    name: 'Arora Waves',
    description: 'The original flex card design',
    price: 0,
    gradient: '',
    icon: '',
    badge: 'Free',
    pattern: 'image',
    glowColor: 'rgba(99,102,241,0.5)',
    tier: 'basic',
    image: '/664b6af1e2428aed06246af0c6581efb.jpg',
  },
  
    {
      id: 'Abyssal-Waves',
      name: 'Abyssal Waves',
      description: 'Dive into the deep with this dark, wave-themed design.',
      price: 0,
      gradient: '',
      icon: '',
      badge: 'Free',
      pattern: 'image',
      glowColor: 'rgba(99,102,241,0.5)',
      tier: 'basic',
      image: '/116a690e6c1e4e1de9ebd801475d990c.jpg'
    },
  
  
  
  
];

export default function LibraryPage() {
  const [equippedDesignId, setEquippedDesignId] = useState<string>('classic');
  const [loading, setLoading] = useState(true);
  const [equipLoading, setEquipLoading] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadLibrary() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || null);

      // Fetch currently equipped design
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('equipped_design_id')
        .eq('user_id', user.id)
        .single();

      if (userSettings?.equipped_design_id) {
        setEquippedDesignId(userSettings.equipped_design_id);
      }

      setLoading(false);
    }

    loadLibrary();
  }, []);

  const handleEquip = async (designId: string) => {
    if (!userId) return;
    
    setEquipLoading(designId);
    
    try {
      const response = await fetch('/api/equip-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designId })
      });

      if (response.ok) {
        setEquippedDesignId(designId);
      } else {
        alert('Failed to equip design');
      }
    } catch (error) {
      console.error('Error equipping design:', error);
      alert('Failed to equip design');
    } finally {
      setEquipLoading(null);
    }
  };

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
      case 'diagonal':
        return {
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)',
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
        return {};
    }
  };

  const getGradientClass = (gradient: string) => {
    if (gradient.startsWith('from-')) {
      return `bg-gradient-to-br ${gradient}`;
    }
    
    // Special gradient handling
    const specialGradients: Record<string, string> = {
      'metallic-gold': 'bg-gradient-to-br from-yellow-500 via-yellow-300 to-yellow-600',
      'glass-frosted': 'bg-gradient-to-br from-white/20 via-white/10 to-white/20',
      // Removed 'glass-aurora' and 'metallic-chrome'
      'material-carbon': 'bg-gradient-to-br from-gray-800 via-gray-900 to-black',
      'effect-holographic': 'bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-cyan-400',
      'glass-neon': 'bg-gradient-to-br from-pink-500 via-purple-500 to-pink-500',
      'metallic-rose-gold': 'bg-gradient-to-br from-rose-300 via-pink-400 to-rose-500'
    };

    return specialGradients[gradient] || 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <MousePointer2 className="w-16 h-16 text-indigo-400 animate-pulse" />
      </div>
    );
  }

  // All designs are available to all users
  const ownedDesignsList = flexCardDesigns;

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] w-full border-b border-neutral-800 bg-neutral-900/80 px-2 sm:px-4 py-0 mb-8 backdrop-blur">
        <div className="flex flex-row items-center gap-8 h-12">
          {/* Horizontal nav tabs */}
          <div className="flex gap-2 h-full">
            <Link href="/dashboard/trending" className="relative flex items-center h-full px-4 text-neutral-400 font-semibold hover:text-indigo-400 transition-colors">
              <span>Trending</span>
            </Link>
            <Link href="/dashboard" className="relative flex items-center h-full px-4 text-neutral-400 font-semibold hover:text-indigo-400 transition-colors">
              <span>Dashboard</span>
            </Link>
            {/* Flex Store link removed */}
            <Link href="/dashboard/library" className="relative flex items-center h-full px-4 text-white font-semibold hover:text-indigo-400 transition-colors">
              <span>Library</span>
              {/* Active underline */}
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-white rounded transition-all duration-200" style={{ opacity: "1" }} />
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
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-3">📚 My Library</h1>
            <p className="text-neutral-400 text-lg">
              Your collection of {ownedDesignsList.length} flex card{ownedDesignsList.length !== 1 ? 's' : ''}
            </p>
          </div>

          {ownedDesignsList.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg mb-4">Your library is empty</p>
              <Link 
                href="/dashboard/trending" 
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Browse Trending
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ownedDesignsList.map((design) => {
                const isEquipped = equippedDesignId === design.id;
                const isLoading = equipLoading === design.id;

                return (
                  <div
                    key={design.id}
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                      boxShadow: isEquipped 
                        ? `0 0 40px ${design.glowColor}, 0 0 60px ${design.glowColor}`
                        : `0 0 20px ${design.glowColor}`,
                      background:
                        design.pattern === 'image' && design.image
                          ? `url(${design.image}) center center / cover no-repeat`
                          : undefined
                    }}
                  >
                    {/* Card Content */}
                    <div 
                      className={`${design.gradient.startsWith('from-') ? `bg-gradient-to-br ${design.gradient}` : ''} p-8 h-full relative`}
                      style={{
                        ...(design.gradient === 'material-carbon' && {
                          background: '#0a0a0a',
                          boxShadow: 'inset 0 0 60px rgba(0,0,0,0.9), inset 0 2px 4px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.8)',
                          border: '1px solid rgba(40,40,40,0.8)'
                        })
                      }}
                    >
                      {/* Pattern overlay */}
                      {design.pattern === 'glass' && (
                        <>
                          <div className="absolute inset-0 opacity-[0.15]" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            backgroundSize: '200px 200px'
                          }} />
                          <div className="absolute inset-0 opacity-30" style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.2) 100%)'
                          }} />
                          <div className="absolute inset-0 opacity-[0.08]" style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)'
                          }} />
                        </>
                      )}
                      {design.pattern === 'carbon' && design.gradient === 'material-carbon' && (
                        <>
                          <div className="absolute inset-0" style={{
                            background: 'repeating-linear-gradient(45deg, transparent 0px, transparent 3px, rgba(30,30,30,0.8) 3px, rgba(30,30,30,0.8) 6px), repeating-linear-gradient(-45deg, transparent 0px, transparent 3px, rgba(20,20,20,0.9) 3px, rgba(20,20,20,0.9) 6px)',
                            backgroundSize: '10px 10px'
                          }} />
                          <div className="absolute inset-0 opacity-40" style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 60%, rgba(255,255,255,0.08) 80%, rgba(255,255,255,0.2) 100%)'
                          }} />
                          <div className="absolute inset-0 opacity-50" style={{
                            background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.12) 0%, transparent 40%), radial-gradient(ellipse at 30% 70%, rgba(255,255,255,0.08) 0%, transparent 35%)'
                          }} />
                        </>
                      )}
                      {design.pattern === 'dots' && (
                        <div 
                          className="absolute inset-0 opacity-10"
                          style={getPatternStyle(design.pattern)}
                        />
                      )}

                      {/* Equipped Badge */}
                      {isEquipped && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                          <Check className="w-3 h-3" />
                          
                        </div>
                      )}

                      <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
                            <span className="text-white text-xs font-bold uppercase tracking-wide">
                              {design.badge}
                            </span>
                          </div>
                          <div className="text-3xl">{design.icon}</div>
                        </div>

                        {/* Design Name */}
                        <h3 className="text-2xl font-extrabold text-white mb-2">
                          {design.name}
                        </h3>

                        {/* Description */}
                        <p className="text-white/80 text-sm mb-6">
                          {design.description}
                        </p>

                        {/* Equip Button */}
                        <button
                          onClick={() => handleEquip(design.id)}
                          disabled={isEquipped || isLoading}
                          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                            isEquipped
                              ? 'bg-green-500 text-white cursor-default'
                              : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur'
                          }`}
                        >
                          {isLoading ? 'Equipping...' : isEquipped ? 'Currently Equipped' : 'Equip This Card'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
