import React, { useState } from "react";

interface ImageCardProps {
  image: string;
  name: string;
  description?: string;
  percent: number;
  clicksToday: number;
  clicksPrev: number;
  date: string;
  url?: string; // optional: open card on click
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  name,
  description,
  percent,
  clicksToday,
  clicksPrev,
  date,
  url,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!url) return;
    if (e.key === "Enter" || e.key === " ") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="w-full">
      <div
        className="relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between transition-transform duration-200 transform hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(99,102,241,0.12)] cursor-pointer filter hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
      }}
        tabIndex={url ? 0 : -1}
        role={url ? 'link' : undefined}
        aria-label={`${name} — ${percent > 0 ? '+' : ''}${percent}% growth; ${clicksToday} clicks today`}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.25)' }} />
        
        {/* "Visit Website" overlay on hover */}
        {isHovered && url && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 transition-opacity duration-200">
            <div className="text-white text-2xl font-bold flex items-center gap-3">
              <span>Visit Website</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
        )}

        {/* content */}
        <div className="relative z-10 p-4 sm:p-6 flex flex-col h-full justify-between">
          <div>
          <h3 className="text-2xl font-extrabold text-white mb-2 drop-shadow-lg">{name}</h3>
          {description && (
            <p className="text-white/80 text-xs mb-3 drop-shadow-lg">{description}</p>
          )}
        </div>
          <div className="pb-2">
          <div className={`font-black text-5xl mb-1 drop-shadow-lg ${percent < 0 ? 'text-red-300' : percent === 0 ? 'text-white' : 'text-green-300'}`}>
            {percent > 0 ? '+' : ''}{percent}%
          </div>
          <div className="text-white/80 text-sm mb-2">Growth Rate</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-xl font-bold text-white">{clicksToday}</div>
              <div className="text-white/70 text-xs">Today</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-xl font-bold text-white">{clicksPrev}</div>
              <div className="text-white/70 text-xs">Yesterday</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>FirstClick</span>
            <span>{date}</span>
          </div>
          </div>
      </div>
      </div>
    </div>
  );
};
