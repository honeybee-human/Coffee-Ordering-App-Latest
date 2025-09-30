// components/layout/DecorativeBackground.tsx
import React from 'react';

export const DecorativeBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50" />
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute top-1/4 left-0 w-48 h-48 bg-primary opacity-5 rounded-full -translate-x-24" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary opacity-5 rounded-full translate-y-48" />
      <div className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-primary opacity-5 rounded-full" />
      
      {/* Corner accent like the card */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-10 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary opacity-10 rounded-tr-full" />
    </div>
  );
};