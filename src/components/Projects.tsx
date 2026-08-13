import { useState } from 'react'
import { projects } from '../data/projects'
import type { Project } from '../data/projects'
import { CoverArt, QuickLook } from './QuickLook'
import { ArrowRightIcon, ArrowUpRightIcon, GitHubIcon, StarIcon } from './icons'

interface ProjectsProps {
  /** Controlled Quick Look slug (deep links / Spotlight / terminal).
   *  `undefined` = uncontrolled, `null` = controlled and closed. */
  openSlug?: string | null
  onOpenChange?: (slug: string | null) => void
}

export function Projects({ openSlug, onOpenChange }: ProjectsProps) {
  const [internalSlug, setInternalSlug] = useState<string | null>(null)
  const slug = openSlug !== undefined ? openSlug : internalSlug
  const setSlug = onOpenChange ?? setInternalSlug
  const setActive = (p: Project | null) => setSlug(p ? p.slug : null)
  const active = slug ? (projects.find((p) => p.slug === slug) ?? null) : null
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)

  return (
    <>
      <div className="section projects">
        <h3 className="section-title">Projects</h3>
        <p className="section-lede">
          Things I build for myself. Open source unless noted — source and live links on
          every card.
        </p>

        <div className="feat-list">
          {featured.map((p, i) => (
            <button className={`feat${i % 2 ? ' flip' : ''}`} key={p.slug} onClick={() => setActive(p)}>
              <span className="feat-media">
                {p.cover ? (
                  <img src={p.cover} alt={`${p.name} preview`} loading="lazy" />
                ) : (
                  <CoverArt name={p.name} tagline={p.tagline} />
                )}
              </span>
              <span className="feat-info">
                <span className="feat-top">
                  <strong>{p.name}</strong>
                  <span className="proj-kind">{p.kind}</span>
                  {p.stars ? <StarBadge count={p.stars} /> : null}
                </span>
                <span className="feat-tagline">{p.tagline}</span>
                <span className="stats">
                  {p.metrics.slice(0, 3).map((m) => (
                    <span className="stat" key={m.label}>
                      <b>{m.value}</b>
                      <i>{m.label}</i>
                    </span>
                  ))}
                </span>
                <span className="chips">
                  {p.tech.slice(0, 5).map((t) => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </span>
                <span className="feat-cta">
                  view case study <ArrowRightIcon size={13} />
                </span>
              </span>
            </button>
          ))}
        </div>

        <h4 className="sub-title">more projects</h4>
        <div className="proj-grid">
          {rest.map((p) => (
            <button className="proj-card" key={p.slug} onClick={() => setActive(p)}>
              <span className="proj-thumb">
                {p.cover ? (
                  <img src={p.cover} alt={`${p.name} preview`} loading="lazy" />
                ) : (
                  <CoverArt name={p.name} />
                )}
              </span>
              <span className="proj-body">
                <span className="card-head">
                  <strong>{p.name}</strong>
                  {p.stars ? <StarBadge count={p.stars} /> : <span className="card-year">{p.year}</span>}
                </span>
                <span className="proj-tagline">{p.tagline}</span>
                <span className="chips">
                  {p.tech.slice(0, 4).map((t) => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </span>
              </span>
            </button>
          ))}
        </div>

        <a className="gh-all" href="https://github.com/amiralibg" target="_blank" rel="noreferrer">
          <GitHubIcon size={15} /> everything else on GitHub <ArrowUpRightIcon size={13} />
        </a>
      </div>

      {/* Rendered outside .section: its entrance transform would otherwise
          become the containing block and trap the overlay inside the body. */}
      {active && <QuickLook item={active} onClose={() => setActive(null)} />}
    </>
  )
}

function StarBadge({ count }: { count: number }) {
  return (
    <span className="star-badge" title={`${count} stars on GitHub`}>
      <StarIcon size={12} />
      {count}
    </span>
  )
}
