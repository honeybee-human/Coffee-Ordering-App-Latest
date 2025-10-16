# Coffee Ordering App – Run & Access Guide

This project runs as a Docker stack with four services:
- `coffee_web` UI at `http://localhost:3001/`
- `coffee_api` Express API at `http://localhost:5050/`
- `coffee_mongo_express` DB UI at `http://localhost:8082/`
- `coffee_mongo` MongoDB (no direct browser UI)

Quick start (Docker):
- Build and start: `docker compose up -d --build`
- See status: `docker compose ps`
- Tail logs (all): `docker compose logs -f`
- Tail API logs: `docker logs coffee_api -f`
- Tail Web logs: `docker logs coffee_web -f`
- Stop all: `docker compose stop`
- Restart all: `docker compose restart`
- Tear down: `docker compose down` (use `-v` to also remove volumes)

Local dev (no Docker):
- API: `cd server && npm install && npm run dev` → `http://localhost:5000`
- Web: `cd client && npm install && npm run dev` → `http://localhost:3000`

Useful endpoints:
- Health: `http://localhost:5050/api/health`
- Items (legacy): `http://localhost:5050/api/items`
- Menu: `http://localhost:5050/api/menu`
- Allergen data: `http://localhost:5050/api/allergen-groups`
- Groups: `http://localhost:5050/api/groups`
- Orders: `http://localhost:5050/api/orders`

Notes:
- When using Docker, the web app serves a production build via Nginx; use the log commands above to monitor.
- Use Mongo Express at `http://localhost:8082` to inspect collections and documents.
- If you change server code, rebuild with `docker compose up -d --build`.

## Client Data Flow

- The client fetches the live menu from `GET /api/menu` via `client/store/useItemsStore.ts`.
- If the network call fails, it falls back to local data in `client/localDataArchive/menu.ts` and shows a small notice.
- Allergen groups and individual allergens are loaded from `GET /api/allergen-groups` via `client/store/useAllergenDataStore.ts` with a similar local fallback to `client/localDataArchive/allergenGroups.ts`.
- Existing client-side group allergen logic remains intact, so group-based filtering and selection continue to work.

## Troubleshooting

- “cannot GET /” at `http://localhost:5000/` on the host: the API is mapped to `http://localhost:5050` by Docker. Use `http://localhost:5050/api/...`.
- UI shows “Using local menu (network fallback)”: typically indicates the API URL/path mismatch or the API isn’t reachable.
  - Verify API is up: `curl http://localhost:5050/api/health` should return `200`.
  - Ensure `VITE_API_URL` is set; recommended value: `http://localhost:5050/api`.
  - If `VITE_API_URL` omits `/api`, the client auto-appends it — but prefer including `/api` explicitly.
  - Confirm ports: API is `5050 -> 5000` via Docker; Web is `3001 -> 80`.

# SafePlate - Coffee Ordering App

SafePlate is a conceptual Business to Consumer (B2C) restaurant ordering app designed to manage group orders and provide real-time allergen warnings. If developed for public release, it would be offered free to promote accessibility and prevent severe allergy-related emergencies.

The project currently reads JSON files to render restaurant menus and ordering options. A future enhancement will allow dynamic theming based on each restaurant’s brand colors and style. For demonstration purposes, the prototype uses a fictional café, Bean Bite, to showcase end-to-end functionality and UI design.

https://coffee-ordering-app-latest-sux3.vercel.app/

## Features

- Group ordering system
- Allergen tracking and warnings, including not only base ingredients but also add-ons
- Customizable coffee and pastry orders with blocked assignments if a member is allergic
- Favorites management per group with memory of member allergies and addition/removal according to member joining or leaving groups
- Order history with ability to save and reorder previous sets, ability to filter by group
- Mobile-responsive design acknowledging the navigation, menu, filters, order summary, checkout page

## Tech Stack

- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Radix UI (UI components)
- Zustand (state management)

