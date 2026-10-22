import { useCallback, useRef } from 'react'

export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

export const RESIZE_EDGES: ResizeEdge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

interface Options {
  /** Smallest size a window can be resized down to, in content px. */
  minWidth?: number
  minHeight?: number
}

/**
 * Titlebar-drag and edge-resize for the fake macOS windows. The offset is
 * applied through the CSS `translate` property as an inline style, so it
 * composes with the existing transform animations — and untouched windows stay
 * untransformed (a standing transform would trip Firefox's square-corner
 * rasterization inside the 3D screen).
 *
 * Inside the 3D screen a viewport pixel ≠ a content pixel (the HTML plane is
 * scaled by the camera), so deltas are divided by the element's on-screen /
 * layout size ratio. Offsets are clamped so a window can never be dragged
 * fully out of the desktop, and resizing stops at the desktop's edges.
 *
 * Resizing writes inline width/height (+ `flex: none` for the in-flow resume
 * window). The `.maximized` class overrides those with !important, so zoom
 * still fills the desktop and un-zooming restores the user's size.
 */
export function useDraggable<T extends HTMLElement = HTMLDivElement>({
  minWidth = 420,
  minHeight = 260,
}: Options = {}) {
  const targetRef = useRef<T | null>(null)
  const offset = useRef({ x: 0, y: 0 })

  const onTitlePointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // Buttons and tabs on the titlebar keep working; touch devices (fullscreen
    // overlay, guided scroll) don't drag at all.
    if ((e.target as Element).closest('button, a, .tab')) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = targetRef.current
    if (!el || el.classList.contains('maximized')) return
    e.preventDefault()

    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const scaleX = rect.width / bar.offsetWidth || 1
    const scaleY = rect.height / bar.offsetHeight || 1
    const startX = e.clientX
    const startY = e.clientY
    const base = { ...offset.current }

    const onMove = (ev: PointerEvent) => {
      let x = base.x + (ev.clientX - startX) / scaleX
      let y = base.y + (ev.clientY - startY) / scaleY
      const parent = el.offsetParent as HTMLElement | null
      if (parent) {
        // Keep ≥90px of the window reachable, and never above the menubar.
        const keep = 90
        x = Math.max(
          -(el.offsetLeft + el.offsetWidth - keep),
          Math.min(x, parent.clientWidth - el.offsetLeft - keep),
        )
        y = Math.max(-el.offsetTop, Math.min(y, parent.clientHeight - el.offsetTop - 44))
      }
      offset.current = { x, y }
      el.style.translate = `${x}px ${y}px`
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  const onResizePointerDown = useCallback(
    (edge: ResizeEdge) => (e: React.PointerEvent<HTMLElement>) => {
      if (!window.matchMedia('(pointer: fine)').matches) return
      const el = targetRef.current
      const parent = el?.offsetParent as HTMLElement | null
      if (!el || !parent || el.classList.contains('maximized')) return
      e.preventDefault()
      e.stopPropagation()

      // An absolutely positioned window centred with auto margins (Terminal)
      // would re-centre as it changes width, dragging the edge you're not
      // holding along with it. Pin it where it currently sits first.
      if (getComputedStyle(el).position === 'absolute') {
        el.style.left = `${el.offsetLeft}px`
        el.style.top = `${el.offsetTop}px`
        el.style.right = 'auto'
        el.style.margin = '0'
      }

      const rect = el.getBoundingClientRect()
      const scaleX = rect.width / el.offsetWidth || 1
      const scaleY = rect.height / el.offsetHeight || 1
      const startX = e.clientX
      const startY = e.clientY
      const startW = el.offsetWidth
      const startH = el.offsetHeight
      const base = { ...offset.current }
      // Current edges, in the parent's content box (layout offset + drag).
      const left = el.offsetLeft + base.x
      const top = el.offsetTop + base.y
      const maxRight = parent.clientWidth
      const maxBottom = parent.clientHeight

      const onMove = (ev: PointerEvent) => {
        const dx = (ev.clientX - startX) / scaleX
        const dy = (ev.clientY - startY) / scaleY
        let w = startW
        let h = startH
        if (edge.includes('e')) w = Math.min(startW + dx, maxRight - left)
        if (edge.includes('w')) w = Math.min(startW - dx, startW + left)
        if (edge.includes('s')) h = Math.min(startH + dy, maxBottom - top)
        if (edge.includes('n')) h = Math.min(startH - dy, startH + top)
        w = Math.max(minWidth, w)
        h = Math.max(minHeight, h)
        // Dragging a left/top edge moves that edge, so the opposite one stays
        // put: shift the window by however much it grew.
        const x = edge.includes('w') ? base.x + (startW - w) : base.x
        const y = edge.includes('n') ? base.y + (startH - h) : base.y
        offset.current = { x, y }
        el.style.width = `${w}px`
        el.style.height = `${h}px`
        el.style.flex = 'none'
        el.style.translate = `${x}px ${y}px`
      }
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [minWidth, minHeight],
  )

  return { targetRef, onTitlePointerDown, onResizePointerDown }
}
