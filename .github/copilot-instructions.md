# LinkCo — AI Coding Agent Instructions

Short, actionable guidance for contributors and AI coding agents working on this small, static prototype.

## What this repo contains (big picture)
- `index.html` — single-page UI with small sections: auth, create-flyer, search, feed. Navigation state is toggled by showing/hiding DOM regions.
- `styles.css` — global styling and responsive rules. There are a few syntax mistakes to watch for when editing (see Known Issues).
- `app.js` — client-side logic. Handles authentication (localStorage-based), flyer CRUD, search, image previews, auto-save form state, and view toggles.

The app is a static, client-only prototype. No build step or server is required to run it locally — serve the files over a static file server for full functionality (see Quick start).

## Key, discoverable patterns (exact examples)
- Visibility toggle: the `hidden` CSS class is used to show/hide UI blocks. Example: `document.getElementById('nav-user').classList.add('hidden')` (see `app.js`).
- ID naming: interactive elements use `btn-` prefix (`btn-register`, `btn-login`, `btn-create-flyer`). Avoid renaming IDs without updating `app.js`.
- Local storage keys: `users`, `currentUser`, `flyers`. The code also auto-saves individual inputs using their `id` as the key — renaming inputs changes persistence behavior.
- Image previews: `handleImagePreview('f-profile-image','profile-image-preview')` — files are converted to Data URLs and shown in `<img>` previews.

## Quick start (serve locally)
Recommended options for developer preview (PowerShell examples):
```powershell
# Option A: Python Simple HTTP server (works if Python is installed)
python -m http.server 8000

# Option B: Node "serve" (if Node/npm installed)
npx serve . -l 8000

# Option C: Use VS Code Live Server extension and open `index.html`
```

Open `http://localhost:8000` (or the Live Server URL) and use the UI. The app stores data in browser `localStorage` so state persists across reloads.

## Developer and AI agent conventions (do this in this repo)
- Minimal, low-risk changes first: prefer adding new IDs/classes rather than renaming existing ones — `app.js` references many IDs directly.
- Keep UI toggles declarative: add/remove the `hidden` class rather than inlining `style.display` changes.
- When changing storage keys or input IDs, update `app.js` and search for `loadFromStorage` / `saveToStorage` calls.
- Avoid introducing bundlers or complex build tools unless the project scope grows — current code expects direct script and link tags.

## Known issues discovered (fixes are discoverable in repo)
- `styles.css` contains syntax mistakes that break parsing: stray tokens like `auth-form h2,))`, an unmatched `)` before `box-shadow`, and a misplaced `)`. Fix CSS carefully and run the page in browser to verify style rendering.
- `index.html` uses `class=\"hidden\"` and many IDs; if you change markup, mirror updates in `app.js`.

## Useful code examples to reference
- Toggle guest/user nav (in `app.js`):
  - `navGuest.classList.remove('hidden'); navUser.classList.add('hidden');` — keep this pattern when adding views.
- LocalStorage usage (in `app.js`):
  - `saveToStorage('flyers', flyers)` and `loadFromStorage('users', [])` — use these helpers when extending persistence.

## Testing & debugging tips
- Open browser DevTools Console to inspect runtime errors (missing IDs throw `null` errors during startup).
- If the page appears unstyled, check `styles.css` for syntax errors (the file currently contains parse issues).
- Because the app is static, quickly test changes with Live Server or `python -m http.server`.

## When extending this project
- Add feature files alongside the top-level structure: `app.js` may be split later (e.g., `auth.js`, `flyers.js`) but remember to update `index.html` to load them in order.
- If adding a backend later, preserve localStorage keys or provide a migration path to sync server and client state.

---
If you want, I can: (1) fix the `styles.css` syntax errors, (2) add a small `README.md` with the quick-start commands, or (3) split `app.js` into modules. Which would you like next?
