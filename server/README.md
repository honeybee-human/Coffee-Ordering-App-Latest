# Server (API) – Overview & Operations

- Stack: `Express` + `TypeScript` + `Mongoose`.
- Purpose: serve menu items, groups, and orders via REST under `http://localhost:5050/api`.
- Run modes:
  - Docker: `coffee_api` container on port `5050 -> 5000`.
  - Local dev: `npm run dev` starts on `http://localhost:5000`.

## Quick Start
- Docker compose: `docker compose up -d --build`
- Tail logs: `docker logs coffee_api -f` or `docker compose logs -f api`
- Restart API: `docker compose restart api`
- Stop API: `docker stop coffee_api`

## Environment
Resolved in `src/config/env.ts`:
- `NODE_ENV` (default `development`)
- `PORT` (default `5000`)
- `MONGO_URL` (default `mongodb://localhost:27017/coffeeapp`)
- `CORS_ORIGIN` (default `*`)

Docker Compose sets:
- `PORT=5000`
- `MONGO_URL=mongodb://mongo:27017/coffeeapp`
- `CORS_ORIGIN=*`

## Routes
Base path: `/api`
- `GET /health` – service health check.
- `GET /items` – list items (coffee and pastry).
- `GET /menu` – grouped menu: returns `{ coffee, pastry }`.
- `GET /allergen-groups` – returns `{ groups, individualAllergens }`.
- `GET /groups` – list groups.
- `POST /groups` – create group `{ name }`.
- `GET /orders` – list orders.
- `POST /orders` – create order (see schema).

## Models (Mongoose)
- `Item` – base menu items with discriminator for `coffee` and `pastry` in `src/models/menu.ts`.
- `ProgressItem` – customized items in progress.
- `CartItem` & `FavoriteItem` – cart and favorites document types.
- `Group` – groups with embedded `cart` array.
- `Order` – orders containing snapshot items and metadata.

## Logging
Global middleware logs each request:
- Start: `[req:start] { id, method, path, query, bodyKeys }`
- Finish: `[req:done] { id, status, ms }`

View logs:
- All services: `docker compose logs -f`
- API only: `docker logs coffee_api -f`

## Database & Seeding
- Database: `coffeeapp` in MongoDB.
- Seed script: `mongo-init/01-init.js` automatically runs via Compose and inserts menu items and allergen data if collections are empty.
- Inspect via Mongo Express: `http://localhost:8082`

## Build & Start
- Build (Dockerfile multi-stage) compiles TypeScript to `dist` and runs `node dist/index.js`.
- Local build: `npm run build`; start: `npm start`.

## Notes
- CORS defaults to `*` for simplicity; restrict in production.
- If you edit `src/*`, rebuild container: `docker compose up -d --build`.
 - Docker maps container port `5000` to host `5050` (`http://localhost:5050`). Ensure clients call `http://localhost:5050/api/...`.