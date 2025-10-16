# Client (Web) – Connecting to the API

- Stack: `React 18` + `TypeScript` + `Vite` + `Tailwind` + `Radix UI` + `Zustand`.
- Docker service: `coffee_web` serving a production build via Nginx on `http://localhost:3001/`.

## How the Frontend Connects
- API base URL in Docker: `VITE_API_URL=http://localhost:5050` (set in `docker-compose.yml`).
- Current prototype primarily uses local state and static data (`client/data/*`) and controllers for business logic.
- When integrating live calls, read `import.meta.env.VITE_API_URL` and call REST endpoints under `/api/*`.

Example fetch wrapper:
```ts
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5050';
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
- API: `http://localhost:5050/` (e.g., `http://localhost:5050/api/items`)
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