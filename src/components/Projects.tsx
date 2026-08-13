import { useState } from 'react'
import { projects, STARS_UPDATED } from '../data/projects'
import type { Project } from '../data/projects'
import { useGitHubStars } from '../hooks/useGitHubStars'
import { CoverArt, QuickLook } from './QuickLook'
import { ArrowRightIcon, ArrowUpRightIcon, GitHubIcon, StarIcon } from './icons'

/** Below this, the number says nothing flattering and just adds noise next to a
 *  card showing 198. Real counts only, or none. */
const MIN_STARS_SHOWN = 5

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

  // Live counts when GitHub answers, the committed snapshot when it doesn't.
  const live = useGitHubStars()
  const starsFor = (p: Project) => live[p.slug] ?? p.stars ?? 0
  const isLive = (p: Project) => p.slug in live

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
                  <StarBadge count={starsFor(p)} live={isLive(p)} />
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
                  {starsFor(p) >= MIN_STARS_SHOWN ? (
                    <StarBadge count={starsFor(p)} live={isLive(p)} />
                  ) : (
                    <span className="card-year">{p.year}</span>
                  )}
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

/** Renders nothing below the threshold, so a card never advertises "1 star". */
function StarBadge({ count, live }: { count: number; live: boolean }) {
  if (count < MIN_STARS_SHOWN) return null
  return (
    <span
      className="star-badge"
      title={
        live
          ? `${count} stars on GitHub, fetched just now`
          : `${count} stars on GitHub as of ${STARS_UPDATED}`
      }
    >
      <StarIcon size={12} />
      {count.toLocaleString()}
    </span>
  )
}
