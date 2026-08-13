import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { resume } from '../data/resume'
import { projects } from '../data/projects'
import { SECTIONS } from './sections'
import type { SectionId } from './sections'
import { SearchIcon } from './icons'
import resumePdf from '../assets/Amirali Beigi - Resume.pdf'

interface SpotlightProps {
  open: boolean
  onClose: () => void
  /** Open the resume at a tab (and optionally a project's Quick Look). */
  openAt: (id: SectionId, slug?: string | null) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  mode: 'interactive' | 'scroll'
  onChangeMode: (m: 'interactive' | 'scroll') => void
}

interface SpotItem {
  id: string
  group: string
  title: string
  sub?: string
  /** Extra lowercase keywords the query is matched against. */
  kw: string
  run: () => void
}

/** macOS Spotlight-style command palette (⌘K), rendered at page level.
 *  The panel mounts fresh on every open, so query/selection start clean
 *  without any reset effects. */
export function Spotlight(props: SpotlightProps) {
  if (!props.open) return null
  return <SpotlightPanel {...props} />
}

function SpotlightPanel({
  onClose,
  openAt,
  theme,
  onToggleTheme,
  mode,
  onChangeMode,
}: SpotlightProps) {
  const [query, setQuery] = useState('')
  // Selection is stored with the query it belongs to; a new query derives
  // back to the first row without needing a reset effect.
  const [selRaw, setSelRaw] = useState({ q: '', i: 0 })
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const items = useMemo<SpotItem[]>(() => {
    const download = () => {
      const a = document.createElement('a')
      a.href = resumePdf
      a.download = `${resume.name} - Resume.pdf`
      a.click()
    }
    return [
      ...SECTIONS.map((s) => ({
        id: `tab-${s.id}`,
        group: 'Sections',
        title: s.label,
        sub: 'go to tab',
        kw: `${s.id} ${s.label} tab section`,
        run: () => openAt(s.id),
      })),
      ...projects.map((p) => ({
        id: `proj-${p.slug}`,
        group: 'Projects',
        title: p.name,
        sub: p.tagline,
        kw: `${p.slug} ${p.kind} ${p.tech.join(' ')}`.toLowerCase(),
        run: () => openAt('projects', p.slug),
      })),
      ...resume.experience.map((j) => ({
        id: `job-${j.slug}`,
        group: 'Experience',
        title: j.company,
        sub: `${j.role} · ${j.period}`,
        kw: `${j.slug} ${j.kind} job work ${j.tech.join(' ')}`.toLowerCase(),
        run: () => openAt('experience', j.slug),
      })),
      {
        id: 'act-resume',
        group: 'Actions',
        title: 'Download resume (PDF)',
        kw: 'download resume pdf cv save',
        run: download,
      },
      {
        id: 'act-email',
        group: 'Actions',
        title: 'Email me',
        sub: resume.email,
        kw: 'email mail contact hire message',
        run: () => {
          window.location.href = `mailto:${resume.email}`
        },
      },
      {
        id: 'act-copy',
        group: 'Actions',
        title: 'Copy email address',
        kw: 'copy email clipboard address',
        run: () => void navigator.clipboard?.writeText(resume.email),
      },
      {
        id: 'act-gh',
        group: 'Actions',
        title: 'Open GitHub profile',
        kw: 'github git code repositories open source',
        run: () => window.open(resume.links.github, '_blank', 'noopener'),
      },
      {
        id: 'act-li',
        group: 'Actions',
        title: 'Open LinkedIn profile',
        kw: 'linkedin network profile',
        run: () => window.open(resume.links.linkedin, '_blank', 'noopener'),
      },
      {
        id: 'act-x',
        group: 'Actions',
        title: 'Open X profile',
        kw: 'x twitter social profile follow',
        run: () => window.open(resume.links.x, '_blank', 'noopener'),
      },
      {
        id: 'act-theme',
        group: 'Actions',
        title: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        kw: 'theme light dark appearance toggle',
        run: onToggleTheme,
      },
      {
        id: 'act-mode',
        group: 'Actions',
        title: mode === 'scroll' ? 'Switch to interactive mode' : 'Switch to guided scroll mode',
        kw: 'mode interactive scroll viewing switch',
        run: () => onChangeMode(mode === 'scroll' ? 'interactive' : 'scroll'),
      },
    ]
  }, [openAt, theme, onToggleTheme, mode, onChangeMode])

  const q = query.trim().toLowerCase()
  const results = useMemo(() => {
    if (!q) return items
    return items
      .map((it) => {
        const t = it.title.toLowerCase()
        const score = t.startsWith(q) ? 3 : t.includes(q) ? 2 : it.kw.includes(q) ? 1 : 0
        return { it, score }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.it)
  }, [items, q])

  const sel = selRaw.q === q ? Math.min(selRaw.i, Math.max(results.length - 1, 0)) : 0
  const setSel = (i: number) => setSelRaw({ q, i })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Capture-phase keys so the palette wins over the page-level handlers
  // (zoom-out on Esc, tab flipping on arrows, guided-scroll steps).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.stopPropagation()
        e.preventDefault()
        setSelRaw({ q, i: Math.min(sel + 1, results.length - 1) })
      } else if (e.key === 'ArrowUp') {
        e.stopPropagation()
        e.preventDefault()
        setSelRaw({ q, i: Math.max(sel - 1, 0) })
      } else if (e.key === 'Enter') {
        e.stopPropagation()
        e.preventDefault()
        const it = results[sel]
        if (it) {
          it.run()
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [q, results, sel, onClose])

  // Keep the active row visible while arrowing through a long list.
  useEffect(() => {
    const rows = listRef.current?.querySelectorAll('.spot-item')
    rows?.[sel]?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  return (
    <div
      className="spotlight"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        className="spot-panel"
        role="dialog"
        aria-label="Search"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="spot-inputrow">
          <SearchIcon size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections, projects, actions…"
            aria-label="Search"
          />
          <kbd>esc</kbd>
        </div>
        <div className="spot-list" ref={listRef}>
          {results.length === 0 && <div className="spot-empty">No results for “{query}”</div>}
          {results.map((it, i) => (
            <Fragment key={it.id}>
              {(i === 0 || results[i - 1].group !== it.group) && (
                <div className="spot-group">{it.group}</div>
              )}
              <button
                className={`spot-item${i === sel ? ' active' : ''}`}
                onMouseEnter={() => setSel(i)}
                onClick={() => {
                  it.run()
                  onClose()
                }}
              >
                <span className="spot-title">{it.title}</span>
                {it.sub && <span className="spot-sub">{it.sub}</span>}
              </button>
            </Fragment>
          ))}
        </div>
        <div className="spot-foot">
          <span>
            <kbd>↑↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
