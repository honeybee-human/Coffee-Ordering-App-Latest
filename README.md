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
- Context API (state management)

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
- `/context` - React Context providers
- `/data` - Static data (menu items)
- `/hooks` - Custom React hooks
- `/styles` - Global CSS and styling
- `/types` - TypeScript type definitions
- `/utils` - Utility functions

## State Management

The application uses React Context API for state management with the following contexts:

- `AppContext` - Manages application data (groups, favorites, order history)
- `NavigationContext` - Handles navigation between pages
- `ModalsContext` - Controls modal dialogs
- `AllergensContext` - Manages allergen filtering and warnings

## Data Persistence

Application data is stored in the browser's `sessionStorage` for temporary persistence between page refreshes.
