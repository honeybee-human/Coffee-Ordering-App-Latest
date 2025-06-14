# Testing Guide

## Overview

This project uses Jest and React Testing Library for testing. The testing setup includes:

- **Jest**: Test runner and assertion library
- **React Testing Library**: Library for testing React components
- **jest-dom**: Custom matchers for DOM assertions

## Test Structure

Tests are organized in the `__tests__` directory, mirroring the structure of the source code:

```
__tests__/
├── components/       # Tests for React components
├── store/            # Tests for Zustand stores
├── utils/            # Tests for utility functions
└── utils/test-utils.tsx  # Testing utilities and helpers
```

## Running Tests

You can run tests using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Testing Components

Use React Testing Library to test components. Focus on testing behavior rather than implementation details.

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('responds to user interaction', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Testing Zustand Stores

Test Zustand stores by directly accessing the store's state and actions.

```tsx
import { useMyStore } from '@/store/useMyStore';

describe('useMyStore', () => {
  // Reset the store before each test
  beforeEach(() => {
    useMyStore.setState({ count: 0 });
  });

  it('increments the count', () => {
    const { increment } = useMyStore.getState();
    increment();
    expect(useMyStore.getState().count).toBe(1);
  });
});
```

### Testing Utilities

Test utility functions by providing inputs and asserting on outputs.

```tsx
import { formatCurrency } from '@/utils/formatters';

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(10.5)).toBe('$10.50');
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
```

## Testing Utilities

The project includes custom testing utilities in `__tests__/utils/test-utils.tsx`:

- `render`: A custom render function that wraps components with necessary providers
- `createStoreMock`: A helper for mocking Zustand stores

Use these utilities to simplify testing:

```tsx
import { render, screen } from '@/__tests__/utils/test-utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders with providers', () => {
    render(<MyComponent />);
    // Component is now rendered with all necessary providers
  });
});
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it.
2. **Use user-centric queries**: Prefer queries like `getByRole`, `getByLabelText`, and `getByText` over `getByTestId`.
3. **Keep tests isolated**: Each test should be independent of others.
4. **Mock external dependencies**: Use Jest's mocking capabilities to isolate the code being tested.
5. **Test edge cases**: Consider empty states, error states, and boundary conditions.
6. **Keep tests simple**: Each test should verify one specific behavior.
7. **Use descriptive test names**: Test names should clearly describe what is being tested.