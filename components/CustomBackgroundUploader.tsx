"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";
import { Upload, X, Save, ZoomIn, ZoomOut, Move } from "lucide-react";

interface CustomBackgroundUploaderProps {
  projectId: string;
  currentBackgroundUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  onSavePreset?: (url: string, position: string, size: string, textColor: string) => void;
  isPresetMode?: boolean;
}

export function CustomBackgroundUploader({
  projectId,
  currentBackgroundUrl,
  onUploadSuccess,
  onSavePreset,
  isPresetMode = false,
}: CustomBackgroundUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentBackgroundUrl || null);
  const [saving, setSaving] = useState(false);
  
  // Instagram-style positioning controls
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage-based
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [textColor, setTextColor] = useState<'white' | 'black'>('white');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      setError("File size must be less than 1MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${projectId}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("card-backgrounds")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("card-backgrounds")
        .getPublicUrl(fileName);

      // Update project with new background URL and default settings
      const { error: updateError } = await supabase
        .from("projects")
        .update({ 
          background_url: publicUrl,
          background_position: "50% 50%",
          background_size: "100%",
          background_repeat: "no-repeat"
        })
        .eq("id", projectId);

      if (updateError) throw updateError;

      setPreview(publicUrl);
      setScale(1);
      setPosition({ x: 50, y: 50 });
      onUploadSuccess(publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setUploading(true);
      const supabase = createClient();

      // Remove background URL from project
      const { error } = await supabase
        .from("projects")
        .update({ 
          background_url: null,
          background_position: null,
          background_size: null,
          background_repeat: null
        })
        .eq("id", projectId);

      if (error) throw error;

      setPreview(null);
      setScale(1);
      setPosition({ x: 50, y: 50 });
      onUploadSuccess("");
    } catch (err) {
      console.error("Remove error:", err);
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      const positionStr = `${position.x}% ${position.y}%`;
      const sizeStr = `${scale * 100}%`;

      if (isPresetMode && onSavePreset && preview) {
        // Save as preset instead of updating project
        onSavePreset(preview, positionStr, sizeStr, textColor);
      } else {
        // Normal mode: update project
        const supabase = createClient();
        const { error } = await supabase
          .from("projects")
          .update({
            background_position: positionStr,
            background_size: sizeStr,
            background_repeat: "no-repeat",
            text_color: textColor,
          })
          .eq("id", projectId);

        if (error) throw error;
      }
    } catch (err) {
      console.error("Save settings error:", err);
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Load existing background settings
  useEffect(() => {
    async function loadSettings() {
      if (!preview) return;
      
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("projects")
          .select("background_position, background_size, background_repeat, text_color")
          .eq("id", projectId)
          .single();

        if (error) throw error;

        if (data) {
          // Parse position like "50% 50%"
          if (data.background_position) {
            const [x, y] = data.background_position.split(' ').map((v: string) => parseFloat(v));
            if (!isNaN(x) && !isNaN(y)) {
              setPosition({ x, y });
            }
          }
          // Parse size like "100%"
          if (data.background_size) {
            const sizeValue = parseFloat(data.background_size);
            if (!isNaN(sizeValue)) {
              setScale(sizeValue / 100);
            }
          }
          // Load text color
          if (data.text_color) {
            setTextColor(data.text_color as 'white' | 'black');
          }
        }
      } catch (err) {
        console.error("Load settings error:", err);
      }
    }

    loadSettings();
  }, [projectId, preview]);

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Convert pixel movement to percentage
    const percentX = (deltaX / rect.width) * 100;
    const percentY = (deltaY / rect.height) * 100;

    setPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x + percentX)),
      y: Math.max(0, Math.min(100, prev.y + percentY))
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.1));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.1));
  };

  return (
    <div className="space-y-6">

      {preview ? (
        <div className="space-y-6">
          {/* Instagram-style Editor */}
          <div className="relative">
            <div 
              ref={containerRef}
              className="w-full aspect-[3/4] max-w-[420px] mx-auto rounded-3xl overflow-hidden shadow-2xl cursor-move select-none relative"
              style={{
                backgroundImage: `url(${preview})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundSize: `${scale * 100}%`,
                backgroundRepeat: "no-repeat",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Dragging hint */}
              {!isDragging && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-2 rounded-full text-white text-xs flex items-center gap-2 pointer-events-none z-20">
                  <Move className="w-3 h-3" />
                  Drag to reposition
                </div>
              )}

              {/* Flex Card Overlay - matching exact card layout */}
              <div className="relative z-10 p-8 flex flex-col h-full justify-between pointer-events-none">
                {/* Top section - Project name */}
                <div>
                  <h3 className={`text-3xl font-extrabold mb-4 drop-shadow-lg ${textColor === 'white' ? 'text-white' : 'text-black'}`}>
                    My Project
                  </h3>
                </div>

                {/* Bottom section - Stats */}
                <div className="pb-4">
                  {/* Large percentage */}
                  <div className={`font-black text-6xl mb-2 drop-shadow-lg ${textColor === 'white' ? 'text-white' : 'text-black'}`}>
                    0%
                  </div>
                  <div className={`text-lg mb-4 ${textColor === 'white' ? 'text-white/80' : 'text-black/80'}`}>Growth Rate</div>
                  
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className={`${textColor === 'white' ? 'bg-white/10' : 'bg-black/10'} rounded-xl p-4`}>
                      <div className={`text-2xl font-bold ${textColor === 'white' ? 'text-white' : 'text-black'}`}>0</div>
                      <div className={`text-base ${textColor === 'white' ? 'text-white/70' : 'text-black/70'}`}>Today</div>
                    </div>
                    <div className={`${textColor === 'white' ? 'bg-white/10' : 'bg-black/10'} rounded-xl p-4`}>
                      <div className={`text-2xl font-bold ${textColor === 'white' ? 'text-white' : 'text-black'}`}>0</div>
                      <div className={`text-base ${textColor === 'white' ? 'text-white/70' : 'text-black/70'}`}>Yesterday</div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className={`flex items-center justify-between text-base ${textColor === 'white' ? 'text-white/60' : 'text-black/60'}`}>
                    <span>FirstClick</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors disabled:opacity-50 z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={handleZoomOut}
              className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <div className="flex-1 max-w-xs">
              <input
                type="range"
                min="50"
                max="300"
                value={scale * 100}
                onChange={(e) => setScale(parseFloat(e.target.value) / 100)}
                className="w-full"
              />
              <div className="text-center text-sm text-neutral-400 mt-1">
                {Math.round(scale * 100)}%
              </div>
            </div>

            <button
              onClick={handleZoomIn}
              className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Text Color Control */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-neutral-400 text-sm font-medium">Text Color:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTextColor('white')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  textColor === 'white'
                    ? 'bg-white text-black ring-2 ring-indigo-500'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
              >
                White
              </button>
              <button
                onClick={() => setTextColor('black')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  textColor === 'black'
                    ? 'bg-black text-white ring-2 ring-indigo-500'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
              >
                Black
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : isPresetMode ? "Save as Preset" : "Save Background Settings"}
          </button>
        </div>
      ) : (
        <label className="block">
          <div className="border-2 border-dashed border-neutral-700 rounded-lg p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-neutral-800/50 transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                  <p className="text-base text-neutral-300 font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-indigo-400" />
                  <p className="text-base text-white font-semibold">
                    Click to upload image
                  </p>
                  <p className="text-sm text-neutral-400">
                    PNG, JPG, or GIF (Max 1MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </label>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-600/30 rounded text-sm text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
