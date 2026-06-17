import * as THREE from 'three'
import { useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'

const DEFAULT_TARGET = new THREE.Vector3(0, 10, 0)
const INTRO_POS = new THREE.Vector3(0, 30, 150)
// World half-sizes measured from the model: screen incl. a sliver of bezel,
// and the laptop's overall footprint (for idle framing).
const SCREEN_HALF_W = 17.8
const SCREEN_HALF_H = 11.6
const LAPTOP_HALF_W = 21
// Zoomed framing: fill 90% of the viewport height and slide the view up a bit
// so the top edge of the lid and the background stay visible above the screen.
const V_FILL = 0.9
const H_FILL = 0.97
const TOP_REVEAL = 1.0 // world units, along the screen's up axis

const desiredPos = new THREE.Vector3()
const desiredTarget = new THREE.Vector3()
const idlePos = new THREE.Vector3()
const idleTarget = new THREE.Vector3()
const zoomPos = new THREE.Vector3()
const zoomTarget = new THREE.Vector3()
const screenPos = new THREE.Vector3()
const screenNormal = new THREE.Vector3()
const screenUp = new THREE.Vector3()

interface CameraRigProps {
  ready: boolean
  zoomed: boolean
  screenRef: RefObject<THREE.Group | null>
  /** Scroll mode: 0 = idle framing, 1 = fully zoomed into the screen. */
  scrollMode?: boolean
  zoomProgressRef?: RefObject<number>
  /** Fraction of the full zoom the scroll travels (mobile only nudges in). */
  maxZoom?: number
  /** Snap to pose and drop the pointer drift for prefers-reduced-motion. */
  reducedMotion?: boolean
}

// Frame the whole laptop, drifting with the pointer. Pointer influence is
// faded out by `engage` so the view settles as it zooms in.
function idleFraming(state: { pointer: THREE.Vector2 }, hHalf: number, engage = 0) {
  const idleDist = Math.max(80, (LAPTOP_HALF_W * 1.18) / Math.tan(hHalf))
  const sway = 1 - engage
  idlePos.set(state.pointer.x * 8 * sway, 16 + state.pointer.y * 4 * sway, idleDist)
  idleTarget.copy(DEFAULT_TARGET)
}

// Frame the open lid's screen, sitting it slightly low so the bezel shows.
function screenFraming(screen: THREE.Group, vHalf: number, hHalf: number) {
  const dist = Math.max(
    SCREEN_HALF_H / Math.tan(vHalf) / V_FILL,
    SCREEN_HALF_W / Math.tan(hHalf) / H_FILL,
  )
  screen.getWorldPosition(screenPos)
  screen.getWorldDirection(screenNormal)
  screenUp.setFromMatrixColumn(screen.matrixWorld, 1).normalize()
  zoomPos.copy(screenPos).addScaledVector(screenNormal, dist).addScaledVector(screenUp, TOP_REVEAL)
  zoomTarget.copy(screenPos).addScaledVector(screenUp, TOP_REVEAL)
}

export function CameraRig({
  ready,
  zoomed,
  screenRef,
  scrollMode,
  zoomProgressRef,
  maxZoom = 1,
  reducedMotion,
}: CameraRigProps) {
  const lookAt = useRef(new THREE.Vector3().copy(DEFAULT_TARGET))

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera
    const vHalf = THREE.MathUtils.degToRad(cam.fov) / 2
    const hHalf = Math.atan(Math.tan(vHalf) * cam.aspect)
    // Reduced motion: kill the pointer drift (engage = 1 → no sway).
    const noSway = reducedMotion ? 1 : 0

    if (!ready) {
      // Hold the cinematic start pose until the loader reveals the scene
      desiredPos.copy(INTRO_POS)
      desiredTarget.copy(DEFAULT_TARGET)
    } else if (scrollMode && zoomProgressRef) {
      // Scroll-driven: blend continuously between idle and zoomed framing.
      // maxZoom caps the travel — mobile only nudges in before the modal opens.
      const zp = THREE.MathUtils.clamp(zoomProgressRef.current, 0, 1)
      const s = zp * zp * (3 - 2 * zp) // smoothstep
      const e = s * maxZoom
      idleFraming(state, hHalf, Math.max(s, noSway))
      if (screenRef.current && zp > 0) {
        screenFraming(screenRef.current, vHalf, hHalf)
        desiredPos.copy(idlePos).lerp(zoomPos, e)
        desiredTarget.copy(idleTarget).lerp(zoomTarget, e)
      } else {
        desiredPos.copy(idlePos)
        desiredTarget.copy(idleTarget)
      }
    } else if (zoomed && screenRef.current) {
      screenFraming(screenRef.current, vHalf, hHalf)
      desiredPos.copy(zoomPos)
      desiredTarget.copy(zoomTarget)
    } else {
      idleFraming(state, hHalf, noSway)
      desiredPos.copy(idlePos)
      desiredTarget.copy(idleTarget)
    }

    // Snap instantly when the user prefers reduced motion; glide otherwise.
    const k = reducedMotion ? 1 : 1 - Math.exp(-3.5 * delta)
    cam.position.lerp(desiredPos, k)
    lookAt.current.lerp(desiredTarget, k)
    cam.lookAt(lookAt.current)
  })

  return null
}
