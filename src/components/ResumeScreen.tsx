import { useCallback, useRef, useState, useEffect } from 'react'
import type { RefObject } from 'react'
import { resume } from '../data/resume'
import type { ExperienceItem } from '../data/resume'
import { useDraggable } from '../hooks/useDraggable'
import { Projects } from './Projects'
import { QuickLook } from './QuickLook'
import { ContactForm } from './ContactForm'
import { Terminal } from './Terminal'
import { SECTIONS } from './sections'
import type { SectionId } from './sections'
import {
  AppleIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  FolderIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  MoonIcon,
  PdfIcon,
  SearchIcon,
  SunIcon,
  TerminalIcon,
  XIcon,
} from './icons'
import wallpaper from '../assets/background.webp'
import resumePdf from '../assets/Amirali Beigi - Resume.pdf'
import avatar from '../assets/amirali.jpg'

const PDF_FILENAME = `${resume.name} - Resume.pdf`

type WinState = 'open' | 'closing' | 'closed' | 'minimizing' | 'minimized' | 'opening'

interface ResumeScreenProps {
  zoomed: boolean
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  variant?: 'screen' | 'overlay'
  /** Tailors the footer hint to the guided-scroll interaction. */
  scrollMode?: boolean
  /** Controlled active tab. Falls back to internal state when omitted. */
  section?: SectionId
  onSectionChange?: (id: SectionId) => void
  /** Slug of the open Quick Look, scoped to the active tab (a project on
   *  `projects`, a job on `experience`). Fed by deep links / Spotlight / terminal. */
  detailSlug?: string | null
  onDetailSlugChange?: (slug: string | null) => void
  /** Opens the page-level Spotlight palette (menubar search icon). */
  onOpenSpotlight?: () => void
  /** macOS-style availability notification, shown on the desktop. */
  notifState?: 'hidden' | 'in' | 'out'
  onNotifClick?: () => void
  onNotifDismiss?: () => void
  /** Forwarded to the scrollable body so scroll mode can drive it. */
  bodyRef?: RefObject<HTMLDivElement | null>
}

