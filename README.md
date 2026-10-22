# AI-AURA — PUC College Event Website

Event date: **6 November 2026** · 18 events · PUC students only.

React 18 + Vite 5 frontend, Express 4 + MongoDB API, served together by a
single Node process.

- **Student portal** — http://localhost:3000
  Event explorer, announcements, countdown, 3D event cards, rules, registration form.
- **Admin portal** — http://localhost:3000/admin
  Login, dashboard counts, registrations table, reports (CSV + print/PDF),
  announcements and event date/time/venue.

---

## Repository layout

```
kle-aura/
├── package.json          # root workspace: scripts + shared dev tooling
├── tsconfig.json
├── .env.example          # every runtime variable (copy to .env)
│
├── backend/              # the API + the server  (ES modules)
│   ├── server.ts         # entrypoint: serves the API + the frontend
│   ├── app.js            # Express app + Mongo connection + /api routes
│   ├── routes/           # auth · registrations · announcements · settings
│   ├── models/           # mongoose schemas with in-memory fallback
│   ├── middleware/       # admin JWT guard
│   └── db/memoryStore.js # fallback store used when MongoDB is unreachable
│
└── frontend/             # the app  (ES modules)
    ├── index.html        # Vite entry
    ├── vite.config.js    # build + dev server + /api proxy
    ├── tailwind.config.cjs
    ├── postcss.config.cjs
    ├── .env.example
    ├── dist/             # production bundle (generated, git-ignored)
    ├── public/           # static assets served at /
    │   ├── images/       # campus, gallery, per-event posters
    │   ├── downloads/    # rules brochure PDF
    │   └── vat/          # 3D vertex-animation-texture assets
    ├── scripts/
    │   └── fetch-event-images.mjs   # re-download the event posters
    └── src/
        ├── index.js      # React entry
        ├── App.js        # router (/ and /admin)
        ├── api.js        # fetch wrapper + admin token handling
        ├── styles/       # index.css (tokens) · App.css
        ├── components/   # UI sections
        │   ├── admin/    # admin dashboard pieces
        │   └── events/   # EventCard
        ├── pages/        # StudentPortal · AdminPortal
        ├── data/         # events · rules · gallery · college content
        ├── hooks/        # useReveal · useTilt
        ├── lib/          # utils.js (dates, CSV, stats)
        └── three/        # three.js scenes + paper-card renderer
```

The project has exactly **two source folders**: `frontend/` and `backend/`.
`frontend/` and `backend/` are npm workspaces, so one `npm install` at the root
installs everything into a single root `node_modules`.

---

## Requirements

- Node.js 18+ (developed on Node 24)
- MongoDB — optional. Without it the API falls back to an in-memory store.

---

## Setup

```bash
npm install                 # installs both workspaces
cp .env.example .env        # then edit .env
```

Fill in `.env` (see [Environment variables](#environment-variables)). At minimum
set `MONGO_URI`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `JWT_SECRET`.

The API reads the **repo-root `.env`** no matter which directory it is started
from, so the same file works for every run mode.

---

## Running

### Everything on one port (recommended)

```bash
npm run dev                 # http://localhost:3000
```

Express serves the API and mounts Vite as middleware, so the frontend and the
API share an origin — no CORS, no proxy, no extra config.

### Frontend and API separately

```bash
npm run dev:api             # API  → http://localhost:5000
npm run dev:web             # app  → http://localhost:3000  (/api proxied to :5000)
```

### Production

```bash
npm run build               # builds frontend/ → frontend/dist/
npm start                   # NODE_ENV=production tsx backend/server.ts
```

`npm start` serves `frontend/dist/` as static files and falls back to
`index.html` for client-side routes such as `/admin`.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Unified dev server (API + Vite middleware) on `:3000` |
| `npm run dev:web` | Vite dev server only, `/api` proxied to `:5000` |
| `npm run dev:api` | Standalone API server on `:5000` |
| `npm run build` | Production build of the frontend into `frontend/dist/` |
| `npm start` | Production server (static `frontend/dist/` + API) |
| `npm run preview` | Preview the production bundle with Vite |
| `npm run fetch-images` | Re-download the 18 event posters from Unsplash |
| `npm run lint` | Placeholder — no linter is configured yet |

---

## Environment variables

All variables live in the repo-root `.env` (`.env.example` is the template).

| Variable | Default | Used by | Meaning |
|---|---|---|---|
| `PORT` | `3000` | unified server | Port for the combined app |
| `API_PORT` | `5000` | standalone API | Port when the API runs on its own |
| `MONGO_URI` | — | API | MongoDB connection string. Empty ⇒ in-memory store |
| `ADMIN_USERNAME` | `admin` | API | Admin login (case-insensitive) |
| `ADMIN_PASSWORD` | `admin123` | API | Admin password (case-**sensitive**) |
| `JWT_SECRET` | dev fallback | API | Signing secret — set a long random value |
| `REACT_APP_API_URL` | *(empty)* | frontend | Backend origin baked into the bundle |
| `VITE_PROXY_TARGET` | `http://localhost:5000` | frontend | Where the dev server proxies `/api` |
| `GEMINI_API_KEY` | — | — | Optional |

### About `REACT_APP_API_URL`

The value is inlined into the browser bundle at build time, so it is **public** —
put only the backend origin here, never credentials, a JWT secret or a database
URL.

- Leave it **empty** when the API is served from the same origin as the frontend
  (the unified server, or the dev proxy).
- Set it to the backend origin (for example `https://api.example.com`) when the
  two are deployed separately. Changing it requires a **new frontend build**.

The frontend also reads `frontend/.env` (see `frontend/.env.example`) for local
overrides.

---

## API

| Method | Route | Access |
|---|---|---|
| POST | `/api/registrations` | public |
| GET · DELETE | `/api/registrations` | admin |
| GET | `/api/registrations/recent` | public (first name + college + event only) |
| POST | `/api/auth/login` | public |
| GET | `/api/announcements` · `/api/settings` | public |
| POST · PUT · DELETE | `/api/announcements` | admin |
| PUT | `/api/settings` | admin |
| GET | `/api/health` | public |

The admin token is stored in `sessionStorage` and sent as
`Authorization: Bearer <token>`.

---

## Admin login

Set `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env` and open `/admin`.
The username is case-insensitive; the password is not. Change both (and
`JWT_SECRET`) before going live.

---

## Notes

- **Fallback store** — when MongoDB cannot be reached the API answers from an
  in-memory store so the site still works; the data is lost on restart.
- **3D** — real WebGL via three.js (hero scene, paper-style event cards, card
  tilt). Devices without WebGL fall back to a flat layout automatically.
  Code lives in `frontend/src/three/`.
- **Content** — event/rule/gallery data lives in `frontend/src/data/`. Replace
  the sample course lists in `data/college.js` with your real ones.
- **College photo** — `frontend/public/images/campus.jpg` is used by the 3D
  campus card, the hero background and the college section. Keep the filename.
- **Social links** — set them in `/admin → Event info`; blank links stay hidden.
- A **team** = students registering for the same event with the same team name.
  "Students" counts unique emails, "Colleges" counts unique college names.