## Screenshots
### Landing Page
<img width="1105" height="616" alt="LandingStart" src="https://github.com/user-attachments/assets/183acb34-38e5-4d1f-bf84-9f503e2e76d4" />
<img width="1103" height="617" alt="LandingSafetyChecks" src="https://github.com/user-attachments/assets/d758b344-a35e-4c70-b008-9bee60e6d016" />
<img width="1100" height="609" alt="LandingFAQ" src="https://github.com/user-attachments/assets/4684b6cd-021f-43a3-8720-a7af5fed06e2" />

### Menu
  <img width="1106" height="614" alt="Menu" src="https://github.com/user-attachments/assets/76dafc84-711a-4112-ae5d-bd0042eb8480" />
<img width="944" height="313" alt="Filters" src="https://github.com/user-attachments/assets/6cacd9f0-5b39-4cdf-8834-53ead4b7e8c3" />

### Single Page
<img width="1105" height="613" alt="CoffeePage" src="https://github.com/user-attachments/assets/0d752afe-5e72-4538-b734-0f3aa1377c0f" />
<img width="1106" height="614" alt="CoffeeAssignmentBlocked" src="https://github.com/user-attachments/assets/9c16d591-3133-4486-9f9e-1f29d3bb6c7b" />
<img width="314" height="149" alt="ImportedAssignToGroupMemberComponent" src="https://github.com/user-attachments/assets/3a025831-fde1-4bb5-9d58-a008dac19811" />
<img width="377" height="231" alt="ConflictCustomization" src="https://github.com/user-attachments/assets/64ac789d-f6a4-4d66-a641-fe81628c0c74" />

### Group Management
<img width="1098" height="614" alt="Groups" src="https://github.com/user-attachments/assets/51df90f6-9a7d-432f-900a-c336d326aa1a" />
<img width="386" height="245" alt="ChangeGroups" src="https://github.com/user-attachments/assets/f75c12c9-123b-4d96-830c-e7b80e42ebd8" />
<img width="476" height="299" alt="AutocompleteAllergens" src="https://github.com/user-attachments/assets/82936c70-997f-49b6-b5b0-724c5830ffe8" />
<img width="1108" height="612" alt="AllGroups" src="https://github.com/user-attachments/assets/bd36f5e1-2ca6-4418-9351-eb767f6e28a9" />
<img width="386" height="205" alt="SaveSet" src="https://github.com/user-attachments/assets/0d428f10-d6fe-464e-b06e-8a6d04b52b80" />
<img width="1106" height="601" alt="SavedSet" src="https://github.com/user-attachments/assets/baeb7e7d-65c7-47bb-9541-0ea25c8d75a4" />

### Mobile
<img width="299" height="551" alt="MobileNavbar" src="https://github.com/user-attachments/assets/67c623cb-55b3-48f4-ad3a-e27d05fc5728" />
<img width="308" height="557" alt="MobileMenu" src="https://github.com/user-attachments/assets/730875bc-c6a2-4552-bdd4-605bbdba6646" />
<img width="293" height="557" alt="MobileCheckout" src="https://github.com/user-attachments/assets/4eeb9b4f-7e9e-41c9-823b-90fe81675a4a" />

<img width="293" height="557" alt="MobileCheckout" src="https://github.com/user-attachments/assets/a1cacdd3-f3cd-4d7e-a8f8-475c7a311f73" />

<img width="299" height="551" alt="MobileOrderSummary" src="https://github.com/user-attachments/assets/9a828a9b-ec76-4cde-8dc7-13c2f934b23c" />
<img width="329" height="294" alt="OrderCompleteModal" src="https://github.com/user-attachments/assets/5a3e2fc7-f914-4282-a47e-a89cdb09836e" />

<img width="298" height="550" alt="MobileOrderHistory" src="https://github.com/user-attachments/assets/cef2ba39-2903-4751-a44e-87066939c7ef" />


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
