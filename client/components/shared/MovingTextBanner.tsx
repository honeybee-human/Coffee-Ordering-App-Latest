import React, { useMemo } from "react";

type MovingTextBannerProps = {
  items: string[];
  className?: string;
  speedMs?: number; // duration for one marquee loop
};

export const MovingTextBanner: React.FC<MovingTextBannerProps> = ({ items, className = "", speedMs = 20000 }) => {
  // Inline style to control speed dynamically
  const marqueeStyle = useMemo(() => ({
    animationDuration: `${Math.max(8000, speedMs)}ms`,
  }), [speedMs]);

  return (
    <div className={`absolute left-0 right-0 bg-primary text-white overflow-hidden whitespace-nowrap py-2 ${className}`}>
      <div className="flex animate-marquee" style={marqueeStyle as React.CSSProperties}>
        <div className="flex shrink-0">
          {items.map((text, idx) => (
            <span key={`a-${idx}-${text}`} className={`mr-8 ${idx % 3 === 0 ? "font-bold" : ""}`}>{text}</span>
          ))}
        </div>
        <div className="flex shrink-0">
          {items.map((text, idx) => (
            <span key={`b-${idx}-${text}`} className={`mr-8 ${idx % 3 === 0 ? "font-bold" : ""}`}>{text}</span>
          ))}
        </div>
      </div>

      {/* Inline CSS to halve translation to match duplicated content */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  );
};