export function ResumeScreen({
  zoomed,
  theme,
  onToggleTheme,
  variant = 'screen',
  scrollMode = false,
  section: controlledSection,
  onSectionChange,
  detailSlug,
  onDetailSlugChange,
  onOpenSpotlight,
  notifState,
  onNotifClick,
  onNotifDismiss,
  bodyRef,
}: ResumeScreenProps) {
  const [internalSection, setInternalSection] = useState<SectionId>('about')
  const section = controlledSection ?? internalSection
  const setSection = useCallback(
    (id: SectionId) => (onSectionChange ?? setInternalSection)(id),
    [onSectionChange],
  )
  const [time, setTime] = useState(() => formatTime())
  const [winState, setWinState] = useState<WinState>('open')
  const [maximized, setMaximized] = useState(false)
  const [termOpen, setTermOpen] = useState(false)
  const { targetRef: winDragRef, onTitlePointerDown } = useDraggable()
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

  // Keep the active tab visible when the tab bar overflows (narrow screens):
  // whenever the section changes, glide the tab strip so the tab sits centered.
  const tabsRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const nav = tabsRef.current
    if (!nav || nav.scrollWidth <= nav.clientWidth) return
    const tab = nav.querySelector<HTMLElement>('.tab.active')
    if (!tab) return
    const navRect = nav.getBoundingClientRect()
    const tabRect = tab.getBoundingClientRect()
    const left = tabRect.left - navRect.left + nav.scrollLeft - (nav.clientWidth - tabRect.width) / 2
    nav.scrollTo({ left, behavior: 'smooth' })
  }, [section, windowVisible])

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Arrow keys flip between sections while zoomed in
  useEffect(() => {
    if (!zoomed) return
    const onKey = (e: KeyboardEvent) => {
      // Leave typing contexts (terminal, Spotlight, contact form) alone.
      const el = document.activeElement
      if (
        el instanceof HTMLElement &&
        (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      ) {
        return
      }
      const i = SECTIONS.findIndex((s) => s.id === section)
      if (e.key === 'ArrowRight') setSection(SECTIONS[(i + 1) % SECTIONS.length].id)
      if (e.key === 'ArrowLeft') setSection(SECTIONS[(i - 1 + SECTIONS.length) % SECTIONS.length].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed, section, setSection])

  return (
    <div className="screen" style={{ backgroundImage: `url(${wallpaper})` }}>
      <div className="menubar">
        {/* Where macOS puts the Apple logo — drawn as SVG, not the ""
            character, which is a private-use glyph that only resolves in Apple
            system fonts and shows as tofu everywhere else. */}
        <span className="menubar-mark" aria-hidden>
          <AppleIcon size={14} />
        </span>
        <span className="menubar-app">{windowVisible ? `${resume.name} — Resume` : 'Finder'}</span>
        <span className="menubar-spacer" />
        {onOpenSpotlight && (
          <button
            className="menubar-toggle"
            onClick={onOpenSpotlight}
            aria-label="Search (⌘K)"
            title="Search (⌘K)"
          >
            <SearchIcon size={15} />
          </button>
        )}
        {resume.availability.open && (
          <button
            className="menubar-status"
            onClick={() => {
              openWindow()
              setSection('hire')
            }}
            title="Available for projects — get in touch"
          >
            <i className="avail-dot" aria-hidden />
            available
          </button>
        )}
        <button className="menubar-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <SunIcon size={15} /> : <MoonIcon size={15} />}
        </button>
        <span className="menubar-clock">{time}</span>
      </div>

      <div className="desktop">
        {notifState && notifState !== 'hidden' && (
          <div
            className={`macnotif${notifState === 'out' ? ' closing' : ''}`}
            role="status"
            onClick={() => {
              openWindow()
              onNotifClick?.()
            }}
          >
            <img className="macnotif-icon" src={avatar} alt="" />
            <span className="macnotif-text">
              <strong>{resume.name}</strong>
              <span>Available for new projects — hiring frontend? Let’s talk.</span>
            </span>
            <span className="macnotif-time">now</span>
            <button
              className="macnotif-close"
              aria-label="Dismiss notification"
              onClick={(e) => {
                e.stopPropagation()
                onNotifDismiss?.()
              }}
            >
              <CloseIcon size={12} />
            </button>
          </div>
        )}

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
          <span>download resume.pdf</span>
        </a>

        {winState !== 'closed' && (
          <div
            ref={winDragRef}
            className={`window ${winState}${maximized ? ' maximized' : ''}`}
            style={winState === 'minimized' ? { display: 'none' } : undefined}
          >
            <div className="window-titlebar" onPointerDown={onTitlePointerDown}>
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
              <nav className="tabs" ref={tabsRef}>
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

            <div className="window-body" ref={bodyRef}>
              {section === 'about' && <About />}
              {section === 'experience' && (
                <Experience openSlug={detailSlug} onOpenChange={onDetailSlugChange} />
              )}
              {section === 'projects' && (
                <Projects openSlug={detailSlug} onOpenChange={onDetailSlugChange} />
              )}
              {section === 'skills' && <Skills />}
              {section === 'hire' && <HireMe />}
            </div>

            <div className="window-footer">
              {variant === 'overlay'
                ? 'double-tap empty space to close'
                : scrollMode
                  ? zoomed
                    ? 'scroll to browse · scroll up or esc to zoom out'
                    : 'scroll to zoom in'
                  : zoomed
                    ? 'use ← → arrow keys to browse · esc or double-click outside to zoom out'
                    : 'click the screen to zoom in'}
            </div>
          </div>
        )}

        {termOpen && (
          <Terminal
            onClose={() => setTermOpen(false)}
            onOpenTab={setSection}
            onOpenProject={(slug) => {
              setSection('projects')
              onDetailSlugChange?.(slug)
            }}
            onOpenJob={(slug) => {
              setSection('experience')
              onDetailSlugChange?.(slug)
            }}
          />
        )}

        <div className="dock">
          <button className="dock-item" onClick={openWindow} title="Resume" aria-label="Open Resume">
            <FolderIcon />
            {winState !== 'closed' && <i className="dock-dot" />}
          </button>
          <button
            className="dock-item"
            onClick={() => setTermOpen((v) => !v)}
            title="Terminal"
            aria-label="Toggle Terminal"
          >
            <TerminalIcon />
            {termOpen && <i className="dock-dot" />}
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
          <a
            className="dock-item"
            href={resume.links.x}
            target="_blank"
            rel="noreferrer"
            title="X"
          >
            <XIcon />
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
      <img className="avatar" src={avatar} alt={resume.name} width={96} height={96} />
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

interface ExperienceProps {
  openSlug?: string | null
  onOpenChange?: (slug: string | null) => void
}

/** Employment history. Each role is a button that opens the same Quick Look
 *  panel the Projects tab uses — the bullets stay skimmable, the full story is
 *  one click away. */
function Experience({ openSlug, onOpenChange }: ExperienceProps) {
  const [internalSlug, setInternalSlug] = useState<string | null>(null)
  const slug = openSlug !== undefined ? openSlug : internalSlug
  const setSlug = onOpenChange ?? setInternalSlug
  const active: ExperienceItem | null = slug
    ? (resume.experience.find((j) => j.slug === slug) ?? null)
    : null

  return (
    <>
      <div className="section">
        <h3 className="section-title">Experience</h3>
        <p className="section-lede">Six years of shipping — click any role for the full story.</p>
        {/* A card of real content (headings, a list) can't live inside a
            <button> — so the button sits at the end and its ::after is
            stretched over the whole card. Valid markup, one clear control, and
            the entire entry stays clickable. */}
        {resume.experience.map((job) => (
          <div className="entry" key={job.slug}>
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
            <button className="entry-cta" onClick={() => setSlug(job.slug)}>
              read the {job.company} case study
            </button>
          </div>
        ))}
      </div>

      {active && <QuickLook item={active} onClose={() => setSlug(null)} />}
    </>
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

function HireMe() {
  const a = resume.availability
  return (
    <div className="section hire">
      <div className="avail-banner">
        <span className="avail-headline">
          <i className="avail-dot" aria-hidden />
          {a.open ? a.headline : a.closedHeadline}
        </span>
        <p className="avail-note">{a.note}</p>
        <span className="avail-meta">
          <span>{a.timezone}</span>
          <span>·</span>
          <span>{a.response}</span>
          <span>·</span>
          <span>remote-friendly</span>
        </span>
      </div>

      <h4 className="sub-title">what I can do for you</h4>
      <div className="offer-grid">
        {resume.services.map((s) => (
          <div className="offer" key={s.title}>
            <strong>{s.title}</strong>
            <p>{s.blurb}</p>
          </div>
        ))}
      </div>

      <h4 className="sub-title">get in touch</h4>
      <ContactForm />

      <div className="contact-links">
        <CopyEmail />
        <a href={resumePdf} download={PDF_FILENAME}>
          <DownloadIcon size={14} /> resume.pdf
        </a>
        <a href={resume.links.github} target="_blank" rel="noreferrer">
          <GitHubIcon size={14} /> GitHub
        </a>
        <a href={resume.links.linkedin} target="_blank" rel="noreferrer">
          <LinkedInIcon size={14} /> LinkedIn
        </a>
        <a href={resume.links.x} target="_blank" rel="noreferrer">
          {/* The handle, not "X" — the icon already says which platform. */}
          <XIcon size={14} /> @{resume.links.x.split('/').pop()}
        </a>
      </div>
    </div>
  )
}

/** Copy beats mailto: most visitors are not signed into a desktop mail client,
 *  so a mailto link is a dead end for them. Falls back to a mailto if the
 *  clipboard API is unavailable or blocked. */
function CopyEmail() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resume.email)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${resume.email}`
    }
  }

  return (
    <button type="button" className="copy-email" onClick={copy} aria-live="polite">
      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      {copied ? 'copied to clipboard' : resume.email}
    </button>
  )
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/* Re-exported so App.tsx keeps importing its theme icons from one place. */
export { SunIcon, MoonIcon, ArrowUpRightIcon }
