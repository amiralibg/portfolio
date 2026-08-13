// ✏️ Personal work only — things Amirali built and owns. Employment lives in
// resume.ts and never appears here; a job is not a portfolio piece.
//
// Screenshots: drop a png/webp into src/assets/projects/, import it, and set
// `cover` (extra shots go in `gallery` and Quick Look becomes a slideshow).
// Without a cover the card renders a typographic placeholder — deliberate, not
// broken — so the grid stays presentable while shots are still being made.
//
// Star counts are snapshots, not live API reads: this site is a static build and
// nobody's laptop should wait on api.github.com to render a card. Refresh them
// when they move meaningfully.
import type { CaseStudy } from './caseStudy'

export interface Project extends CaseStudy {
  /** Featured projects render as full case-study rows above the grid. */
  featured?: boolean
  /** GitHub stars at the date below — displayed as a static badge. */
  stars?: number
}

/** When the star counts above were last checked. */
export const STARS_UPDATED = '2026-08-13'

export const projects: Project[] = [
  {
    slug: 'unstream',
    name: 'Unstream',
    tagline: 'Your music library, as files you actually own',
    year: '2026',
    role: 'Creator & maintainer',
    kind: 'open source',
    stars: 198,
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
        'Nearly 200 stars and a steady stream of self-hosters. Files land in a real ' +
        'folder on your own disk: nothing expires, and nobody stands in between.',
    },
    metrics: [
      { value: '198', label: 'github stars' },
      { value: '5', label: 'catalogues' },
      { value: 'FA/EN', label: 'bilingual UI' },
    ],
    tech: ['TypeScript', 'React', 'Python', 'FastAPI', 'Docker', 'ffmpeg'],
    links: { live: 'https://unstream.amiralibg.xyz', github: 'https://github.com/amiralibg/unstream' },
  },
  {
    slug: 'doran',
    name: 'Doran',
    tagline: 'The missing Persian calendar toolkit for the web',
    year: '2026',
    role: 'Creator & maintainer',
    kind: 'open source',
    stars: 15,
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
    slug: 'redistal',
    name: 'Redistal',
    tagline: 'A Redis GUI that feels like a Mac app, because it is one',
    year: '2026',
    role: 'Creator',
    kind: 'open source',
    featured: true,
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
    slug: 'marky',
    name: 'Marky',
    tagline: 'A markdown editor that grows with you',
    year: '2026',
    role: 'Creator',
    kind: 'open source',
    stars: 1,
    story: {
      problem:
        'Markdown editors are either toys for beginners or cockpits for power ' +
        'users — nothing carries someone from their first heading to advanced ' +
        'workflows without a migration.',
      built:
        'An offline-first desktop editor on Tauri + React whose advanced options ' +
        'reveal themselves progressively as you level up, with the roadmap designed ' +
        'around that arc rather than bolted on afterwards.',
      impact:
        'Beginners get a friendly editor on day one — and never have to leave it ' +
        'as their needs grow.',
    },
    metrics: [
      { value: '100%', label: 'offline' },
      { value: 'local', label: 'files, not a cloud' },
    ],
    tech: ['Tauri', 'React', 'Rust', 'Zustand', 'TailwindCSS'],
    links: { github: 'https://github.com/amiralibg/marky' },
  },
  {
    slug: 'pass',
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
    links: { github: 'https://github.com/amiralibg/boxbox' },
  },
  {
    slug: 'velocitype',
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
    links: { github: 'https://github.com/amiralibg/velocitype' },
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
