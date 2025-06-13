import React from 'react';
import { AppProviders } from '@/context';
import { AppContent } from './AppContent';

/**
 * STORAGE SYSTEM: Bean & Bite uses Zustand for state management
 * - Data persists within the browser tab/session using sessionStorage
 * - Automatically cleared when the tab is closed
 * - Perfect for group ordering sessions
 * - Centralized state management with Zustand
 */

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}