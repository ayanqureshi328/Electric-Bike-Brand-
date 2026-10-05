# Velocity One

A responsive, single-page electric bike landing page with an interactive Three.js product scene and a MongoDB-backed preorder form.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to a reachable MongoDB database.
3. Start the Vite app and API together with `npm run dev`.
4. Open the local URL printed by Vite (usually `http://localhost:5173`).

The API listens on port 4000. `GET /api/health` reports API and database status. Without a working `MONGODB_URI`, the page remains available but preorder submissions return a clear unavailable message. For a production build, run `npm run build` and then `npm start`; the Express server serves the generated `dist` folder and the API.

## Preorder data

Submissions save name, normalized email, selected frame color, and timestamps in the `preorders` collection. MongoDB connection and `PORT` are configured through environment variables.
