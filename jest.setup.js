// Import jest-dom matchers for additional DOM assertions
require('@testing-library/jest-dom');

// Mock window.matchMedia for components that use media queries
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

// Suppress React 18 console errors related to act warnings
global.console.error = jest.fn().mockImplementation((message) => {
  if (message.includes('Warning: ReactDOM.render is no longer supported')) {
    return;
  }
  if (message.includes('act(...)')) {
    return;
  }
  console.error(message);
});