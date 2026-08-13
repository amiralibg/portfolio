// ✏️ All resume content lives here — edit this file to update the site.
//
// Employment lives here; personal work lives in projects.ts. Nothing appears in
// both. Each job carries a full case study (story + metrics) so the Experience
// tab can open the same Quick Look panel the Projects tab uses.
import type { CaseStudy } from './caseStudy'

export interface ExperienceItem extends CaseStudy {
  company: string
  period: string
  blurb?: string
  points: string[]
}

export interface SkillGroup {
  group: string
  items: string[]
}

export const resume = {
  name: 'Amirali Beigi',
  title: 'Senior Full-Stack Engineer',
  tagline: 'Next.js • TypeScript • Node.js • AI-integrated Applications',
  email: 'amiralibgi.dev@gmail.com',
  links: {
    github: 'https://github.com/amiralibg',
    linkedin: 'https://linkedin.com/in/amiralibeigi',
    x: 'https://x.com/_amiralibg',
  },
  // Flip `open` to false to switch the whole site (menubar status, header
  // chip, hire-me banner) to a neutral "open to interesting work" state.
  availability: {
    open: true,
    headline: 'Currently available for new projects',
    closedHeadline: 'Open to interesting work',
    note: 'Taking on full-time roles and select freelance projects.',
    timezone: 'GMT+3:30 · Tehran',
    response: 'replies within 24 hours',
  },
  // The "what I can do for you" cards on the hire-me tab.
  services: [
    {
      title: 'End-to-end products',
      blurb:
        'Next.js / React apps taken from idea to production — architecture, UI systems, the API behind them, and the deploy.',
    },
    {
      title: 'AI interfaces',
      blurb:
        'Streaming chat UIs, MCP-powered workflows, and agentic product experiences that feel instant.',
    },
    {
      title: 'Frontend leadership',
      blurb:
        'Mentoring, code-review culture, and scalable component architecture for growing teams.',
    },
  ],
  about:
    'Full-stack engineer with 6+ years delivering end-to-end web and mobile ' +
    'products. My depth is on the frontend — React, Next.js and TypeScript, ' +
    'leading teams and building UI systems that hold up at a million users — and ' +
    'I carry that through the rest of the stack: Node.js APIs, data models, ' +
    'Docker and CI/CD, shipped and maintained in production. Recently focused on ' +
    'AI-integrated applications: streaming interfaces, MCP workflows, agentic ' +
    'systems and real-time UX. I care about clean architecture, code that stays ' +
    'maintainable, and products that are fast without being joyless to use.',
  highlights: [
    '6+ years of experience',
    'End-to-end delivery',
    'Frontend leadership',
    'AI-integrated products',
  ],
  experience: [
    {
      slug: 'landin',
      company: 'Landin',
      name: 'Landin',
      role: 'Senior Frontend Developer',
      period: '2022 — Present',
      year: '2022 — Present',
      kind: 'product',
      tagline: 'No-code landing pages for more than a million users',
      blurb: 'Landing page builder platform used by more than 1 million users worldwide.',
      points: [
        'Led and mentored a frontend team of 3 developers within an agile product environment.',
        'Architected and developed 20+ production features and templates across the builder ecosystem.',
        'Built scalable, responsive UI systems focused on performance and maintainability.',
        'Contributed to platform improvements that increased user engagement by 30%.',
      ],
      story: {
        problem:
          'Non-technical marketers need production-quality landing pages without a ' +
          'developer — on a builder that has to stay fast and stable as it grows.',
        built:
          'Led a frontend team of three across the builder ecosystem: architected 20+ ' +
          'production features and templates, and built the scalable, responsive UI ' +
          'systems the platform runs on.',
        impact:
          'The platform now serves 1M+ users, and builder improvements I shipped ' +
          'contributed to a 30% lift in user engagement.',
      },
      metrics: [
        { value: '1M+', label: 'users' },
        { value: '+30%', label: 'engagement' },
        { value: '20+', label: 'features shipped' },
      ],
      tech: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Redux', 'TanStack Query', 'Framer Motion'],
      links: { live: 'https://landin.ir' },
    },
    {
      slug: 'ply',
      company: 'Ply',
      name: 'Ply',
      role: 'Frontend Engineer',
      period: '2025 — 2026',
      year: '2025 — 2026',
      kind: 'product',
      tagline: 'AI-powered client products for a UAE design studio',
      blurb: 'Design and development studio building modern web products and digital platforms.',
      points: [
        'Delivered and maintained multiple production projects for UAE-based clients.',
        'Built AI-powered chat interfaces with real-time response streaming.',
        'Developed responsive, animation-rich user experiences with modern React ecosystems.',
        'Contributed to the main Ply marketing website and frontend architecture.',
      ],
      story: {
        problem:
          'LLM products live or die on perceived latency — a chat UI that waits for a ' +
          'complete response feels broken, however fast the model actually is.',
        built:
          'Built AI chat interfaces with token-level response streaming, plus several ' +
          'production client products on Next.js 16 / React 19 — and contributed to the ' +
          'studio’s own marketing site and shared frontend architecture.',
        impact:
          'Conversational products that feel instant from the first token, delivered ' +
          'across multiple UAE client engagements.',
      },
      metrics: [
        { value: 'live', label: 'token streaming' },
        { value: 'multi', label: 'client products' },
      ],
      tech: ['Next.js 16', 'React 19', 'TypeScript', 'TailwindCSS', 'shadcn/ui', 'Supabase', 'Zustand', 'AWS Amplify', 'Sentry'],
    },
    {
      slug: 'urplaza',
      company: 'UrPlaza',
      name: 'UrPlaza',
      role: 'Frontend Engineer · Freelance',
      period: '2024',
      year: '2024',
      kind: 'freelance',
      tagline: 'A B2B and B2C marketplace frontend, built solo',
      blurb: 'Freelance engagement — marketplace platform serving both business and consumer users.',
      points: [
        'Designed and built the entire frontend independently as a one-person team.',
        'Architected the Next.js application structure and a shadcn-based component system.',
        'Owned the client-side state layer across both the B2B and B2C surfaces.',
      ],
      story: {
        problem:
          'A marketplace platform serving both business and consumer audiences needed a ' +
          'complete, polished frontend — fast, and with no frontend team to build it.',
        built:
          'Designed and built the whole frontend independently: Next.js app architecture, ' +
          'a shadcn-based component system, and the state layer serving both audiences.',
        impact: 'Shipped a production marketplace frontend as a one-person team.',
      },
      metrics: [
        { value: 'solo', label: 'frontend build' },
        { value: 'B2B+B2C', label: 'two audiences' },
      ],
      tech: ['Next.js', 'TailwindCSS', 'shadcn/ui', 'Zustand'],
    },
    {
      slug: 'namaki',
      company: 'Namaki',
      name: 'Namaki',
      role: 'Co-founder & CTO',
      period: '2022 — 2023',
      year: '2022 — 2023',
      kind: 'startup',
      tagline: 'Green-tech recycling logistics, from zero',
      blurb: 'Green-tech startup focused on recycling and waste collection workflows.',
      points: [
        'Designed the platform architecture and database structure.',
        'Built the MVP application, admin panel, and API infrastructure.',
        'Led technical roadmap planning and feature prioritization.',
      ],
      story: {
        problem:
          'Recycling pickup in Iran ran on phone calls and paper routes — no way for ' +
          'households to book a collection or for operators to plan a round.',
        built:
          'Co-founded the company and owned everything technical: platform architecture, ' +
          'database design, the MVP app, the operator admin panel, and the API behind ' +
          'both — with OpenStreetMap driving collection routing.',
        impact:
          'Took a green-tech idea to a working product, and set the technical roadmap ' +
          'the team built against.',
      },
      metrics: [
        { value: 'CTO', label: 'co-founder' },
        { value: '0→1', label: 'MVP shipped' },
      ],
      tech: ['React Native', 'Next.js', 'Express.js', 'MongoDB', 'OpenStreetMap'],
    },
    {
      slug: 'cinemac',
      company: 'Cinemac (Jcoders)',
      name: 'Cinemac',
      role: 'Frontend Developer',
      period: '2021 — 2022',
      year: '2021 — 2022',
      kind: 'product',
      tagline: 'Video-on-demand for 10,000+ viewers',
      blurb: 'Streaming platform providing video-on-demand services to over 10,000 users.',
      points: [
        'Developed frontend features for the streaming platform and media player experience.',
        'Improved accessibility and engagement through keyboard shortcuts and subtitle systems.',
        'Built compatibility support for older TV platforms through Webpack and Babel optimizations.',
      ],
      story: {
        problem:
          'A streaming service needed a player experience that worked everywhere — ' +
          'including years-old smart TV browsers with no modern JavaScript support.',
        built:
          'Developed the streaming frontend and media player: keyboard shortcuts, ' +
          'subtitle systems, and Webpack/Babel builds targeting legacy TV platforms.',
        impact:
          'Accessible, engaging playback for 10,000+ users across devices old and new.',
      },
      metrics: [
        { value: '10k+', label: 'viewers' },
        { value: 'TV', label: 'legacy support' },
      ],
      tech: ['Nuxt.js', 'Video.js', 'Webpack', 'Babel', 'SCSS'],
    },
    {
      slug: 'doreddy',
      company: 'Doreddy',
      name: 'Doreddy',
      role: 'Senior Frontend Developer',
      period: '2020 — 2021',
      year: '2020 — 2021',
      kind: 'product',
      tagline: 'Live classrooms, built when schools closed',
      blurb: 'Online education platform built during the COVID pandemic with real-time communication.',
      points: [
        'Led development of the majority of the frontend application.',
        'Implemented WebRTC-based real-time video communication.',
        'Designed highly interactive UI experiences for students and teachers.',
      ],
      story: {
        problem:
          'COVID closed classrooms overnight, and teachers needed to run real lessons ' +
          'online — not just a video call, but a room built for teaching.',
        built:
          'Led most of the frontend build and implemented the WebRTC layer for real-time ' +
          'video, alongside the interactive classroom UI for students and teachers.',
        impact:
          'A working remote classroom shipped under pandemic time pressure.',
      },
      metrics: [
        { value: 'WebRTC', label: 'real-time video' },
        { value: 'live', label: 'classrooms' },
      ],
      tech: ['React.js', 'SCSS', 'Material UI', 'Socket.io', 'WebRTC', 'Express.js', 'MongoDB'],
    },
  ] satisfies ExperienceItem[],
  skills: [
    { group: 'Frontend', items: ['React.js', 'Next.js', 'Vue.js', 'Nuxt.js', 'React Native'] },
    { group: 'Languages', items: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Dart'] },
    { group: 'UI & Styling', items: ['TailwindCSS', 'shadcn/ui', 'SCSS', 'Material UI', 'Framer Motion'] },
    { group: 'State & Data', items: ['Zustand', 'Redux', 'TanStack Query'] },
    { group: 'Backend & Infra', items: ['Node.js', 'Express.js', 'MongoDB', 'Supabase', 'Docker', 'CI/CD'] },
    {
      group: 'AI & Modern Tooling',
      items: ['LLM integrations', 'AI streaming interfaces', 'MCP workflows', 'Agentic systems', 'Real-time AI UX'],
    },
    { group: 'Tools', items: ['Git', 'Webpack', 'Storybook', 'Jest', 'AWS Amplify', 'Sentry'] },
  ] satisfies SkillGroup[],
}
