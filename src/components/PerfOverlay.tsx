import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

/**
 * Frame timing and renderer stats, shown only when the URL carries `?perf`.
 *
 * Kept in the repo deliberately: this is a 3D site, so "is it smooth?" is a
 * real question that can only be answered on actual hardware — headless and
 * software rendering say nothing useful about it. Watch `frame p95` rather than
 * the fps average; a stutter is a few slow frames, which an average hides.
 *
 * `calls` is the one to check after touching the scene: it should stay flat
 * once the intro settles. If it jumps every frame, something is re-rendering
 * that shouldn't be — that's exactly how the ContactShadows cost was found.
 */
export function PerfOverlay() {
  const { gl } = useThree()
  const frames = useRef<number[]>([])
  const last = useRef(0)

  useEffect(() => {
    const el = document.createElement('pre')
    el.id = 'perf-overlay'
    el.style.cssText =
      'position:fixed;top:10px;left:10px;z-index:99999;margin:0;padding:10px 14px;' +
      'background:rgba(0,0,0,.82);color:#7CFFB2;font:12px/1.55 ui-monospace,monospace;' +
      'border-radius:8px;white-space:pre;pointer-events:none'
    document.body.appendChild(el)
    return () => el.remove()
  }, [])

  useFrame(() => {
    const now = performance.now()
    // First frame has no previous timestamp to diff against.
    if (last.current !== 0) frames.current.push(now - last.current)
    last.current = now
    if (frames.current.length > 120) frames.current.shift()

    const el = document.getElementById('perf-overlay')
    if (!el || frames.current.length < 10) return

    const avg = frames.current.reduce((a, b) => a + b, 0) / frames.current.length
    const sorted = [...frames.current].sort((a, b) => a - b)
    const p95 = sorted[Math.floor(sorted.length * 0.95)]
    const info = gl.info

    el.textContent = [
      `fps        ${(1000 / avg).toFixed(0)}`,
      `frame avg  ${avg.toFixed(1)}ms`,
      `frame p95  ${p95.toFixed(1)}ms`,
      `draw calls ${info.render.calls}`,
      `triangles  ${info.render.triangles.toLocaleString()}`,
      `textures   ${info.memory.textures}`,
      `dpr        ${gl.getPixelRatio()}`,
    ].join('\n')
  })

  return null
}
