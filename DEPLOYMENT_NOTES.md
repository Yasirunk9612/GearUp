# Deployment & Run Notes

This file explains how to run the project locally and how to deploy the frontend to Vercel (and point it at a hosted backend). It also highlights an important timing note: wait up to **50 seconds** after (re)deployment for the backend to become reachable.

---

## Quick local run (recommended for development)

1. Clone the repo and install dependencies:

```bash
cd /path/to/GearUp-main

# backend
cd backend
npm install

# frontend (in another terminal)
cd ../frontend
npm install
```

2. Configure backend environment variables

Create `backend/.env` (do NOT commit this file) with at least:

```
MONGO_URI="mongodb://localhost:27017/gearup"
PORT=5001
# optional email settings if you want to test emails
# EMAIL_HOST=...
# EMAIL_PORT=...
# EMAIL_USER=...
# EMAIL_PASS=...
# FROM_EMAIL="GearUp <no-reply@example.com>"
```

3. Seed sample products (optional):

```bash
cd backend
npm run seed:products
```

4. Start backend and frontend

```bash
# Terminal 1 - backend
cd backend
npm start

# Terminal 2 - frontend
cd frontend
npm start
```

Frontend expects the API at `http://localhost:5001/api` by default. If you run the backend on a different port or host, set `REACT_APP_API_URL` before starting the frontend. Example:

```bash
# In frontend terminal (macOS/zsh)
export REACT_APP_API_URL="http://localhost:5001/api"
npm start
```

---

## Deploying the frontend to Vercel (static React app)

This project uses Create React App for the frontend; Vercel is a good option to host the static build.

1. Push the repository to GitHub (or Git provider) and connect it to Vercel.
2. In Vercel, create a new project and select the `frontend/` folder as the root if you prefer deploying only the frontend app.
3. Build settings (default CRA settings usually work):
   - Framework preset: Create React App
   - Root Directory: `/frontend` (if you point Vercel to the monorepo root, ensure the correct subdirectory is used)
4. Configure environment variables in the Vercel project settings:
   - `REACT_APP_API_URL` — set this to your deployed backend base URL (for example `https://your-backend.example.com/api`)
5. Deploy. Vercel will build and serve the frontend.

Important: After a deployment, the frontend may load and immediately try to call the backend. If your backend has also been (re)deployed or uses on-demand cold starts, allow up to **50 seconds** for the backend to finish starting and become reachable before retrying actions in the UI. If you see errors immediately after deploying, wait ~50 seconds and retry.

---

## Deploying the backend

The repository contains an Express backend under `backend/`. Vercel can host serverless functions, but for a full Express server you may prefer a platform that supports long-running Node servers (Render, Railway, Heroku, DigitalOcean App Platform, or a VPS). If you do use Vercel, you will need to adapt the server to serverless functions or deploy the backend as a separate service.

Summary steps for a typical backend deployment (example: Render or Railway):

1. Push `backend/` to your Git provider or use the monorepo and point the service to the `backend/` directory.
2. Add environment variables in the host provider's dashboard (MONGO_URI, EMAIL_* if used, PORT if required).
3. Start the service and copy the base URL provided by the host (for example `https://gearup-backend.onrender.com`).
4. In Vercel (frontend) set `REACT_APP_API_URL` to `${BACKEND_BASE_URL}/api`.

Note: If the backend host requires a cold start (server startup), after deployment the backend might take a few seconds to be ready. Allow up to **50 seconds** before the frontend will reliably connect.

---

## Example: Deploying frontend to Vercel and backend to Render

1. Deploy backend to Render (or similar). Note the backend URL, e.g. `https://gearup-backend.onrender.com`.
2. Deploy frontend to Vercel and set `REACT_APP_API_URL` to `https://gearup-backend.onrender.com/api` in Vercel project settings.
3. After both are deployed, if the UI shows backend errors immediately, wait up to **50 seconds** and refresh.

---

## Troubleshooting

- Backend unreachable after deployment: check provider logs for startup errors. If logs show successful listen but frontend still errors, ensure `REACT_APP_API_URL` exactly matches the backend URL (including `/api` if required).
- CORS errors: ensure backend includes CORS middleware and allows the Vercel origin (or `*` during testing).
- Email not sending: verify all SMTP env vars and provider restrictions.

---

## Quick checklist before giving the Vercel link to users

- [ ] Backend deployed and environment variables set (MONGO_URI, EMAIL_* if used)
- [ ] Frontend deployed to Vercel with `REACT_APP_API_URL` set to the backend URL
- [ ] Wait at least **50 seconds** after deployments for the backend to become reachable (note this to users)
- [ ] Confirm sample products present (run seeder or verify DB)

---

If you want, I can:

- Add a short health-check endpoint to the backend (e.g. `GET /api/health`) returning `{status: 'ok'}` so the frontend or monitoring can poll and detect when the backend is ready.
- Add a short blurb to the frontend that shows "Connecting to backend... please wait" for the first 60s when the frontend can't reach the API.

Tell me which of these you'd like me to add and I'll implement it.
