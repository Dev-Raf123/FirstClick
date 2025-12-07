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

export function FlexCardNew({ projectName, percentChange, clicksToday, clicksYesterday, equippedDesignId = "classic", url }: FlexCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  // Consistent card size for both preview and export
  const CARD_WIDTH = 420;
  const CARD_HEIGHT = 560;
  const cardConfig = flexCardConfigs[equippedDesignId] || flexCardConfigs["classic"];
    const [shareOpen, setShareOpen] = useState(false);

  const downloadCard = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!cardRef.current) return;
    const el = cardRef.current as HTMLElement;
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
          backgroundColor: null,
          useCORS: true,
          scale,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
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

  const renderCore = () => (
    <>
      <div className="relative z-10 p-8 flex flex-col h-full justify-between">
        <div>
          <h3 className="text-3xl font-extrabold text-white mb-4 drop-shadow-lg">{projectName}</h3>
        </div>
        <div className="pb-4">
          <div className={`font-black text-6xl mb-2 drop-shadow-lg ${percentChange < 0 ? "text-red-300" : percentChange === 0 ? "text-white" : "text-green-300"}`}>
            {percentChange > 0 ? "+" : ""}{percentChange}%
          </div>
          <div className="text-white/80 text-lg mb-4">Growth Rate</div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{clicksToday}</div>
              <div className="text-white/70 text-base">Today</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{clicksYesterday}</div>
              <div className="text-white/70 text-base">Yesterday</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-white/60 text-base">
            <span>FirstClick</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-[420px] p-4">
      <div
        ref={cardRef}
        className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between transition-transform duration-200 transform hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(99,102,241,0.12)] cursor-pointer filter hover:brightness-105"
        style={{
          backgroundImage: cardConfig.pattern === "image" && cardConfig.image ? `url(${cardConfig.image})` : "url(/664b6af1e2428aed06246af0c6581efb.jpg)",
          backgroundSize: cardConfig.image === "/6c81d6eb7b407ee86a22019d762ed6f7.jpg" ? "80%" : "cover",
          backgroundPosition: cardConfig.image === "/6c81d6eb7b407ee86a22019d762ed6f7.jpg" ? "center center" : "center",
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
