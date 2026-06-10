import { useRef, useState, useEffect } from 'react'
import { resume } from '../data/resume'
import wallpaper from '../assets/background.jpeg'
import resumePdf from '../assets/Amirali Beigi - Resume.pdf'

const PDF_FILENAME = `${resume.name} - Resume.pdf`

const SECTIONS = [
  { id: 'about', label: 'about' },
  { id: 'experience', label: 'experience' },
  { id: 'works', label: 'works' },
  { id: 'oss', label: 'open source' },
  { id: 'skills', label: 'skills' },
  { id: 'contact', label: 'contact' },
] as const
type SectionId = (typeof SECTIONS)[number]['id']

type WinState = 'open' | 'closing' | 'closed' | 'minimizing' | 'minimized' | 'opening'

interface ResumeScreenProps {
  zoomed: boolean
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  variant?: 'screen' | 'overlay'
}

export function ResumeScreen({ zoomed, theme, onToggleTheme, variant = 'screen' }: ResumeScreenProps) {
  const [section, setSection] = useState<SectionId>('about')
  const [time, setTime] = useState(() => formatTime())
  const [winState, setWinState] = useState<WinState>('open')
  const [maximized, setMaximized] = useState(false)
  const winTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const windowVisible = winState !== 'closed' && winState !== 'minimized'

  const transition = (from: WinState, to: WinState, ms: number) => {
    clearTimeout(winTimer.current)
    setWinState(from)
    winTimer.current = setTimeout(() => setWinState(to), ms)
  }

  const closeWindow = () => windowVisible && transition('closing', 'closed', 280)
  const minimizeWindow = () => windowVisible && transition('minimizing', 'minimized', 400)
  const openWindow = () => {
    if (winState === 'open' || winState === 'opening') return
    transition('opening', 'open', 360)
  }

  useEffect(() => () => clearTimeout(winTimer.current), [])

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Arrow keys flip between sections while zoomed in
  useEffect(() => {
    if (!zoomed) return
    const onKey = (e: KeyboardEvent) => {
      const i = SECTIONS.findIndex((s) => s.id === section)
      if (e.key === 'ArrowRight') setSection(SECTIONS[(i + 1) % SECTIONS.length].id)
      if (e.key === 'ArrowLeft') setSection(SECTIONS[(i - 1 + SECTIONS.length) % SECTIONS.length].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed, section])

  return (
    <div className="screen" style={{ backgroundImage: `url(${wallpaper})` }}>
      <div className="menubar">
        <span className="menubar-apple"></span>
        <span className="menubar-app">
          {windowVisible ? `${resume.name} — Resume` : 'Finder'}
        </span>
        <span className="menubar-spacer" />
        <button className="menubar-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <span className="menubar-clock">{time}</span>
      </div>

      <div className="desktop">
        <button className="desktop-icon" onClick={openWindow} title="Open Resume">
          <FolderIcon />
          <span>Resume</span>
        </button>

        <a
          className="desktop-icon pdf"
          href={resumePdf}
          download={PDF_FILENAME}
          title="Download resume as PDF"
        >
          <PdfIcon />
          <span>resume.pdf</span>
        </a>

        {winState !== 'closed' && (
          <div
            className={`window ${winState}${maximized ? ' maximized' : ''}`}
            style={winState === 'minimized' ? { display: 'none' } : undefined}
          >
            <div className="window-titlebar">
              <button className="traffic red" onClick={closeWindow} aria-label="Close window" />
              <button
                className="traffic yellow"
                onClick={minimizeWindow}
                aria-label="Minimize window"
              />
              <button
                className="traffic green"
                onClick={() => setMaximized((m) => !m)}
                aria-label="Maximize window"
              />
              <nav className="tabs">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    className={s.id === section ? 'tab active' : 'tab'}
                    onClick={() => setSection(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="window-body">
              {section === 'about' && <About />}
              {section === 'experience' && <Experience />}
              {section === 'works' && <Works />}
              {section === 'oss' && <OpenSource />}
              {section === 'skills' && <Skills />}
              {section === 'contact' && <Contact />}
            </div>

            <div className="window-footer">
              {variant === 'overlay'
                ? 'double-tap empty space or ✕ to close'
                : zoomed
                  ? 'use ← → arrow keys to browse · esc or double-click outside to zoom out'
                  : 'click the screen to zoom in'}
            </div>
          </div>
        )}

        <div className="dock">
          <button
            className="dock-item"
            onClick={openWindow}
            title="Resume"
            aria-label="Open Resume"
          >
            <FolderIcon />
            {winState !== 'closed' && <i className="dock-dot" />}
          </button>
          <span className="dock-sep" />
          <a
            className="dock-item"
            href={resume.links.github}
            target="_blank"
            rel="noreferrer"
            title="GitHub"
          >
            <GitHubIcon />
          </a>
          <a
            className="dock-item"
            href={resume.links.linkedin}
            target="_blank"
            rel="noreferrer"
            title="LinkedIn"
          >
            <LinkedInIcon />
          </a>
          <a className="dock-item" href={`mailto:${resume.email}`} title="Email">
            <MailIcon />
          </a>
        </div>
      </div>
    </div>
  )
}

function About() {
  return (
    <div className="section hero">
      <div className="avatar">{resume.name.charAt(0)}</div>
      <h1>{resume.name}</h1>
      <h2>{resume.title}</h2>
      <p className="tagline">{resume.tagline}</p>
      <p className="lede">{resume.about}</p>
      <div className="chips highlights">
        {resume.highlights.map((h) => (
          <span className="chip" key={h}>
            {h}
          </span>
        ))}
      </div>
    </div>
  )
}

function Experience() {
  return (
    <div className="section">
      <h3 className="section-title">Experience</h3>
      {resume.experience.map((job) => (
        <div className="entry" key={job.company + job.period}>
          <div className="entry-head">
            <strong>
              {job.role} · {job.company}
            </strong>
            <span className="entry-period">{job.period}</span>
          </div>
          {job.blurb && <div className="entry-sub">{job.blurb}</div>}
          <ul>
            {job.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="chips entry-tech">
            {job.tech.map((t) => (
              <span className="chip" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Works() {
  return (
    <div className="section">
      <h3 className="section-title">Selected Works</h3>
      <div className="cards">
        {resume.works.map((w) => {
          const Tag = w.link ? 'a' : 'div'
          return (
            <Tag
              className="card"
              key={w.name}
              {...(w.link ? { href: w.link, target: '_blank', rel: 'noreferrer' } : {})}
            >
              <div className="card-head">
                <strong>{w.name}</strong>
                <span className="card-year">{w.year}</span>
              </div>
              <span className="card-role">{w.role}</span>
              <p>{w.description}</p>
              <div className="chips">
                {w.tech.map((t) => (
                  <span className="chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </Tag>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- live GitHub repos ---------- */

interface Repo {
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  fork: boolean
  archived: boolean
  updated_at: string
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Kotlin: '#a97bff',
  Dart: '#00b4ab',
  Lua: '#000080',
  Rust: '#dea584',
  CSS: '#663399',
  HTML: '#e34c26',
  Vue: '#41b883',
}

// Module-level cache so the 3D screen and the mobile overlay share one fetch
let repoCache: Repo[] | null = null
let repoPromise: Promise<Repo[]> | null = null

function fetchRepos(): Promise<Repo[]> {
  if (repoCache) return Promise.resolve(repoCache)
  repoPromise ??= fetch(
    `https://api.github.com/users/${resume.githubUser}/repos?sort=updated&per_page=100`,
  )
    .then((r) => {
      if (!r.ok) throw new Error(`GitHub API ${r.status}`)
      return r.json() as Promise<Repo[]>
    })
    .then((all) => {
      repoCache = all
        .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== resume.githubUser)
        .sort(
          (a, b) =>
            b.stargazers_count - a.stargazers_count ||
            +new Date(b.updated_at) - +new Date(a.updated_at),
        )
        .slice(0, 12)
      return repoCache
    })
    .catch((err) => {
      repoPromise = null
      throw err
    })
  return repoPromise
}

function OpenSource() {
  const [repos, setRepos] = useState<Repo[] | null>(repoCache)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    fetchRepos()
      .then((r) => alive && setRepos(r))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="section">
      <h3 className="section-title">
        Open Source
        <a className="section-link" href={resume.links.github} target="_blank" rel="noreferrer">
          @{resume.githubUser} ↗
        </a>
      </h3>
      {failed && (
        <p className="oss-note">
          Couldn’t reach GitHub right now —{' '}
          <a href={resume.links.github} target="_blank" rel="noreferrer">
            browse my repos directly ↗
          </a>
        </p>
      )}
      {!failed && !repos && <p className="oss-note">fetching repositories from GitHub…</p>}
      {repos && (
        <div className="cards">
          {repos.map((r) => (
            <a className="card" key={r.name} href={r.html_url} target="_blank" rel="noreferrer">
              <div className="card-head">
                <strong>{r.name}</strong>
                {r.stargazers_count > 0 && <span className="card-year">★ {r.stargazers_count}</span>}
              </div>
              <p>{r.description ?? 'No description yet.'}</p>
              {r.language && (
                <span className="repo-lang">
                  <i style={{ background: LANGUAGE_COLORS[r.language] ?? 'var(--accent)' }} />
                  {r.language}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function Skills() {
  return (
    <div className="section">
      <h3 className="section-title">Skills</h3>
      {resume.skills.map((g) => (
        <div className="skill-row" key={g.group}>
          <span className="skill-group">{g.group}</span>
          <div className="chips">
            {g.items.map((s) => (
              <span className="chip" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Contact() {
  return (
    <div className="section hero">
      <h3 className="section-title">Get in touch</h3>
      <p className="lede">
        I’m always happy to talk about frontend systems, AI-integrated products, and interesting
        work.
      </p>
      <div className="contact-links">
        <a href={`mailto:${resume.email}`}>{resume.email}</a>
        <a href={resume.links.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={resume.links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className="download-cta" href={resumePdf} download={PDF_FILENAME}>
          ↓ Download PDF
        </a>
      </div>
    </div>
  )
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* ---------- icons ---------- */

export function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

export function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 64 52" aria-hidden>
      <defs>
        <linearGradient id="folder-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fb6f9" />
          <stop offset="1" stopColor="#2f7de1" />
        </linearGradient>
      </defs>
      <path
        d="M4 8c0-2.2 1.8-4 4-4h16l6 6h26c2.2 0 4 1.8 4 4v30c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4V8z"
        fill="#2a6cc8"
      />
      <path
        d="M4 16c0-2.2 1.8-4 4-4h52c2.2 0 4 1.8 4 4v28c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4V16z"
        fill="url(#folder-g)"
        transform="translate(-2 0)"
      />
    </svg>
  )
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 48 56" aria-hidden>
      <path
        d="M6 6c0-2.2 1.8-4 4-4h20l12 12v36c0 2.2-1.8 4-4 4H10c-2.2 0-4-1.8-4-4V6z"
        fill="#f4f5f7"
      />
      <path d="M30 2l12 12H32c-1.1 0-2-.9-2-2V2z" fill="#c9cdd6" />
      <rect x="2" y="30" width="36" height="16" rx="3" fill="#e2453a" />
      <text
        x="20"
        y="42"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="11"
        fontWeight="700"
        fill="#fff"
      >
        PDF
      </text>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6L22 7" />
    </svg>
  )
}
