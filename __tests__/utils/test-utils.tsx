import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import AppProviders from '@/components/shared/AppProviders';

// Custom render function that includes app providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AppProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method with our custom version
export { customRender as render };

// Mock for window.matchMedia
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Helper to create a mock for Zustand store
export const createStoreMock = (initialState: any) => {
  const store = { ...initialState };
  const setState = jest.fn().mockImplementation((newState: any) => {
    if (typeof newState === 'function') {
      Object.assign(store, newState(store));
    } else {
      Object.assign(store, newState);
    }
  });
  
  const getState = jest.fn().mockImplementation(() => store);
  
  return { getState, setState };
};