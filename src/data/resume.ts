// ✏️ All resume content lives here — edit this file to update the site.
export interface ExperienceItem {
  company: string
  role: string
  period: string
  blurb?: string
  points: string[]
  tech: string[]
}

export interface WorkItem {
  name: string
  role: string
  year: string
  description: string
  tech: string[]
  link?: string
}

export interface SkillGroup {
  group: string
  items: string[]
}

export const resume = {
  name: 'Amirali Beigi',
  title: 'Senior Frontend Engineer',
  tagline: 'Next.js • TypeScript • AI-integrated Applications',
  email: 'amiralibgi.dev@gmail.com',
  githubUser: 'amiralibg',
  links: {
    github: 'https://github.com/amiralibg',
    linkedin: 'https://linkedin.com/in/amiralibeigi',
  },
  about:
    'Senior Frontend Engineer with 6+ years of experience building scalable web ' +
    'and mobile applications with React, Next.js, TypeScript, and modern frontend ' +
    'architectures. I lead frontend development, ship production-ready products, ' +
    'and work closely with design, backend, and product teams — with a strong focus ' +
    'on performance, developer experience, and scalable UI systems. Recently focused ' +
    'on AI-integrated applications: streaming AI interfaces, MCP workflows, agentic ' +
    'systems, and real-time user experiences.',
  highlights: [
    '6+ years of experience',
    'Startup & fast-paced environments',
    'Frontend leadership',
    'AI-assisted products',
  ],
  experience: [
    {
      company: 'Landin',
      role: 'Senior Frontend Developer',
      period: '2022 — Present',
      blurb: 'Landing page builder platform used by more than 1 million users worldwide.',
      points: [
        'Led and mentored a frontend team of 3 developers within an agile product environment.',
        'Architected and developed 20+ production features and templates across the builder ecosystem.',
        'Built scalable, responsive UI systems focused on performance and maintainability.',
        'Contributed to platform improvements that increased user engagement by 30%.',
      ],
      tech: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Redux', 'TanStack Query', 'Framer Motion'],
    },
    {
      company: 'Ply',
      role: 'Frontend Engineer',
      period: '2025 — 2026',
      blurb: 'Design and development studio building modern web products and digital platforms.',
      points: [
        'Delivered and maintained multiple production projects for UAE-based clients.',
        'Built AI-powered chat interfaces with real-time response streaming.',
        'Developed responsive, animation-rich user experiences with modern React ecosystems.',
        'Contributed to the main Ply marketing website and frontend architecture.',
      ],
      tech: ['Next.js 16', 'React 19', 'TypeScript', 'TailwindCSS', 'shadcn/ui', 'Supabase', 'Zustand', 'AWS Amplify', 'Sentry'],
    },
    {
      company: 'Namaki',
      role: 'Co-founder & CTO',
      period: '2022 — 2023',
      blurb: 'Green-tech startup focused on recycling and waste collection workflows.',
      points: [
        'Designed the platform architecture and database structure.',
        'Built the MVP application, admin panel, and API infrastructure.',
        'Led technical roadmap planning and feature prioritization.',
      ],
      tech: ['React Native', 'Next.js', 'Express.js', 'MongoDB', 'OpenStreetMap'],
    },
    {
      company: 'Cinemac (Jcoders)',
      role: 'Frontend Developer',
      period: '2021 — 2022',
      blurb: 'Streaming platform providing video-on-demand services to over 10,000 users.',
      points: [
        'Developed frontend features for the streaming platform and media player experience.',
        'Improved accessibility and engagement through keyboard shortcuts and subtitle systems.',
        'Built compatibility support for older TV platforms through Webpack and Babel optimizations.',
      ],
      tech: ['Nuxt.js', 'Video.js', 'Webpack', 'Babel', 'SCSS'],
    },
    {
      company: 'Doreddy',
      role: 'Senior Frontend Developer',
      period: '2020 — 2021',
      blurb: 'Online education platform built during the COVID pandemic with real-time communication.',
      points: [
        'Led development of the majority of the frontend application.',
        'Implemented WebRTC-based real-time video communication.',
        'Designed highly interactive UI experiences for students and teachers.',
      ],
      tech: ['React.js', 'SCSS', 'Material UI', 'Socket.io', 'WebRTC', 'Express.js', 'MongoDB'],
    },
  ] satisfies ExperienceItem[],
  works: [
    {
      name: 'Marky',
      role: 'Developer',
      year: '2026',
      description:
        'Open-source offline markdown editor for people new to markdown, packed with ' +
        'advanced options that grow with them as they get better. Built the full app ' +
        'and designed its roadmap.',
      tech: ['Tauri', 'React', 'Zustand'],
      link: 'https://github.com/amiralibg/marky',
    },
    {
      name: 'Doran',
      role: 'Developer',
      year: '2026',
      description:
        'Open-source Persian (Solar Hijri / Jalali) calendar ecosystem — a complete, ' +
        'developer-friendly toolkit covering date math, natural-language parsing, ' +
        'holidays, and RTL-first UI. Architected the entire monorepo: a zero-dependency ' +
        'date engine, Persian NL date parser, holidays dataset, and accessible React + ' +
        'Web Components.',
      tech: ['TypeScript', 'React', 'Web Components', 'Turborepo', 'Vitest', 'VitePress'],
      link: 'https://github.com/amiralibg/Doran',
    },
    {
      name: 'UrPlaza',
      role: 'Frontend Engineer',
      year: '2024',
      description:
        'B2B/B2C business platform focused on marketplace infrastructure and growth ' +
        'tools. Built the full frontend architecture and UI system independently.',
      tech: ['Next.js', 'TailwindCSS', 'shadcn/ui', 'Zustand'],
    },
    {
      name: 'AI & Agentic Systems',
      role: 'Engineer',
      year: '2024 — Present',
      description:
        'AI-integrated chat interfaces with streaming responses and real-time UX ' +
        'patterns, MCP-based workflows, and conversational UI systems optimized for ' +
        'responsiveness and usability.',
      tech: ['LLM integrations', 'MCP', 'Streaming UX'],
    },
  ] satisfies WorkItem[],
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
