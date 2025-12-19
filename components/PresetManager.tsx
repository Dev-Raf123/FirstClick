"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PresetCard } from "./PresetCard";
import { CustomBackgroundUploader } from "./CustomBackgroundUploader";
import { SwipeableCarousel } from "./SwipeableCarousel";
import { X } from "lucide-react";

interface BackgroundPreset {
  id: string;
  name: string;
  background_url: string;
  background_position: string;
  background_size: string;
  background_repeat: string;
  is_equipped: boolean;
  text_color?: string;
}

interface PresetManagerProps {
  projectId: string;
  userId: string;
}

export function PresetManager({ projectId, userId }: PresetManagerProps) {
  const [presets, setPresets] = useState<BackgroundPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingPreset, setEditingPreset] = useState<BackgroundPreset | null>(null);
  const [equippedDesignId, setEquippedDesignId] = useState<string | null>(null);

  useEffect(() => {
    loadPresets();
    loadEquippedDesign();
  }, [userId, projectId]);

  async function loadPresets() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("background_presets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPresets(data || []);
    } catch (err) {
      console.error("Error loading presets:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadEquippedDesign() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("equipped_design_id")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      setEquippedDesignId(data?.equipped_design_id || null);
    } catch (err) {
      console.error("Error loading equipped design:", err);
    }
  }

  async function handleEquipPreset(presetId: string) {
    try {
      const supabase = createClient();
      
      // Get the preset
      const preset = presets.find(p => p.id === presetId);
      if (!preset) return;

      // Update all presets to unequip
      await supabase
        .from("background_presets")
        .update({ is_equipped: false })
        .eq("user_id", userId);

      // Equip the selected preset
      await supabase
        .from("background_presets")
        .update({ is_equipped: true })
        .eq("id", presetId);

      // Update project with preset's background and clear built-in design
      await supabase
        .from("projects")
        .update({
          background_url: preset.background_url,
          background_position: preset.background_position,
          background_size: preset.background_size,
          background_repeat: preset.background_repeat,
          text_color: preset.text_color || 'white',
          equipped_background_preset_id: presetId,
          equipped_design_id: null,
        })
        .eq("id", projectId);

      // Reload both presets and equipped design state
      await loadPresets();
      await loadEquippedDesign();
    } catch (err) {
      console.error("Error equipping preset:", err);
    }
  }

  async function handleEquipBuiltInDesign(designId: string) {
    try {
      const supabase = createClient();

      // Unequip all custom presets
      await supabase
        .from("background_presets")
        .update({ is_equipped: false })
        .eq("user_id", userId);

      // Update project to use built-in design
      await supabase
        .from("projects")
        .update({
          background_url: null,
          background_position: null,
          background_size: null,
          background_repeat: null,
          text_color: 'white',
          equipped_background_preset_id: null,
          equipped_design_id: designId,
        })
        .eq("id", projectId);

      // Reload both presets and equipped design state
      await loadPresets();
      await loadEquippedDesign();
    } catch (err) {
      console.error("Error equipping built-in design:", err);
    }
  }

  async function handleDeletePreset(presetId: string) {
    if (!confirm("Delete this preset?")) return;

    try {
      const supabase = createClient();
      await supabase
        .from("background_presets")
        .delete()
        .eq("id", presetId);

      loadPresets();
    } catch (err) {
      console.error("Error deleting preset:", err);
    }
  }

  async function handleSaveNewPreset(url: string, position: string, size: string, textColor: string = 'white') {
    try {
      const supabase = createClient();
      
      const presetName = `Preset ${presets.length + 1}`;
      
      const { error } = await supabase
        .from("background_presets")
        .insert({
          user_id: userId,
          name: presetName,
          background_url: url,
          background_position: position,
          background_size: size,
          background_repeat: "no-repeat",
          text_color: textColor,
          is_equipped: false,
        });

      if (error) throw error;

      setShowCreator(false);
      loadPresets();
    } catch (err) {
      console.error("Error saving preset:", err);
    }
  }

  if (loading) {
    return <div className="text-white">Loading presets...</div>;
  }

  // Build all preset cards
  const allPresetCards = [
    // Built-in Designs
    <PresetCard
      key="aurora"
      preset={{
        id: 'Arora Waves',
        name: 'Aurora Waves',
        background_url: '/664b6af1e2428aed06246af0c6581efb.jpg',
        background_position: 'center',
        background_size: 'cover',
        background_repeat: 'no-repeat',
        is_equipped: equippedDesignId === 'Arora Waves',
      }}
      isEquipped={equippedDesignId === 'Arora Waves'}
      onEquip={() => handleEquipBuiltInDesign('Arora Waves')}
    />,
    <PresetCard
      key="abyssal"
      preset={{
        id: 'Abyssal-Waves',
        name: 'Abyssal Waves',
        background_url: '/116a690e6c1e4e1de9ebd801475d990c.jpg',
        background_position: 'center',
        background_size: 'cover',
        background_repeat: 'no-repeat',
        is_equipped: equippedDesignId === 'Abyssal-Waves',
      }}
      isEquipped={equippedDesignId === 'Abyssal-Waves'}
      onEquip={() => handleEquipBuiltInDesign('Abyssal-Waves')}
    />,
    // Custom Presets
    ...presets.map((preset) => (
      <PresetCard
        key={preset.id}
        preset={preset}
        isEquipped={preset.is_equipped && !equippedDesignId}
        onEquip={() => handleEquipPreset(preset.id)}
        onDelete={() => handleDeletePreset(preset.id)}
      />
    )),
    // Create New Preset Card
    <PresetCard
      key="create-new"
      isCreateNew
      onCreate={() => setShowCreator(true)}
    />
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Background Presets</h2>
        <p className="text-neutral-400">Swipe to browse and select backgrounds</p>
      </div>

      {/* Swipeable Preset Carousel */}
      <SwipeableCarousel onSlideChange={(index) => {
        // Auto-equip when swiping to a card (except create-new card)
        if (index < allPresetCards.length - 1) {
          if (index === 0) {
            handleEquipBuiltInDesign('Arora Waves');
          } else if (index === 1) {
            handleEquipBuiltInDesign('Abyssal-Waves');
          } else if (index >= 2 && index < presets.length + 2) {
            const preset = presets[index - 2];
            if (preset) {
              handleEquipPreset(preset.id);
            }
          }
        }
      }}>
        {allPresetCards}
      </SwipeableCarousel>

      {/* Preset Creator Modal */}
      {showCreator && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowCreator(false)}
              className="absolute top-4 right-4 p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">Create New Preset</h3>
            
            <CustomBackgroundUploader
              projectId={projectId}
              currentBackgroundUrl={null}
              onUploadSuccess={(url) => {
                // Preset will be saved when user clicks save in the uploader
              }}
              onSavePreset={handleSaveNewPreset}
              isPresetMode
            />
          </div>
        </div>
      )}
    </div>
  );
}
