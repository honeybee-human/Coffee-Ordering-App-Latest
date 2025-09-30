import React from "react";

export const MovingTextBanner: React.FC = () => {
  return (
    <div className="absolute left-0 right-0 bg-primary text-white overflow-hidden whitespace-nowrap py-2">
      <div className="flex animate-marquee">
        <div className="flex shrink-0">
          <span className="font-bold mr-8">⚠️ BE CAREFUL</span>
          <span className="mr-8">STAY SAFE</span>
          <span className="mr-8">WATCH FOR CROSS CONTAMINATION</span>
          <span className="font-bold mr-8">BEAN BITE CARES</span>
          <span className="mr-8">ALLERGEN AWARENESS MATTERS</span>
          <span className="font-bold mr-8">PROTECT YOUR FRIENDS</span>
          <span className="mr-8">CHECK INGREDIENTS TWICE</span>
          <span className="font-bold mr-8">SAFETY FIRST</span>
          <span className="mr-8">BE CAREFUL</span>
          <span className="mr-8">STAY SAFE</span>
          <span className="mr-8">CROSS CONTAMINATION CAN HURT</span>
          <span className="font-bold mr-8">BEAN BITE</span>
        </div>
        <div className="flex shrink-0">
          <span className="font-bold mr-8">⚠️ BE CAREFUL</span>
          <span className="mr-8">STAY SAFE</span>
          <span className="mr-8">WATCH FOR CROSS CONTAMINATION</span>
          <span className="font-bold mr-8">BEAN BITE CARES</span>
          <span className="mr-8">ALLERGEN AWARENESS MATTERS</span>
          <span className="font-bold mr-8">PROTECT YOUR FRIENDS</span>
          <span className="mr-8">CHECK INGREDIENTS TWICE</span>
          <span className="font-bold mr-8">SAFETY FIRST</span>
          <span className="mr-8">BE CAREFUL</span>
          <span className="mr-8">STAY SAFE</span>
          <span className="mr-8">CROSS CONTAMINATION CAN HURT</span>
          <span className="font-bold mr-8">BEAN BITE</span>
        </div>
      </div>

      {/* Inline CSS */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite; /* slow + smooth */
        }
      `}</style>
    </div>
  );
};
