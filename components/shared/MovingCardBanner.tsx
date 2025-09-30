import React, { useMemo } from "react";

type MovingCardBannerProps = {
  items: string[];
  className?: string;
  speedMs?: number; // duration for one marquee loop
};

// A continuous-scrolling strip of cards, duplicated for seamless marquee
export const MovingCardBanner: React.FC<MovingCardBannerProps> = ({ items, className = "", speedMs = 20000 }) => {
  // Control marquee speed via inline style
  const marqueeStyle = useMemo(() => ({
    animationDuration: `${Math.max(8000, speedMs)}ms`,
  }), [speedMs]);

const Card = ({ name }: { name: string }) => (
  <div className="w-64 border border-b-2 border-r-2 rounded-[1px] bg-white px-12 py-12 mr-4 inline-flex items-center justify-center shrink-0">
    <img src="/coffee-icon.svg" alt="logo" className="w-6 h-6 mr-2" />
    <span className="font-black">{name}</span>
  </div>
);

  return (
    <div className={`absolute left-0 right-0 overflow-hidden whitespace-nowrap py-2 ${className}`}>
      <div className="flex animate-marquee" style={marqueeStyle as React.CSSProperties}>
        <div className="flex shrink-0">
          {items.map((name, idx) => (
            <Card key={`a-${idx}-${name}`} name={name} />
          ))}
        </div>
        <div className="flex shrink-0">
          {items.map((name, idx) => (
            <Card key={`b-${idx}-${name}`} name={name} />
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

export default MovingCardBanner;