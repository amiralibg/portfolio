import { useEffect, useState } from 'react'

/** One request for the whole profile rather than one per repo — eight separate
 *  calls would burn the unauthenticated rate limit in a handful of visits. */
const ENDPOINT = 'https://api.github.com/users/amiralibg/repos?per_page=100&type=owner'

const CACHE_KEY = 'gh-stars'
/** Star counts move slowly; re-fetching more often than this only spends
 *  someone's rate limit for a number that hasn't changed. */
const TTL_MS = 6 * 60 * 60 * 1000

/** Keyed by lowercased repo name, since project slugs are lowercase and the
 *  repos are not (Doran, Ganjino). */
export type StarMap = Record<string, number>

interface Cached {
  at: number
  stars: StarMap
}

function readCache(): Cached | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Cached
    if (typeof parsed?.at !== 'number' || !parsed.stars) return null
    return parsed
  } catch {
    // Corrupt or unavailable storage (private mode) — behave as a cache miss.
    return null
  }
}

/**
 * Live GitHub star counts, or `{}` when they aren't available.
 *
 * Callers fall back to the snapshot committed in `projects.ts`, so this only
 * ever *upgrades* what's on screen: the page renders the known-good number
 * immediately and swaps in the live one if it arrives. Nothing here can leave
 * a card empty or shift the layout.
 *
 * Every failure — offline, rate limited (60/hr per IP unauthenticated), blocked
 * by a network — is silent and keeps the snapshot.
 */
export function useGitHubStars(): StarMap {
  const [stars, setStars] = useState<StarMap>(() => readCache()?.stars ?? {})

  useEffect(() => {
    const cached = readCache()
    if (cached && Date.now() - cached.at < TTL_MS) return

    let active = true
    fetch(ENDPOINT, { headers: { Accept: 'application/vnd.github+json' } })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json() as Promise<Array<{ name: string; stargazers_count: number }>>
      })
      .then((repos) => {
        if (!active || !Array.isArray(repos)) return
        const next: StarMap = {}
        for (const r of repos) next[r.name.toLowerCase()] = r.stargazers_count
        setStars(next)
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), stars: next }))
        } catch {
          // Storage full or blocked — the numbers are still correct this visit.
        }
      })
      .catch(() => {
        // Stale cache beats no data: leave whatever we already showed in place.
      })

    return () => {
      active = false
    }
  }, [])

  return stars
}
