import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

/** Peak size of the icon under the pointer, as a multiple of the resting tile. */
const MAX_SCALE = 1.6
/** How far magnification reaches either side of the pointer, in resting slots. */
const REACH = 2.6

interface RestLayout {
  /** Left/right edges of every dock child (icons and separators), at rest. */
  edges: number[]
  width: number
  /** Resting slot width (tile + gap): the unit REACH is measured in. */
  slot: number
}

/**
 * The macOS dock: a glass shelf whose icons swell under the pointer in a smooth
 * bell, pushing their neighbours apart. Sizes go through layout (width/height),
 * not transforms: inside the 3D screen a transform would promote each icon to
 * its own layer, which Firefox clips square. Fine-pointer only; the phone
 * overlay gets a static dock.
 */
export function Dock({ magnify, children }: { magnify: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const rest = useRef<RestLayout | null>(null)
  const pointerX = useRef<number | null>(null)
  const frame = useRef(0)

  const reset = useCallback(() => {
    cancelAnimationFrame(frame.current)
    pointerX.current = null
    const dock = ref.current
    if (!dock) return
    dock.classList.remove('magnifying')
    for (const el of dock.children) (el as HTMLElement).style.removeProperty('--size')
  }, [])

  useEffect(() => reset, [reset])

  const apply = () => {
    const dock = ref.current
    const clientX = pointerX.current
    if (!dock || clientX === null) return
    const kids = Array.from(dock.children) as HTMLElement[]
    if (!rest.current) {
      rest.current = {
        edges: kids.flatMap((k) => [k.offsetLeft, k.offsetLeft + k.offsetWidth]),
        width: dock.offsetWidth,
        slot: kids[1].offsetLeft - kids[0].offsetLeft,
      }
    }
    const { edges, width, slot } = rest.current

    // Pointer in the dock's own (current, magnified) coordinates. The screen
    // faces the camera head-on whenever the dock is reachable, so scaling the
    // projected rect back to the layout width is exact enough.
    const box = dock.getBoundingClientRect()
    const x = ((clientX - box.left) / box.width) * dock.offsetWidth

    // Map it back to where it would sit in the resting dock, segment by
    // segment, so growing icons don't drag the focus point with them.
    const cur = [0, ...kids.flatMap((k) => [k.offsetLeft, k.offsetLeft + k.offsetWidth]), dock.offsetWidth]
    const was = [0, ...edges, width]
    let restX = x
    for (let i = 0; i < cur.length - 1; i++) {
      if (x <= cur[i + 1] || i === cur.length - 2) {
        const t = cur[i + 1] > cur[i] ? (x - cur[i]) / (cur[i + 1] - cur[i]) : 0
        restX = was[i] + Math.min(Math.max(t, 0), 1) * (was[i + 1] - was[i])
        break
      }
    }

    kids.forEach((k, i) => {
      if (!k.classList.contains('dock-item')) return
      const center = (edges[i * 2] + edges[i * 2 + 1]) / 2
      const base = edges[i * 2 + 1] - edges[i * 2]
      const d = Math.abs(restX - center) / slot
      const bell = d < REACH ? (1 + Math.cos((Math.PI * d) / REACH)) / 2 : 0
      k.style.setProperty('--size', `${(base * (1 + (MAX_SCALE - 1) * bell)).toFixed(2)}px`)
    })
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!magnify || e.pointerType !== 'mouse') return
    pointerX.current = e.clientX
    ref.current?.classList.add('magnifying')
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(apply)
  }

  return (
    <div className="dock" ref={ref} onPointerMove={onPointerMove} onPointerLeave={reset}>
      {children}
    </div>
  )
}

interface DockItemProps {
  label: string
  icon: ReactNode
  /** Running-app dot under the icon. */
  running?: boolean
  bouncing?: boolean
  onClick?: () => void
  /** Renders a link instead of a button (profiles, mailto). */
  href?: string
  ariaLabel?: string
}

/** One dock tile. The name bubble replaces a native `title` tooltip, which
 *  would double it. */
export function DockItem({ label, icon, running, bouncing, onClick, href, ariaLabel }: DockItemProps) {
  const className = `dock-item${bouncing ? ' bounce' : ''}`
  const body = (
    <>
      {icon}
      <span className="dock-label" aria-hidden>
        <span>{label}</span>
      </span>
      {running && <i className="dock-dot" />}
    </>
  )
  return href ? (
    <a
      className={className}
      href={href}
      aria-label={ariaLabel ?? label}
      {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {body}
    </a>
  ) : (
    <button className={className} onClick={onClick} aria-label={ariaLabel ?? label}>
      {body}
    </button>
  )
}

export function DockSeparator() {
  return <span className="dock-sep" aria-hidden />
}
