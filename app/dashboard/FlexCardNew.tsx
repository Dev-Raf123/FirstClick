"use client";
import React, { useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

interface FlexCardProps {
  projectName: string;
  percentChange: number;
  clicksToday: number;
  clicksYesterday: number;
  equippedDesignId?: string;
  url?: string;
  customBackground?: {
    url: string;
    position: string;
    size: string;
    repeat: string;
  };
  textColor?: 'white' | 'black';
}

interface FlexCardConfig {
  gradient: string;
  pattern: string;
  customStyle?: React.CSSProperties;
  image?: string;
}

const flexCardConfigs: Record<string, FlexCardConfig> = {
    "Abyssal-Waves": { gradient: "", pattern: "image", customStyle: {}, image: "/116a690e6c1e4e1de9ebd801475d990c.jpg" },
  classic: { gradient: "from-indigo-600 via-purple-600 to-pink-600", pattern: "dots" },
  "custom-image": { gradient: "", pattern: "image", customStyle: {}, image: "/116a690e6c1e4e1de9ebd801475d990c.jpg" },
};

export function FlexCardNew({ projectName, percentChange, clicksToday, clicksYesterday, equippedDesignId = "classic", url, customBackground, textColor = 'white' }: FlexCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Consistent card size for both preview and export
  const CARD_WIDTH = 340;
  const CARD_HEIGHT = 453;
  const cardConfig = flexCardConfigs[equippedDesignId] || flexCardConfigs["classic"];
  const [shareOpen, setShareOpen] = useState(false);

  // Use custom background if provided, otherwise use design config
  const backgroundStyle = customBackground?.url ? {
    backgroundImage: `url(${customBackground.url})`,
    backgroundPosition: customBackground.position || 'center',
    backgroundSize: customBackground.size || 'cover',
    backgroundRepeat: customBackground.repeat || 'no-repeat',
  } : {
    backgroundImage: cardConfig.pattern === "image" && cardConfig.image ? `url(${cardConfig.image})` : "url(/664b6af1e2428aed06246af0c6581efb.jpg)",
    backgroundSize: cardConfig.image === "/6c81d6eb7b407ee86a22019d762ed6f7.jpg" ? "80%" : "cover",
    backgroundPosition: cardConfig.image === "/6c81d6eb7b407ee86a22019d762ed6f7.jpg" ? "center center" : "center",
  };

  const downloadCard = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!containerRef.current) return;
    const el = containerRef.current as HTMLElement;
    // Hide download and share buttons for export
    const btn = el.querySelector('[data-download-btn]') as HTMLElement | null;
    const shareBtn = el.querySelector('[data-share-btn]') as HTMLElement | null;
    const shareMenu = el.querySelector('[data-share-menu]') as HTMLElement | null;
    if (btn) btn.style.display = "none";
    if (shareBtn) shareBtn.style.display = "none";
    if (shareMenu) shareMenu.style.display = "none";
    setTimeout(async () => {
      try {
        const module = await import("html2canvas");
        const html2canvas = module.default;
        const scale = 2;
        const canvas = await html2canvas(el, {
          backgroundColor: "#000000",
          useCORS: true,
          scale,
          width: CARD_WIDTH + 120,
          height: CARD_HEIGHT + 120,
        });
        if (canvas.toBlob) {
          canvas.toBlob((blob) => {
            if (!blob) return;
            const urlObj = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `${projectName}-flex-card.png`;
            link.href = urlObj;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(urlObj);
            if (btn) btn.style.display = "";
            if (shareBtn) shareBtn.style.display = "";
            if (shareMenu) shareMenu.style.display = "";
          }, "image/png");
        } else {
          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `${projectName}-flex-card.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          if (btn) btn.style.display = "";
          if (shareBtn) shareBtn.style.display = "";
          if (shareMenu) shareMenu.style.display = "";
        }
      } catch (err) {
        console.error("Error downloading flex card", err);
        if (btn) btn.style.display = "";
        if (shareBtn) shareBtn.style.display = "";
        if (shareMenu) shareMenu.style.display = "";
        alert("Failed to download flex card. See console for details.");
      }
    }, 80);
  };

  const renderCore = () => {
    const isWhiteText = textColor === 'white';
    const percentColor = percentChange < 0 
      ? (isWhiteText ? "text-red-300" : "text-red-700")
      : percentChange === 0 
        ? (isWhiteText ? "text-white" : "text-black")
        : (isWhiteText ? "text-green-300" : "text-green-700");
    
    return (
      <>
        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
          <div>
            <h3 className={`text-2xl font-extrabold mb-3 drop-shadow-lg ${isWhiteText ? 'text-white' : 'text-black'}`}>{projectName}</h3>
          </div>
          <div className="pb-3">
            <div className={`font-black text-5xl mb-1.5 drop-shadow-lg ${percentColor}`}>
              {percentChange > 0 ? "+" : ""}{percentChange}%
            </div>
            <div className={`text-base mb-3 ${isWhiteText ? 'text-white/80' : 'text-black/80'}`}>Growth Rate</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className={`${isWhiteText ? 'bg-white/10' : 'bg-black/10'} rounded-lg p-3`}>
                <div className={`text-xl font-bold ${isWhiteText ? 'text-white' : 'text-black'}`}>{clicksToday}</div>
                <div className={`text-sm ${isWhiteText ? 'text-white/70' : 'text-black/70'}`}>Today</div>
              </div>
              <div className={`${isWhiteText ? 'bg-white/10' : 'bg-black/10'} rounded-lg p-3`}>
                <div className={`text-xl font-bold ${isWhiteText ? 'text-white' : 'text-black'}`}>{clicksYesterday}</div>
                <div className={`text-sm ${isWhiteText ? 'text-white/70' : 'text-black/70'}`}>Yesterday</div>
              </div>
            </div>
            <div className={`flex items-center justify-between text-sm ${isWhiteText ? 'text-white/60' : 'text-black/60'}`}>
              <span>FirstClick</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div ref={containerRef} className="w-full max-w-[340px] p-[60px] relative">
      <div
        ref={cardRef}
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-transform duration-200 transform hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(99,102,241,0.12)] cursor-pointer filter hover:brightness-105"
        style={{
          ...backgroundStyle,
          width: CARD_WIDTH,
          height: CARD_HEIGHT
        }}
      >
        {/* Removed dark box-shadow overlay */}
        {renderCore()}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          <button
            type="button"
            data-download-btn
            className="w-[90px] py-1.5 bg-black/20 text-white rounded-xl text-sm font-bold shadow hover:bg-white/20 transition border border-white/10 pointer-events-auto active:scale-95"
            onClick={(e) => { e.stopPropagation(); downloadCard(e); }}
          >
            Download
          </button>
          <button
            type="button"
            data-share-btn
            className="w-[90px] py-1.5 bg-black/20 text-white rounded-xl text-sm font-bold shadow hover:bg-white/20 transition border border-white/10 pointer-events-auto active:scale-95"
            onClick={(e) => { e.stopPropagation(); setShareOpen((open) => !open); }}
          >
            Share
          </button>
        </div>
        {shareOpen && (
          <div data-share-menu className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[220px] bg-neutral-900 border border-white/10 rounded-xl shadow-lg z-40 flex flex-col">
            {[
              { name: "Twitter", url: "https://x.com/compose/post" },
              { name: "Reddit", url: "https://www.reddit.com/submit" },
              { name: "Instagram", url: "https://www.instagram.com/" },
              { name: "Facebook", url: "https://www.facebook.com/sharer/sharer.php" },
              { name: "LinkedIn", url: "https://www.linkedin.com/sharing/share-offsite/" },
            ].map((platform) => (
              <button
                key={platform.name}
                className="w-full py-2 px-4 text-left text-white hover:bg-indigo-700 transition border-b border-white/5 last:border-b-0"
                onClick={async (e) => {
                  e.stopPropagation();
                  setShareOpen(false);
                  await downloadCard();
                  window.open(platform.url, "_blank");
                }}
              >
                Share to {platform.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
