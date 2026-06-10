/*
 * MacBook Pro M3 16" model by jackbaeten (CC-BY-4.0)
 * https://sketchfab.com/3d-models/macbook-pro-m3-16-inch-2024-8e34fc2b303144f78490007d91ff57c4
 */
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import { ResumeScreen } from './ResumeScreen'

interface MacBookProps {
  ready: boolean
  zoomed: boolean
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  screenRef: RefObject<THREE.Group | null>
  onScreenClick: () => void
}

export function MacBook({ ready, zoomed, theme, onToggleTheme, screenRef, onScreenClick }: MacBookProps) {
  const group = useRef<THREE.Group>(null)
  const screenMesh = useRef<THREE.Mesh>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { nodes, materials } = useGLTF('/macbook-16.glb') as any
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.getElapsedTime()
    // Hold below frame until the loader reveals the scene, then rise in.
    // Gentle float while browsing; freeze in place when zoomed into the screen.
    const rx = !ready || zoomed ? 0 : Math.cos(t / 10) / 14
    const ry = !ready ? -0.55 : zoomed ? 0 : Math.sin(t / 10) / 7
    const rz = !ready || zoomed ? 0 : Math.sin(t / 10) / 14
    const py = !ready ? -28 : zoomed ? 0 : Math.sin(t) * 0.6
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rx, 4, delta)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ry, 4, delta)
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, rz, 4, delta)
    g.position.y = THREE.MathUtils.damp(g.position.y, py, 4, delta)
  })

  return (
    <group
      ref={group}
      dispose={null}
      position={[0, -28, 0]}
      rotation={[0, -0.55, 0]}
      onPointerOver={(e) => {
        e.stopPropagation()
        if (!zoomed) setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh geometry={nodes.Object_10.geometry} material={materials.PaletteMaterial001} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_16.geometry} material={materials.zhGRTuGrQoJflBD} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_20.geometry} material={materials.PaletteMaterial002} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_22.geometry} material={materials.lmWQsEjxpsebDlK} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_30.geometry} material={materials.LtEafgAVRolQqRw} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_32.geometry} material={materials.iyDJFXmHelnMTbD} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_34.geometry} material={materials.eJObPwhgFzvfaoZ} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_38.geometry} material={materials.nDsMUuDKliqGFdU} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_42.geometry} material={materials.CRQixVLpahJzhJc} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_48.geometry} material={materials.YYwBgwvcyZVOOAA} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_54.geometry} material={materials.SLGkCohDDelqXBu} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_58.geometry} material={materials.WnHKXHhScfUbJQi} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_66.geometry} material={materials.fNHiBfcxHUJCahl} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_74.geometry} material={materials.LpqXZqhaGCeSzdu} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_82.geometry} material={materials.gMtYExgrEUqPfln} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_96.geometry} material={materials.PaletteMaterial003} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={nodes.Object_107.geometry} material={materials.JvMFZolVCdpPqjj} rotation={[Math.PI / 2, 0, 0]} />
      {/* Display panel — the resume site is layered on top of it */}
      <mesh
        ref={screenMesh}
        geometry={nodes.Object_123.geometry}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          if (!zoomed) onScreenClick()
        }}
      >
        <meshBasicMaterial color="#050505" />
      </mesh>
      <mesh geometry={nodes.Object_127.geometry} material={materials.ZCDwChwkbBfITSW} rotation={[Math.PI / 2, 0, 0]} />

      {/* Screen anchor: Html plane placed over the display panel.
          Measured from Object_123's bounding box: center (0, 11.75, -16.96),
          34.39 units wide, leaning back 20° and facing +Z. Nudged 0.1 along
          the normal to avoid z-fighting with the glass. */}
      <group ref={screenRef} position={[0, 11.78, -16.86]} rotation-x={-0.349}>
        <Html className="screen-html" transform occlude scale={1.03} zIndexRange={[10, 0]}>
          <div className="screen-content" onPointerDown={(e) => e.stopPropagation()}>
            <ResumeScreen zoomed={zoomed} theme={theme} onToggleTheme={onToggleTheme} />
            {!zoomed && (
              <div className="screen-clickguard" onClick={onScreenClick} title="Click to zoom in" />
            )}
          </div>
        </Html>
      </group>
    </group>
  )
}

useGLTF.preload('/macbook-16.glb')
