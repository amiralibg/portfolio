import { useCallback, useRef, useState, useEffect } from 'react'
import type { RefObject } from 'react'
import { resume } from '../data/resume'
import type { ExperienceItem } from '../data/resume'
import { useDraggable } from '../hooks/useDraggable'
import { Projects } from './Projects'
import { QuickLook } from './QuickLook'
import { ContactForm } from './ContactForm'
import { Terminal } from './Terminal'
import { AboutThisMac } from './AboutThisMac'
import { MacMenus } from './MacMenus'
import type { Menu } from './MacMenus'
import { ResizeHandles, TrafficLights } from './WindowChrome'
import { Dock, DockItem, DockSeparator } from './Dock'
import {
  GitHubAppIcon,
  LinkedInAppIcon,
  MailAppIcon,
  ResumeAppIcon,
  TerminalAppIcon,
  XAppIcon,
} from './AppIcons'
import { SECTIONS } from './sections'
import type { SectionId } from './sections'
import {
  AppleIcon,
  ArrowUpRightIcon,
  BatteryIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  FolderIcon,
  GitHubIcon,
  LinkedInIcon,
  MoonIcon,
  PdfIcon,
  SearchIcon,
  SunIcon,
  WifiIcon,
  XIcon,
} from './icons'
import wallpaper from '../assets/background.webp'
import resumePdf from '../assets/Amirali Beigi - Resume.pdf'
import avatar from '../assets/amirali.jpg'

const PDF_FILENAME = `${resume.name} - Resume.pdf`
/** This site's own repo, for Help → View Source. */
const SOURCE_URL = 'https://github.com/amiralibg/portfolio'

type WinState = 'open' | 'closing' | 'closed' | 'minimizing' | 'minimized' | 'opening'
type TermState = 'closed' | 'open' | 'minimized'
/** Which window is frontmost — the others grey their traffic lights. */
type WinId = 'resume' | 'terminal' | 'about'

const handleOf = (url: string) => url.split('/').filter(Boolean).pop() ?? ''

/** The social profiles: app tiles in the dock, "me on <platform>" cards
 *  (avatar plus a brand badge) on the hire-me tab. */
