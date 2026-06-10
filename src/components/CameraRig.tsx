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
const screenPos = new THREE.Vector3()
const screenNormal = new THREE.Vector3()
const screenUp = new THREE.Vector3()

interface CameraRigProps {
  ready: boolean
  zoomed: boolean
  screenRef: RefObject<THREE.Group | null>
}

export function CameraRig({ ready, zoomed, screenRef }: CameraRigProps) {
  const lookAt = useRef(new THREE.Vector3().copy(DEFAULT_TARGET))

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera
    const vHalf = THREE.MathUtils.degToRad(cam.fov) / 2
    const hHalf = Math.atan(Math.tan(vHalf) * cam.aspect)

    if (!ready) {
      // Hold the cinematic start pose until the loader reveals the scene
      desiredPos.copy(INTRO_POS)
      desiredTarget.copy(DEFAULT_TARGET)
    } else if (zoomed && screenRef.current) {
      const dist = Math.max(
        SCREEN_HALF_H / Math.tan(vHalf) / V_FILL,
        SCREEN_HALF_W / Math.tan(hHalf) / H_FILL,
      )
      screenRef.current.getWorldPosition(screenPos)
      screenRef.current.getWorldDirection(screenNormal)
      screenUp.setFromMatrixColumn(screenRef.current.matrixWorld, 1).normalize()
      desiredPos.copy(screenPos).addScaledVector(screenNormal, dist)
      desiredTarget.copy(screenPos)
      // Translate camera + target up together → the screen sits lower in frame
      desiredPos.addScaledVector(screenUp, TOP_REVEAL)
      desiredTarget.addScaledVector(screenUp, TOP_REVEAL)
    } else {
      // Idle: frame the whole laptop on any viewport, drift with the pointer
      const idleDist = Math.max(80, (LAPTOP_HALF_W * 1.18) / Math.tan(hHalf))
      desiredPos.set(state.pointer.x * 8, 16 + state.pointer.y * 4, idleDist)
      desiredTarget.copy(DEFAULT_TARGET)
    }

    const k = 1 - Math.exp(-3.5 * delta)
    cam.position.lerp(desiredPos, k)
    lookAt.current.lerp(desiredTarget, k)
    cam.lookAt(lookAt.current)
  })

  return null
}
