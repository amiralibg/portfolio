// ✏️ Personal work only — things Amirali built and owns. Employment lives in
// resume.ts and never appears here; a job is not a portfolio piece.
//
// Screenshots live in `public/projects/<slug>.webp` and are referenced by path,
// so adding one is just: drop the file in, set `cover`. Run them through
// `cwebp -q 82 -resize 1600 0` first — the raw captures were 16MB total, which
// is larger than the rest of the site put together. Extra shots go in `gallery`
// and Quick Look becomes a slideshow. Without a cover the card renders a
// typographic placeholder — deliberate, not broken.
//
// `stars` is a fallback snapshot, not the number normally shown: useGitHubStars
// fetches live counts (cached 6h) and the card prefers those. The snapshot is
// what renders instantly on first paint and what survives a rate limit or an
// offline visitor, so it's worth refreshing when it drifts.
import type { CaseStudy } from './caseStudy'

export interface Project extends CaseStudy {
  /** Featured projects render as full case-study rows above the grid. */
  featured?: boolean
  /** Fallback star count, used until/unless the live fetch returns. */
  stars?: number
}

/** When the fallback star counts were last checked by hand. */
export const STARS_UPDATED = '2026-10-21'

export const projects: Project[] = [
  {
    slug: 'unstream',
    cover: '/projects/unstream.webp',
    name: 'Unstream',
    tagline: 'Your music library, as files you actually own',
    year: '2026',
    role: 'Creator & maintainer',
    kind: 'open source',
    stars: 259,
    featured: true,
    story: {
      problem:
        'Music you "own" on a streaming service disappears the day a licence lapses ' +
        'or a subscription ends — and every tool that gets you real files wants an ' +
        'account, an API key, or a payment.',
      built:
        'A self-hosted app that takes a Spotify, Deezer, Apple Music, YouTube or ' +
        'SoundCloud link — or searches every catalogue at once — and returns properly ' +
        'tagged audio at the quality you choose. React + TypeScript front end over a ' +
        'Python backend, shipped as one `docker compose up`, with the whole interface ' +
        'in both Farsi and English.',
      impact:
        'Over 250 stars and a steady stream of self-hosters. Files land in a real ' +
        'folder on your own disk: nothing expires, and nobody stands in between.',
    },
    metrics: [
      { value: '0', label: 'accounts or API keys' },
      { value: '5', label: 'catalogues' },
      { value: 'FA/EN', label: 'bilingual UI' },
    ],
    tech: ['TypeScript', 'React', 'Python', 'FastAPI', 'Docker', 'ffmpeg'],
    links: { live: 'https://unstream.amiralibg.xyz', github: 'https://github.com/amiralibg/unstream' },
  },
  {
    slug: 'wake',
    cover: '/projects/wake.webp',
    gallery: ['/projects/wake-trail.webp', '/projects/wake-deck.webp', '/projects/wake-devtools.webp'],
    name: 'Wake',
    tagline: 'A browser where pages are columns in a trail, not tabs in a bar',
    year: '2026',
    role: 'Creator & maintainer',
    kind: 'open source',
    stars: 17,
    featured: true,
    story: {
      problem:
        'Tabs throw away the path you took: three links deep, the page you started ' +
        'from is a tab title too narrow to read. And nearly every browser that tries ' +
        'something different ships its own copy of Chromium to do it.',
      built:
        'A native browser on the web engine the system already has — SwiftUI, AppKit ' +
        'and WebKit on the Mac; a small Rust host with a React + TypeScript interface ' +
        'on WebView2 and WebKitGTK for Windows and Linux. Links open as columns to the ' +
        'right. ⌘K raises the Deck, every thread as a live card. Moments save your exact ' +
        'place on a page, and on localhost a DevTools column covers elements, console, ' +
        'network, storage and performance.',
      impact:
        'One browser on three platforms with no Electron and no bundled engine, signed ' +
        'releases that update themselves, a Homebrew cask, and a site where your cursor ' +
        'leaves a wake on live water.',
    },
    metrics: [
      { value: '3', label: 'platforms' },
      { value: '0', label: 'bundled engines' },
      { value: '⌘K', label: 'the Deck' },
    ],
    tech: ['Swift', 'SwiftUI', 'WebKit', 'Rust', 'TypeScript', 'React', 'Metal'],
    links: {
      live: 'https://wake.amiralibg.xyz',
      writeup: 'https://wake.amiralibg.xyz/about.html',
      github: 'https://github.com/amiralibg/wake',
    },
  },
  {
    slug: 'doran',
    cover: '/projects/doran.webp',
    name: 'Doran',
    tagline: 'The missing Persian calendar toolkit for the web',
    year: '2026',
    role: 'Creator & maintainer',
    kind: 'open source',
    stars: 82,
    featured: true,
    story: {
      problem:
        'Persian (Jalali) dates are a second-class citizen in JavaScript — every ' +
        'project re-implements date math, holidays and RTL pickers from scratch, ' +
        'and each one gets the edge cases wrong in its own way.',
      built:
        'A twelve-package monorepo built around a zero-dependency Jalali date engine: ' +
        'a natural-language Persian date parser, a holidays dataset, Zod schemas, an ' +
        'ESLint plugin and a codemod — plus accessible UI adapters for React, Vue, ' +
        'Svelte, Angular and Web Components, so the framework you use is not a factor.',
      impact:
        'One coherent, typed toolkit replaces a pile of ad-hoc utilities. Install, ' +
        'import, and Persian dates just work — whatever you build in.',
    },
    metrics: [
      { value: '12', label: 'packages' },
      { value: '5', label: 'framework adapters' },
      { value: '0', label: 'runtime deps in core' },
    ],
    tech: ['TypeScript', 'Turborepo', 'React', 'Vue', 'Svelte', 'Angular', 'Web Components', 'Vitest'],
    links: { docs: 'https://amiralibg.github.io/Doran/', github: 'https://github.com/amiralibg/Doran' },
  },
  {
    slug: 'marky',
    cover: '/projects/marky.webp',
    name: 'Marky',
    tagline: 'Markdown notes that stay plain files in your own folder',
    year: '2026',
    role: 'Creator & maintainer',
    kind: 'open source',
    stars: 28,
    featured: true,
    story: {
      problem:
        'Note apps hold your writing in their own database or their own cloud, so ' +
        'leaving one means an export, and the export never quite round-trips.',
      built:
        'An offline-first desktop app on Tauri, React and Rust over an ordinary folder ' +
        'of Markdown files: a CodeMirror 6 editor, wiki links with backlinks, a graph ' +
        'view, fuzzy search, templates and daily notes, Mermaid and KaTeX, Vim mode — ' +
        'plus an MCP server so Claude Desktop or Cursor can read and write your notes.',
      impact:
        'Installers under 10 MB, auto-saving, shipped through GitHub releases and a ' +
        'Homebrew cask. Git it, sync it, or keep it on a USB stick — the files are yours.',
    },
    metrics: [
      { value: '<10 MB', label: 'native installers' },
      { value: '100%', label: 'offline' },
      { value: 'MCP', label: 'AI integration' },
    ],
    tech: ['Tauri', 'Rust', 'React', 'TypeScript', 'CodeMirror 6', 'MCP'],
    links: { live: 'https://marky.amiralibg.xyz', github: 'https://github.com/amiralibg/marky' },
  },
  {
    slug: 'weft',
    name: 'Weft',
    tagline: 'A tiling window manager for macOS, with your shortcuts built in',
    year: '2026',
    role: 'Creator & maintainer',
    kind: 'open source',
    stars: 29,
    story: {
      problem:
        'Tiling on macOS usually means two tools taped together: a window manager, ' +
        'plus a hotkey daemon that launches a process on every keypress. Some also ' +
        'want System Integrity Protection switched off.',
      built:
        'One small native Swift app that tiles each macOS desktop as a workspace and ' +
        'handles shortcuts in-process. BSP and float layouts per space, moves that ' +
        'restructure the layout tree instead of swapping sizes, stacks, vim-style ' +
        'modes, window rules, multi-display, and a menu-bar app with a visual settings ' +
        'editor and a ⌘K keybinding cheatsheet.',
      impact:
        'Focus, move and resize with no wait. Mission Control, swipes and full-screen ' +
        'apps keep working as macOS ships them, and SIP stays on.',
    },
    metrics: [
      { value: '0', label: 'processes per keypress' },
      { value: 'SIP', label: 'left enabled' },
      { value: '2', label: 'layouts per space' },
    ],
    tech: ['Swift', 'AppKit', 'Accessibility API', 'launchd'],
    links: { github: 'https://github.com/amiralibg/weft' },
  },
  {
    slug: 'eshterakino',
    cover: '/projects/eshterakino.webp',
    name: 'Eshterakino',
    tagline: 'Every subscription in one place, with a reminder before the charge',
    year: '2026',
    role: 'Creator',
    kind: 'open source',
    stars: 7,
    story: {
      problem:
        'Streaming, hosting, domains, the gym — recurring charges pile up quietly, and ' +
        'trackers built for other markets know nothing about the Jalali calendar, toman ' +
        'or Persian text.',
      built:
        'A local-first tracker in React 19 and Dexie with a full Persian RTL interface. ' +
        'Dates go in as natural language («سه هفته دیگه») through my own Doran toolkit, ' +
        'foreign prices convert at live rates, and an optional Express + SQLite server ' +
        'adds cross-device sync, share links and daily Telegram reminders.',
      impact:
        'Works with no account and no server — data never leaves the device unless you ' +
        'turn sync on. And it is Doran running in a real product.',
    },
    metrics: [
      { value: '0', label: 'accounts' },
      { value: 'RTL', label: 'Persian-first UI' },
      { value: 'local', label: 'first, sync optional' },
    ],
    tech: ['React', 'TypeScript', 'Dexie', 'TailwindCSS', 'Doran', 'Express', 'SQLite'],
    links: { live: 'https://eshterakino.amiralibg.xyz', github: 'https://github.com/amiralibg/eshterakino' },
  },
  {
    slug: 'redistal',
    name: 'Redistal',
    tagline: 'A Redis GUI that feels like a Mac app, because it is one',
    year: '2026',
    role: 'Creator',
    kind: 'open source',
    story: {
      problem:
        'Redis desktop clients are Electron apps wearing a native costume — slow to ' +
        'launch, heavy in memory, and visibly not from the platform they run on.',
      built:
        'A genuinely native macOS client on Tauri: a Rust core doing the Redis work ' +
        'and connection handling, with a React + TypeScript interface on top. Ships as ' +
        'a real app bundle, not a browser in disguise.',
      impact:
        'Opens fast, stays small, and behaves like the rest of the desktop — the ' +
        'baseline a daily-driver database tool should meet.',
    },
    metrics: [
      { value: 'Rust', label: 'native core' },
      { value: 'Tauri', label: 'not Electron' },
    ],
    tech: ['Tauri', 'Rust', 'React', 'TypeScript', 'Zustand', 'TailwindCSS'],
    links: { github: 'https://github.com/amiralibg/redistal' },
  },
  {
    slug: 'pass',
    cover: '/projects/pass.webp',
    name: 'Pass',
    tagline: 'Party games for one phone passed around the table',
    year: '2026',
    role: 'Creator',
    kind: 'open source',
    story: {
      problem:
        'Party game apps ask everyone at the table to download something and make an ' +
        'account — which is most of the evening gone before anyone plays.',
      built:
        'A set of games designed around a single shared device: one phone, passed ' +
        'from hand to hand, no install and no signup. React + TypeScript with an ' +
        'animation layer doing the handoff choreography.',
      impact: 'Open the link, hand over the phone, play. That is the whole setup.',
    },
    metrics: [
      { value: '1', label: 'device needed' },
      { value: '0', label: 'accounts' },
    ],
    tech: ['TypeScript', 'React', 'Vite', 'Zustand', 'Motion', 'TailwindCSS'],
    links: { live: 'https://pass.amiralibg.xyz', github: 'https://github.com/amiralibg/pass' },
  },
  {
    slug: 'boxbox',
    cover: '/projects/boxbox.webp',
    name: 'BoxBox',
    tagline: 'Formula One telemetry, replayed lap by lap',
    year: '2026',
    role: 'Creator',
    kind: 'open source',
    story: {
      problem:
        'Broadcast F1 coverage shows you the gap but never the reason — where the ' +
        'time actually went, corner by corner, between two laps.',
      built:
        'A technical telemetry tool: lap replay, head-to-head lap comparison, ' +
        'historical session analysis and configurable data exports, built on Next.js ' +
        'with a heavy focus on rendering large time-series cleanly.',
      impact:
        'Turns a race weekend into something you can actually interrogate rather ' +
        'than just watch.',
    },
    metrics: [
      { value: 'lap', label: 'by-lap replay' },
      { value: 'export', label: 'configurable data' },
    ],
    tech: ['Next.js', 'TypeScript', 'TailwindCSS', 'Vitest'],
    links: { live: 'https://boxbox.amiralibg.xyz', github: 'https://github.com/amiralibg/boxbox' },
  },
  {
    slug: 'velocitype',
    cover: '/projects/velocitype.webp',
    name: 'Velocitype',
    tagline: 'Five games, one keyboard — how fast are you really?',
    year: '2026',
    role: 'Creator',
    kind: 'open source',
    story: {
      problem:
        'Typing tests measure one thing one way, so you get very good at that test ' +
        'and learn little about how you actually type.',
      built:
        'A typing arcade with five distinct game modes, each pressuring a different ' +
        'skill. React + Vite with a three.js layer for the motion the arcade framing ' +
        'needs to feel like a game rather than a form.',
      impact: 'A speed benchmark you come back to because it is fun, not diligent.',
    },
    metrics: [
      { value: '5', label: 'game modes' },
      { value: '3D', label: 'arcade visuals' },
    ],
    tech: ['TypeScript', 'React', 'Vite', 'three.js', 'TailwindCSS'],
    links: { live: 'https://velocitype.xyz', github: 'https://github.com/amiralibg/velocitype' },
  },
  {
    slug: 'nightslide',
    cover: '/projects/nightslide.webp',
    name: 'Nightslide',
    tagline: 'Midnight street drift — chain the slide, bank the combo',
    year: '2026',
    role: 'Creator',
    kind: 'open source',
    story: {
      problem:
        'Arcade drift games either simulate so hard that nobody can drive them, or ' +
        'simplify until sliding stops being a skill worth practising.',
      built:
        'A top-down pixel-art drift game on Phaser: a sim-influenced handling model ' +
        'under a Drift Scoring Arena, where chained slides build a combo multiplier. ' +
        'Two deliberately distinct layers — a crisp nearest-neighbour game canvas ' +
        'with tire marks, smoke and screen shake, inside a modern DOM shell for the ' +
        'landing, mode select, HUD and results. Turborepo workspace with a separate ' +
        'leaderboard API.',
      impact:
        'New modes drop in as isolated plug-ins without touching the physics or ' +
        'rendering core — the architecture is the feature.',
    },
    metrics: [
      { value: 'plug-in', label: 'game modes' },
      { value: '2', label: 'render layers' },
    ],
    tech: ['Phaser 4', 'TypeScript', 'Vite', 'GSAP', 'Howler.js', 'Turborepo'],
    links: { live: 'https://nightslide.amiralibg.xyz', github: 'https://github.com/amiralibg/nightslide' },
  },
  {
    slug: 'latent',
    name: 'Latent',
    tagline: 'A square, black-and-white camera with the look chosen before the shutter',
    year: '2026',
    role: 'Creator',
    kind: 'open source',
    story: {
      problem:
        'Phone cameras never deliver a real black-and-white look. Getting one means ' +
        'shooting colour and spending hours in post on filters, curves and grain.',
      built:
        'An Android camera in Kotlin and Jetpack Compose that runs the whole grade ' +
        'live in the viewfinder through OpenGL ES fragment shaders: contrast filters, ' +
        'tone curve, clarity, halation, grain, toning and vignette. Preview and capture ' +
        'share one shader file, enforced by a golden-image test, and every shot keeps ' +
        'its untouched colour original for re-grading.',
      impact:
        'The picture you framed is the picture you get. No account, no analytics, no ' +
        'network — every frame stays on the phone.',
    },
    metrics: [
      { value: '1:1', label: 'always' },
      { value: '1', label: 'shader for preview and capture' },
    ],
    tech: ['Kotlin', 'Jetpack Compose', 'CameraX', 'OpenGL ES', 'Room'],
    links: { github: 'https://github.com/amiralibg/latent' },
  },
  {
    slug: 'ganjino',
    name: 'Ganjino',
    tagline: 'Savings goals priced in gold, not a currency that melts',
    year: '2026',
    role: 'Creator',
    kind: 'open source',
    story: {
      problem:
        'Saving toward a goal in a high-inflation currency is demoralising: the ' +
        'number climbs while what it buys shrinks, so progress is an illusion.',
      built:
        'A full-stack monorepo — an Expo / React Native mobile app, an admin panel ' +
        'and a backend — that denominates every savings goal in gold, so progress is ' +
        'measured against something that holds its value.',
      impact:
        'Progress toward a goal finally means what it appears to mean, whatever the ' +
        'currency is doing that month.',
    },
    metrics: [
      { value: '3', label: 'apps in one monorepo' },
      { value: 'gold', label: 'the unit of account' },
    ],
    tech: ['React Native', 'Expo', 'TypeScript', 'Turborepo', 'Zustand', 'Node.js'],
    links: { github: 'https://github.com/amiralibg/Ganjino' },
  },
]
