# Amirali — 3D Portfolio

An interactive portfolio: a 3D MacBook Pro with a real, working resume website
rendered on its screen.

**Desktop** — click the screen to zoom in; the resume becomes near-fullscreen
(with the MacBook bezel framing it) and is fully interactive: click the tabs,
use ← → arrow keys to flip sections, press `Esc`, the back button, or
double-click outside the screen to zoom out.

**Mobile** — one tap on the screen zooms in and opens a readable fullscreen
resume; double-tap empty space (or ✕) to zoom back out.

**Theming** — dark mode by default, light mode via the toggle in the page
header or the menubar on the MacBook's screen. The choice is persisted.

Built with [React](https://react.dev), [Vite](https://vite.dev),
[three.js](https://threejs.org) and
[react-three-fiber](https://docs.pmnd.rs/react-three-fiber) /
[drei](https://github.com/pmndrs/drei).

## Run it

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build in dist/
```

## Edit your resume

All resume content lives in **`src/data/resume.ts`** — name, title, about,
experience, projects, skills, and contact links. Edit that one file and the
site on the MacBook screen updates.

## Project structure

- `src/App.tsx` — canvas, lighting, overlay UI (hint + back button), zoom state
- `src/components/MacBook.tsx` — the 3D model, float animation, and the
  `<Html>` screen embed
- `src/components/CameraRig.tsx` — camera: pointer parallax when idle, fly-to-
  screen when zoomed
- `src/components/ResumeScreen.tsx` — the macOS-style resume site shown on the
  screen
- `src/data/resume.ts` — ✏️ your content

## Credits

3D model: ["MacBook Pro M3 16 inch 2024"](https://sketchfab.com/3d-models/macbook-pro-m3-16-inch-2024-8e34fc2b303144f78490007d91ff57c4)
by [jackbaeten](https://sketchfab.com/jackbaeten), licensed
[CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/).
