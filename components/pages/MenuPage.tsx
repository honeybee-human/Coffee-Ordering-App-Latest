import React from 'react';
import { Menu } from '@/components/pages/Menu';
import { MovingTextBanner } from '../shared/MovingTextBanner';

export const MenuPage: React.FC = () => {
  return (
    <>
    <h1 className="text-6xl font-bold text-center text-primary mb-8">BEAN BITE</h1>
         <MovingTextBanner />
    <div className="mt-8 container mx-auto px-4 py-8">
      <Menu />
    </div></>
  );
}; 