import { useEffect, useRef, useState } from 'react'
import type { CaseStudy } from '../data/caseStudy'
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CloseIcon, GitHubIcon } from './icons'

/** Finder-style Quick Look panel, anchored to the macOS window (not the page).
 *  Shared by the Projects tab and the Experience tab — a job and a side project
 *  tell the same three-beat story, so they get the same panel. */
export function QuickLook({ item: p, onClose }: { item: CaseStudy; onClose: () => void }) {
  const images = [p.cover, ...(p.gallery ?? [])].filter((s): s is string => Boolean(s))
  const [idx, setIdx] = useState(0)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  // Capture-phase keys so Esc / arrows act on the panel before the page-level
  // handlers (zoom-out, tab switching) can see them.
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        e.stopPropagation()
        setIdx((i) => (i + 1) % images.length)
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        e.stopPropagation()
        setIdx((i) => (i - 1 + images.length) % images.length)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [images.length, onClose])

  return (
    /* stopPropagation keeps wheel/touch from driving the guided-scroll
       controller (window listeners) while the panel is open. */
    <div
      className="quicklook"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        className="ql-panel"
        role="dialog"
        aria-label={`${p.name} details`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ql-bar">
          <span className="ql-title">{p.name} — quick look</span>
          <button ref={closeRef} className="ql-close" onClick={onClose} aria-label="Close preview">
            <CloseIcon size={14} />
          </button>
        </header>
        <div className="ql-content">
          <div className="ql-media">
            {images.length > 0 ? (
              <img src={images[idx]} alt={`${p.name} screenshot ${idx + 1}`} />
            ) : (
              <CoverArt name={p.name} tagline={p.tagline} />
            )}
            {images.length > 1 && (
              <div className="ql-nav">
                <button
                  onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
                  aria-label="Previous image"
                >
                  <ArrowLeftIcon size={14} />
                </button>
                <span>
                  {idx + 1} / {images.length}
                </span>
                <button
                  onClick={() => setIdx((i) => (i + 1) % images.length)}
                  aria-label="Next image"
                >
                  <ArrowRightIcon size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="ql-info">
            <div className="ql-meta">
              <span className="proj-kind">{p.kind}</span>
              <span className="ql-role">
                {p.role} · {p.year}
              </span>
            </div>
            <p className="ql-tagline">{p.tagline}</p>
            <div className="stats">
              {p.metrics.map((m) => (
                <span className="stat" key={m.label}>
                  <b>{m.value}</b>
                  <i>{m.label}</i>
                </span>
              ))}
            </div>
            <dl className="ql-story">
              <div>
                <dt>the problem</dt>
                <dd>{p.story.problem}</dd>
              </div>
              <div>
                <dt>what I built</dt>
                <dd>{p.story.built}</dd>
              </div>
              <div>
                <dt>impact</dt>
                <dd>{p.story.impact}</dd>
              </div>
            </dl>
            <div className="chips">
              {p.tech.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <QuickLookLinks links={p.links} />
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickLookLinks({ links }: { links?: CaseStudy['links'] }) {
  if (!links?.live && !links?.github && !links?.docs) return null
  return (
    <div className="ql-links">
      {links.live && (
        <a className="ql-btn primary" href={links.live} target="_blank" rel="noreferrer">
          visit live <ArrowUpRightIcon size={13} />
        </a>
      )}
      {links.docs && (
        <a className="ql-btn" href={links.docs} target="_blank" rel="noreferrer">
          docs <ArrowUpRightIcon size={13} />
        </a>
      )}
      {links.github && (
        <a className="ql-btn" href={links.github} target="_blank" rel="noreferrer">
          <GitHubIcon size={14} /> source
        </a>
      )}
    </div>
  )
}

/** Stand-in for a missing screenshot. Typographic and monochrome on purpose —
 *  it should read as a deliberate cover, not as a failed image load. */
export function CoverArt({ name, tagline }: { name: string; tagline?: string }) {
  return (
    <span className="cover-art" aria-hidden>
      <span className="cover-art-mark">{name.charAt(0)}</span>
      <span className="cover-art-name">{name}</span>
      {tagline && <span className="cover-art-line">{tagline}</span>}
    </span>
  )
}
