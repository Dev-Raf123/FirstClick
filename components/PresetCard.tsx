"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

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

interface PresetCardProps {
  preset?: BackgroundPreset;
  isCreateNew?: boolean;
  isEquipped?: boolean;
  onEquip?: () => void;
  onCreate?: () => void;
  onDelete?: () => void;
  isBuiltIn?: boolean;
}

export function PresetCard({ 
  preset, 
  isCreateNew, 
  isEquipped,
  onEquip, 
  onCreate,
  onDelete,
  isBuiltIn = false
}: PresetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if it's a built-in design
  const isBuiltInDesign = preset && (preset.id === 'Arora Waves' || preset.id === 'Abyssal-Waves');

  if (isCreateNew) {
    return (
      <div
        onClick={onCreate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-neutral-700 hover:border-indigo-500 transition-all cursor-pointer flex items-center justify-center group bg-neutral-900/50 hover:bg-neutral-800/50"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neutral-800 group-hover:bg-indigo-600 transition-colors flex items-center justify-center">
            <Plus className="w-8 h-8 text-neutral-400 group-hover:text-white transition-colors" />
          </div>
          <p className="text-neutral-400 group-hover:text-white font-medium transition-colors">
            Create New Preset
          </p>
        </div>
      </div>
    );
  }

  if (!preset) return null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <div
        className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg transition-all cursor-pointer ${
          isEquipped 
            ? 'ring-4 ring-green-500 shadow-green-500/50' 
            : 'hover:ring-2 hover:ring-indigo-500'
        }`}
        style={{
          backgroundImage: `url(${preset.background_url})`,
          backgroundPosition: preset.background_position,
          backgroundSize: preset.background_size,
          backgroundRepeat: preset.background_repeat,
        }}
        onClick={onEquip}
      >
        {/* Preview content - miniature version of FlexCard layout */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
          {/* Top section - Project name */}
          <div>
            <h3 className={`text-lg font-extrabold drop-shadow-lg ${preset.text_color === 'black' ? 'text-black' : 'text-white'}`}>
              {preset.name}
            </h3>
          </div>

          {/* Bottom section - Stats preview */}
          <div className="pb-2">
            <div className={`font-black text-3xl mb-1 drop-shadow-lg ${preset.text_color === 'black' ? 'text-green-700' : 'text-green-300'}`}>
              +45%
            </div>
            <div className={`text-xs mb-2 ${preset.text_color === 'black' ? 'text-black/80' : 'text-white/80'}`}>
              Growth Rate
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className={`${preset.text_color === 'black' ? 'bg-black/10' : 'bg-white/10'} rounded-lg p-2`}>
                <div className={`text-sm font-bold ${preset.text_color === 'black' ? 'text-black' : 'text-white'}`}>124</div>
                <div className={`text-xs ${preset.text_color === 'black' ? 'text-black/70' : 'text-white/70'}`}>Today</div>
              </div>
              <div className={`${preset.text_color === 'black' ? 'bg-black/10' : 'bg-white/10'} rounded-lg p-2`}>
                <div className={`text-sm font-bold ${preset.text_color === 'black' ? 'text-black' : 'text-white'}`}>86</div>
                <div className={`text-xs ${preset.text_color === 'black' ? 'text-black/70' : 'text-white/70'}`}>Yesterday</div>
              </div>
            </div>
            <div className={`flex items-center justify-between text-xs ${preset.text_color === 'black' ? 'text-black/60' : 'text-white/60'}`}>
              <span>FirstClick</span>
              <span className="bg-black/30 backdrop-blur px-1.5 py-0.5 rounded text-white text-[10px]">
                {isBuiltInDesign ? 'Built-in' : 'Custom'}
              </span>
            </div>
          </div>
        </div>

        {/* Equipped badge */}
        {isEquipped && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 z-10 shadow-lg">
            <Check className="w-3 h-3" />
            Equipped
          </div>
        )}

        {/* Delete button (show on hover if not equipped, only for custom presets) */}
        {!isEquipped && !isBuiltInDesign && isHovered && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors z-10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Equip hint */}
      {!isEquipped && isHovered && (
        <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <span className="text-white text-sm font-semibold">Click to Equip</span>
        </div>
      )}
    </div>
  );
}
