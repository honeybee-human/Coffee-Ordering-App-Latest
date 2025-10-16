# Client (Web) – Connecting to the API

- Stack: `React 18` + `TypeScript` + `Vite` + `Tailwind` + `Radix UI` + `Zustand`.
- Docker service: `coffee_web` serving a production build via Nginx on `http://localhost:3001/`.

## How the Frontend Connects
- Recommended API base (Docker): `VITE_API_URL=http://localhost:5050/api` (set in `docker-compose.yml`).
- The client auto-appends `/api` if `VITE_API_URL` does not include it, so both `http://localhost:5050` and `http://localhost:5050/api` work.
- Live data is fetched by stores with local fallbacks:
  - Menu: `client/store/useItemsStore.ts` → `GET /api/menu`, falls back to `client/localDataArchive/menu.ts`.
  - Allergens: `client/store/useAllergenDataStore.ts` → `GET /api/allergen-groups`, falls back to `client/localDataArchive/allergenGroups.ts`.
- Existing client controllers and allergen utilities remain functional with remote data.

Example fetch wrapper:
```ts
const RAW = import.meta.env.VITE_API_URL ?? 'http://localhost:5050';
const API_BASE = RAW.endsWith('/api') ? RAW : `${RAW.replace(/\/+$/, '')}/api`;
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}
```

Example usage:
```ts
// Get items
const items = await api('/items');

// Create a group
const group = await api('/groups', {
  method: 'POST',
  body: JSON.stringify({ name: 'My Group' }),
});
```

## Useful URLs
- Web UI: `http://localhost:3001/`
- API: `http://localhost:5050/api` (e.g., `http://localhost:5050/api/menu`)
- Mongo Express: `http://localhost:8082/`

## Local Development
- Start dev server: `npm run dev` → `http://localhost:3000`
- Vite server config: `client/vite.config.js` sets port `3000` and `open: true`.

## Building & Preview
- Build: `npm run build`
- Preview: `npm run preview`

## Notes
- In production (Docker), the app is a static build served by Nginx; hot reload is only available when running `vite` locally.
- Types shared with server are re-exported via path alias `@server/*` without bundling mongoose (see `client/tsconfig.json`).

### Troubleshooting
- If the UI shows “Using local menu (network fallback)”, the API request failed.
  - Confirm API is running: `http://localhost:5050/api/health` → `200`.
  - Check `VITE_API_URL` includes the correct host and base. Using `http://localhost:5050/api` is preferred.