const PROFILES = [
  { platform: 'GitHub', url: resume.links.github, Icon: GitHubIcon, AppIcon: GitHubAppIcon },
  { platform: 'LinkedIn', url: resume.links.linkedin, Icon: LinkedInIcon, AppIcon: LinkedInAppIcon },
  { platform: 'X', url: resume.links.x, Icon: XIcon, AppIcon: XAppIcon },
]

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
  const isScreen = variant === 'screen'
  const [time, setTime] = useState(() => formatClock(isScreen))
  const [winState, setWinState] = useState<WinState>('open')
  const [maximized, setMaximized] = useState(false)
  const [termState, setTermState] = useState<TermState>('closed')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [front, setFront] = useState<WinId>('resume')
  const [bounce, setBounce] = useState<'resume' | 'terminal' | null>(null)
  const { targetRef: winDragRef, onTitlePointerDown, onResizePointerDown } = useDraggable()
  const winTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const bounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const windowVisible = winState !== 'closed' && winState !== 'minimized'

  const transition = (from: WinState, to: WinState, ms: number) => {
    clearTimeout(winTimer.current)
    setWinState(from)
    winTimer.current = setTimeout(() => setWinState(to), ms)
  }

  const closeWindow = () => windowVisible && transition('closing', 'closed', 280)
  const minimizeWindow = () => windowVisible && transition('minimizing', 'minimized', 400)
  // The dock icon hops while an app launches from closed — not when a
  // minimized window is merely restored, same as macOS.
  const launch = (app: 'resume' | 'terminal') => {
    clearTimeout(bounceTimer.current)
    setBounce(app)
    bounceTimer.current = setTimeout(() => setBounce(null), 900)
  }
  const openWindow = () => {
    setFront('resume')
    if (winState === 'open' || winState === 'opening') return
    if (winState === 'closed') launch('resume')
    transition('opening', 'open', 360)
  }
  // Clicking a running app's dock icon brings it forward; it never quits it.
  const openTerminal = () => {
    setFront('terminal')
    if (termState === 'closed') launch('terminal')
    setTermState('open')
  }
  const closeTerminal = () => {
    setTermState('closed')
    setFront('resume')
  }
  const closeAbout = () => {
    setAboutOpen(false)
    setFront('resume')
  }
  const goTo = (id: SectionId) => {
    openWindow()
    setSection(id)
  }

  // A stale `front` (its window since closed) must not leave every window
  // looking inactive, so each one checks the others are actually up.
  const termActive = front === 'terminal' && termState === 'open'
  const aboutActive = front === 'about' && aboutOpen
  const resumeActive = !termActive && !aboutActive

  const closeFront = () => {
    if (aboutActive) closeAbout()
    else if (termActive) closeTerminal()
    else closeWindow()
  }
  const minimizeFront = () => {
    if (termActive) {
      setTermState('minimized')
      setFront('resume')
    } else minimizeWindow()
  }

  const downloadResume = () => {
    const a = document.createElement('a')
    a.href = resumePdf
    a.download = PDF_FILENAME
    a.click()
  }

  const appleMenu: Menu = {
    id: 'apple',
    title: <AppleIcon size={14} />,
    ariaLabel: 'Apple menu',
    items: [
      {
        label: 'About This Mac',
        onSelect: () => {
          setAboutOpen(true)
          setFront('about')
        },
      },
      'sep',
      { label: 'Download Résumé…', onSelect: downloadResume },
      {
        label: theme === 'dark' ? 'Switch to Light Appearance' : 'Switch to Dark Appearance',
        onSelect: onToggleTheme,
      },
      'sep',
      { label: 'Contact Amirali…', onSelect: () => goTo('hire') },
    ],
  }
  const appMenu: Menu = {
    id: 'app',
    // The phone overlay has no room for the long title; it only ever
    // truncated to "Amirali Bei…".
    title: !windowVisible ? 'Finder' : isScreen ? `${resume.name} — Resume` : 'Resume',
    bold: true,
    items: [
      ...(windowVisible ? [] : [{ label: 'Open Resume', onSelect: openWindow }, 'sep' as const]),
      { label: `About ${resume.name.split(' ')[0]}`, onSelect: () => goTo('about') },
      { label: 'Hire Me…', onSelect: () => goTo('hire') },
      'sep',
      { label: 'Hide Resume', onSelect: minimizeWindow, disabled: !windowVisible },
      { label: 'Quit Resume', onSelect: closeWindow, disabled: !windowVisible },
    ],
  }
  // File / View / Window / Help only where there's a menubar wide enough for
  // them — the phone overlay keeps the Apple and app menus.
  const fullMenus: Menu[] = [
    {
      id: 'file',
      title: 'File',
      items: [
        { label: 'New Terminal Window', onSelect: openTerminal },
        { label: 'Download resume.pdf', onSelect: downloadResume },
        'sep',
        {
          label: 'Close Window',
          onSelect: closeFront,
          disabled: !windowVisible && !termActive && !aboutActive,
        },
      ],
    },
    {
      id: 'view',
      title: 'View',
      items: [
        ...SECTIONS.map((sec) => ({
          // Menus are Title Case; the tab labels are lowercase + CSS-capitalized.
          label: sec.label.replace(/\b\w/g, (c) => c.toUpperCase()),
          checked: windowVisible && sec.id === section,
          onSelect: () => goTo(sec.id),
        })),
        'sep',
        ...(onOpenSpotlight ? [{ label: 'Search…', shortcut: '⌘K', onSelect: onOpenSpotlight }] : []),
        {
          label: maximized ? 'Exit Full Screen' : 'Enter Full Screen',
          onSelect: () => setMaximized((m) => !m),
          disabled: !windowVisible,
        },
      ],
    },
    {
      id: 'window',
      title: 'Window',
      items: [
        { label: 'Minimize', onSelect: minimizeFront, disabled: !windowVisible && !termActive },
        { label: 'Zoom', onSelect: () => setMaximized((m) => !m), disabled: !windowVisible },
        'sep',
        { label: 'Resume', checked: resumeActive && windowVisible, onSelect: openWindow },
        ...(termState !== 'closed'
          ? [{ label: 'Terminal', checked: termActive, onSelect: openTerminal }]
          : []),
        ...(aboutOpen
          ? [{ label: 'About This Mac', checked: aboutActive, onSelect: () => setFront('about') }]
          : []),
      ],
    },
    {
      id: 'help',
      title: 'Help',
      items: [
        {
          label: 'View Source on GitHub',
          onSelect: () => window.open(SOURCE_URL, '_blank', 'noopener'),
        },
        { label: `Email ${resume.name.split(' ')[0]}`, onSelect: () => (window.location.href = `mailto:${resume.email}`) },
      ],
    },
  ]
  const menus = isScreen ? [appleMenu, appMenu, ...fullMenus] : [appleMenu, appMenu]

  useEffect(
    () => () => {
      clearTimeout(winTimer.current)
      clearTimeout(bounceTimer.current)
    },
    [],
  )

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

  // Mark which edges of the tab strip hide more tabs, so CSS can fade just
  // those edges. Written straight to the element: scroll fires per frame and
  // nothing else needs to re-render for it.
  useEffect(() => {
    const nav = tabsRef.current
    if (!nav) return
    const update = () => {
      const max = nav.scrollWidth - nav.clientWidth
      nav.dataset.moreLeft = String(nav.scrollLeft > 2)
      nav.dataset.moreRight = String(nav.scrollLeft < max - 2)
    }
    update()
    nav.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(nav)
    return () => {
      nav.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [windowVisible])

  useEffect(() => {
    const id = setInterval(() => setTime(formatClock(isScreen)), 30_000)
    return () => clearInterval(id)
  }, [isScreen])

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
        <MacMenus menus={menus} />
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
        {isScreen && (
          <span className="menubar-status-icons" aria-hidden>
            <WifiIcon size={16} />
            <BatteryIcon size={17} />
          </span>
        )}
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
            className={`window ${winState}${maximized ? ' maximized' : ''}${resumeActive ? ' front' : ' inactive'}`}
            style={winState === 'minimized' ? { display: 'none' } : undefined}
            onPointerDownCapture={() => setFront('resume')}
          >
            {isScreen && <ResizeHandles onResize={onResizePointerDown} />}
            <div
              className="window-titlebar"
              onPointerDown={onTitlePointerDown}
              onDoubleClick={(e) => {
                // macOS: double-clicking a title bar zooms the window.
                if (isScreen && !(e.target as Element).closest('button, .tab')) {
                  setMaximized((m) => !m)
                }
              }}
            >
              <TrafficLights
                label="window"
                onClose={closeWindow}
                onMinimize={minimizeWindow}
                onZoom={() => setMaximized((m) => !m)}
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

        {termState !== 'closed' && (
          <Terminal
            onClose={closeTerminal}
            onMinimize={() => {
              setTermState('minimized')
              setFront('resume')
            }}
            minimized={termState === 'minimized'}
            active={termActive}
            onActivate={() => setFront('terminal')}
            resizable={isScreen}
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

        {aboutOpen && (
          <AboutThisMac
            onClose={closeAbout}
            active={aboutActive}
            onActivate={() => setFront('about')}
            onMoreInfo={() => {
              closeAbout()
              goTo('about')
            }}
          />
        )}

        <Dock magnify={isScreen}>
          <DockItem
            label="Resume"
            ariaLabel="Open Resume"
            icon={<ResumeAppIcon />}
            running={winState !== 'closed'}
            bouncing={bounce === 'resume'}
            onClick={openWindow}
          />
          <DockItem
            label="Terminal"
            ariaLabel="Open Terminal"
            icon={<TerminalAppIcon />}
            running={termState !== 'closed'}
            bouncing={bounce === 'terminal'}
            onClick={openTerminal}
          />
          <DockItem label="Mail" ariaLabel="Email" icon={<MailAppIcon />} href={`mailto:${resume.email}`} />
          <DockSeparator />
          {PROFILES.map(({ platform, url, AppIcon }) => (
            <DockItem
              key={platform}
              label={platform}
              ariaLabel={`${resume.name} on ${platform}`}
              icon={<AppIcon />}
              href={url}
            />
          ))}
        </Dock>
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

      <div className="profile-links">
        {PROFILES.map(({ platform, url, Icon }) => (
          <a className="profile-card" key={platform} href={url} target="_blank" rel="noreferrer me">
            <span className="profile-avatar">
              <img src={avatar} alt="" width={40} height={40} />
              <span className="profile-badge">
                <Icon size={11} />
              </span>
            </span>
            <span className="profile-text">
              <b>{platform}</b>
              <i>@{handleOf(url)}</i>
            </span>
            <ArrowUpRightIcon size={13} />
          </a>
        ))}
      </div>

      <div className="contact-links">
        <CopyEmail />
        <a href={resumePdf} download={PDF_FILENAME}>
          <DownloadIcon size={14} /> resume.pdf
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

/** macOS menubar clock: "Tue Oct 21  9:41 PM" with room, just the time without. */
function formatClock(withDate: boolean) {
  const now = new Date()
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (!withDate) return time
  const date = now
    .toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    .replace(/,/g, '')
  return `${date}  ${time}`
}

/* Re-exported so App.tsx keeps importing its theme icons from one place. */
export { SunIcon, MoonIcon, ArrowUpRightIcon }
