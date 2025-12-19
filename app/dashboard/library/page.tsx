"use client";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { MousePointer2, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PresetManager } from "@/components/PresetManager";

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
  const [projectId, setProjectId] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

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

      // Fetch user's project and background
      const { data: projects } = await supabase
        .from('projects')
        .select('id, background_url, equipped_design_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (projects) {
        setProjectId(projects.id);
        setBackgroundUrl(projects.background_url);
        setEquippedDesignId(projects.equipped_design_id || 'classic');
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
          {/* Background Preset Manager */}
          {projectId && userId && (
            <div className="mb-12">
              <PresetManager
                projectId={projectId}
                userId={userId}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
