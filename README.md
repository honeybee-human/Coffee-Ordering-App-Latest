# SafePlate - Coffee Ordering App

A React-based coffee ordering application with group ordering capabilities, allergen tracking, and a modern UI.

## Features

- Group ordering system
- Allergen tracking and warnings
- Customizable coffee and pastry orders
- Favorites management
- Order history
- Mobile-responsive design

## Tech Stack

- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Radix UI (UI components)
- Zustand (state management)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

### Building for Production

Create a production build:

```bash
npm run build
# or
yarn build
```

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

- `/components` - UI components
- `/data` - Static data (menu items)
- `/hooks` - Custom React hooks
- `/store` - Zustand stores
- `/styles` - Global CSS and styling
- `/types` - TypeScript type definitions
- `/utils` - Utility functions

## State Management

The application uses Zustand for lightweight, composable state management. Key stores include:

- `useNavigationStore` – current page, navigation actions
- `useGroupsStore` – groups, members, cart per group, active group
- `useModalsStore` – modal visibility and flows
- `useOrdersStore` – completed orders and order actions
- `useFavoritesStore` – item and cart-set favorites
- `useAllergensStore` – excluded allergens and auto-filter settings

Some stores use persistence via `zustand/persist` to `localStorage` for durability across sessions.

## Data Persistence

Application data is persisted in the browser's `localStorage` for durability across sessions. Persisted stores include groups, favorites, orders, and allergen settings.
