import { useCallback, useRef } from 'react'

/**
 * Titlebar-drag for the fake macOS windows. The offset is applied through the
 * CSS `translate` property as an inline style, so it composes with the
 * existing transform animations — and untouched windows stay untransformed
 * (a standing transform would trip Firefox's square-corner rasterization
 * inside the 3D screen).
 *
 * Inside the 3D screen a viewport pixel ≠ a content pixel (the HTML plane is
 * scaled by the camera), so deltas are divided by the titlebar's on-screen /
 * layout size ratio. Offsets are clamped so a window can never be dragged
 * fully out of the desktop.
 */
export function useDraggable<T extends HTMLElement = HTMLDivElement>() {
  const targetRef = useRef<T | null>(null)
  const offset = useRef({ x: 0, y: 0 })

  const onTitlePointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // Buttons and tabs on the titlebar keep working; touch devices (fullscreen
    // overlay, guided scroll) don't drag at all.
    if ((e.target as Element).closest('button, a, .tab')) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = targetRef.current
    if (!el) return
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

  return { targetRef, onTitlePointerDown }
}
