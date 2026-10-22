import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckIcon } from './icons'

export type MenuEntry =
  | {
      label: string
      onSelect: () => void
      checked?: boolean
      disabled?: boolean
      /** Only shown where the shortcut genuinely works (⌘K). The browser owns
       *  ⌘W / ⌘M / ⌘N, so advertising those here would be a lie. */
      shortcut?: string
    }
  | 'sep'

export interface Menu {
  id: string
  /** Text, or the Apple mark. */
  title: ReactNode
  ariaLabel?: string
  /** The app-name menu is bold in macOS. */
  bold?: boolean
  items: MenuEntry[]
}

/**
 * macOS menu-bar behaviour: click a title to open its menu; while one is open,
 * merely hovering another title switches to it; a click anywhere else or Esc
 * closes. Esc is caught in the capture phase so it closes the menu instead of
 * also zooming the camera out.
 */
export function MacMenus({ menus }: { menus: Menu[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(null)
    }
    document.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  return (
    <div className="mac-menus" ref={rootRef} role="menubar">
      {menus.map((m) => (
        <div className="mac-menu" key={m.id}>
          <button
            className={`mac-menu-title${m.bold ? ' bold' : ''}${open === m.id ? ' open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={open === m.id}
            aria-label={m.ariaLabel}
            onClick={() => setOpen((o) => (o === m.id ? null : m.id))}
            onPointerEnter={() => open && open !== m.id && setOpen(m.id)}
          >
            {m.title}
          </button>
          {open === m.id && (
            <div className="mac-menu-panel" role="menu">
              {m.items.map((item, i) =>
                item === 'sep' ? (
                  <i className="mac-menu-sep" key={`sep-${i}`} />
                ) : (
                  <button
                    key={item.label}
                    role="menuitem"
                    className="mac-menu-item"
                    disabled={item.disabled}
                    onClick={() => {
                      setOpen(null)
                      item.onSelect()
                    }}
                  >
                    <span className="mac-menu-check">
                      {item.checked && <CheckIcon size={12} />}
                    </span>
                    <span className="mac-menu-label">{item.label}</span>
                    {item.shortcut && <kbd className="mac-menu-kbd">{item.shortcut}</kbd>}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
