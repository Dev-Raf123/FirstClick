import React from "react";

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
        onClick={() => {
          if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.25)' }} />
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
