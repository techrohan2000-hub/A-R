# Wedding Planner — Phase 1

A personal family wedding command center for a Hindu Brahmin wedding, built as a static React app deployable for free on GitHub Pages. This is **Phase 1** of a multi-phase build: project setup, theme, layout, navigation, dashboard, wedding setup wizard, local persistence, and routing.

## What's in Phase 1

- ✅ Dashboard with live countdown, stat cards (tasks, budget, guests, vendors, shopping), and derived insights
- ✅ Wedding Setup wizard (couple details, tradition/customs, budget & guest planning)
- ✅ Sidebar (desktop) + bottom navigation with "More" sheet and floating Quick Add (mobile)
- ✅ All 22 planned modules are routed — unbuilt ones show a clear "coming in Phase N" state instead of a dead link
- ✅ Settings page: JSON backup export/import, start fresh, reload sample data, delete-all (with confirmation)
- ✅ Local-first persistence with optional Firebase real-time synchronization
- ✅ Realistic sample data (Rohan & Aishwarya, Maharashtrian tradition) so the app never looks empty
- ✅ GitHub Pages–ready build config + GitHub Actions auto-deploy workflow

Everything else (Timeline, Events & Rituals, Tasks, Guests, Shopping, Vendors, Budget, etc.) is scaffolded in navigation and routing, and will be filled in phase by phase.

## Tech stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · React Router (HashRouter) · Lucide icons · date-fns

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Firebase is optional for local development. Fill in `.env.local` with the web
app configuration from Firebase Console to enable cloud sync; without it, the
app continues to work using its browser cache.

## Production build

```bash
npm run build
```

This runs a strict TypeScript check followed by the Vite build, output to `dist/`. Preview it locally with:

```bash
npm run preview
```

## Deploying to GitHub Pages

This project is pre-configured for GitHub Pages with no extra setup needed:

- `vite.config.ts` uses `base: "./"` (relative asset paths), so the built site works at `https://<username>.github.io/<repo-name>/` regardless of the repo name.
- Routing uses `HashRouter` instead of `BrowserRouter`, so refreshing on any page (e.g. `/#/settings`) works correctly on GitHub Pages' static file server — no server-side rewrite rules needed.
- `.github/workflows/deploy.yml` builds and deploys automatically on every push to `main`.

### Steps

1. **Create a GitHub repository** and push this project to it:
   ```bash
   git init
   git add .
   git commit -m "Wedding planner: Phase 1"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages via Actions**:
   - Go to your repo → **Settings** → **Pages**
   - Under "Build and deployment", set **Source** to **GitHub Actions**

3. **Wait for deployment** — go to the **Actions** tab and watch the "Deploy to GitHub Pages" workflow run (triggers automatically on push, or run it manually via "Run workflow").

4. **Open your site** at:
   ```
   https://<username>.github.io/<repo-name>/
   ```

Any future push to `main` redeploys automatically.

## Firebase sync

The app synchronizes one shared Firestore document at `weddings/shared`.

1. Create a Firebase web app and a Firestore database.
2. Copy `.env.example` to `.env.local` and add the Firebase web configuration.
3. In the GitHub repository, add Actions secrets with the same six
   `VITE_FIREBASE_*` names. The deployment workflow injects them at build time.
4. Configure Firestore rules to allow the intended users to read and write
   `weddings/shared`.

There is no authentication yet. Public read/write rules make the shared planner
work, but anyone who can reach the project can modify the data. Use restricted
rules or add authentication before storing private information.

## Data storage & privacy

The app writes to `localStorage` first, then syncs to Firebase when configured.
This means:

- The planner remains usable if Firebase is unavailable or misconfigured.
- With Firebase configured, changes are shared across browsers and devices.
- Without Firebase, clearing browser data loses the local plan unless you exported a backup.
- **Export a backup regularly** from Settings → Backup & Restore. It downloads a plain JSON file you can re-import anytime, on any device.
- Don't commit sensitive documents (ID proofs, signed contracts, bank details) into this repository — GitHub repos, even private ones, are not a secure document vault. The Documents module (a later phase) will only store references/notes about where such files live, never the files themselves.

## Architecture notes for future phases

- **`src/services/storage/`** — all persistence goes through the `StorageAdapter` interface (`saveWedding`, `loadWedding`, `exportWedding`, `importWedding`). `FirebaseAdapter` maintains a local cache and synchronizes it with Firestore when configured.
- **`src/context/WeddingContext.tsx`** — single source of truth for the in-memory wedding workspace, wired to the storage layer.
- **`src/routes/navConfig.ts`** — the single list of all 22 modules (path, label, icon, build phase). Sidebar, bottom nav, and route generation all read from this one file, so adding a module's real page later is a one-line swap in `App.tsx`.
- **`src/types/wedding.ts`** — core data model. Extend this file as each phase adds a full module (Task, Guest, ShoppingItem, Vendor, etc. currently have lightweight "summary" shapes used for dashboard calculations).

## Design tokens

| Token | Hex | Use |
|---|---|---|
| `--color-cream` | `#FBF6EF` | Page background |
| `--color-maroon` | `#6D1E2F` | Primary accent, active states |
| `--color-gold` | `#B08D57` | Borders, dividers, secondary accent |
| `--color-peach` | `#F1D6C0` | Soft highlight backgrounds |
| `--color-beige` | `#EAE0CF` | Card borders, subtle backgrounds |
| `--color-charcoal` | `#2A2420` | Body text |

Fonts: **Cormorant Garamond** (headings), **Karla** (body/UI), **Inter** (numeric/data-dense contexts).
