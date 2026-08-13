import { useEffect, useRef, useState } from 'react'
import { useDraggable } from '../hooks/useDraggable'
import { resume } from '../data/resume'
import { projects } from '../data/projects'
import { SECTIONS } from './sections'
import type { SectionId } from './sections'
import resumePdf from '../assets/Amirali Beigi - Resume.pdf'

interface TerminalProps {
  onClose: () => void
  onOpenTab: (id: SectionId) => void
  onOpenProject: (slug: string) => void
  onOpenJob: (slug: string) => void
}

interface Line {
  text: string
  kind: 'cmd' | 'out' | 'accent' | 'err'
}

const out = (text: string): Line => ({ text, kind: 'out' })
const accent = (text: string): Line => ({ text, kind: 'accent' })

const HELP: Line[] = [
  out('available commands:'),
  accent('  help          show this list'),
  accent('  whoami        who am I'),
  accent('  about         short bio'),
  accent('  skills        tech I work with'),
  accent('  experience    jobs · experience <slug> opens a case study'),
  accent('  projects      my own work · projects <slug> opens one'),
  accent('  open <name>   open a tab, a job or a project'),
  accent('  neofetch      system info'),
  accent('  hire          availability + contact'),
  accent('  email         print my email'),
  accent('  resume        download resume.pdf'),
  accent('  clear · exit'),
]

/** Fake zsh session in a second macOS window — content comes from the resume
 *  and project data, so it can never drift from the real site. */
export function Terminal({ onClose, onOpenTab, onOpenProject, onOpenJob }: TerminalProps) {
  const [lines, setLines] = useState<Line[]>(() => [
    out(`Last login: ${new Date().toDateString()} on ttys001`),
    out("Welcome — type 'help' to see what I can do."),
  ])
  const [input, setInput] = useState('')
  const history = useRef<string[]>([])
  const histIdx = useRef(-1)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { targetRef: dragRef, onTitlePointerDown } = useDraggable()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const downloadResume = () => {
    const a = document.createElement('a')
    a.href = resumePdf
    a.download = `${resume.name} - Resume.pdf`
    a.click()
  }

  const exec = (raw: string): Line[] | 'CLEAR' => {
    const [cmd = '', ...rest] = raw.trim().split(/\s+/)
    const arg = rest.join(' ').toLowerCase()

    switch (cmd.toLowerCase()) {
      case '':
        return []
      case 'help':
        return HELP
      case 'whoami':
        return [out(`${resume.name} — ${resume.title}`), out(resume.tagline)]
      case 'about':
        return [out(resume.about)]
      case 'skills':
        return resume.skills.map((g) => out(`${(g.group + ':').padEnd(20)}${g.items.join(', ')}`))
      case 'experience': {
        if (arg) return openJob(arg)
        return [
          ...resume.experience.map((j) =>
            out(`${j.slug.padEnd(12)}${j.period.padEnd(16)}${j.role} · ${j.company}`),
          ),
          accent("tip: 'experience <slug>' opens the case study"),
        ]
      }
      case 'projects': {
        if (arg) return openProject(arg)
        return [
          ...projects.map((p) => out(`${p.slug.padEnd(14)}${p.name} — ${p.tagline}`)),
          accent("tip: 'projects <slug>' opens the case study"),
        ]
      }
      case 'open': {
        if (!arg) return [{ text: 'usage: open <tab|project>', kind: 'err' }]
        const tab = SECTIONS.find((s) => s.id === arg || s.label === arg)
        if (tab) {
          onOpenTab(tab.id)
          return [out(`opening ${tab.label}…`)]
        }
        // A bare name could be either — projects first, then employers.
        const p = findProject(arg)
        if (p) {
          onOpenProject(p.slug)
          return [out(`opening ${p.name}…`)]
        }
        return openJob(arg)
      }
      case 'hire':
        onOpenTab('hire')
        return [
          accent(`● ${resume.availability.headline.toLowerCase()}`),
          out(`${resume.availability.timezone} · ${resume.availability.response}`),
          out(`→ ${resume.email}`),
        ]
      case 'email':
        return [out(resume.email)]
      case 'resume':
        downloadResume()
        return [out('downloading resume.pdf…')]
      case 'neofetch':
        return neofetch()
      case 'sudo':
        return [{ text: `${resume.name.split(' ')[0].toLowerCase()} is not in the sudoers file. This incident will be reported.`, kind: 'err' }]
      case 'clear':
        return 'CLEAR'
      case 'exit':
        onClose()
        return []
      default:
        return [{ text: `zsh: command not found: ${cmd} — try 'help'`, kind: 'err' }]
    }
  }

  const findProject = (query: string) =>
    projects.find((x) => x.slug === query || x.name.toLowerCase().includes(query))

  const openProject = (query: string): Line[] => {
    const p = findProject(query)
    if (!p) return [{ text: `no project matching '${query}' — try 'projects'`, kind: 'err' }]
    onOpenProject(p.slug)
    return [out(`opening ${p.name}…`)]
  }

  const openJob = (query: string): Line[] => {
    const j = resume.experience.find(
      (x) => x.slug === query || x.company.toLowerCase().includes(query),
    )
    if (!j) return [{ text: `nothing matching '${query}' — try 'experience'`, kind: 'err' }]
    onOpenJob(j.slug)
    return [out(`opening ${j.company}…`)]
  }

  const neofetch = (): Line[] => {
    const skillCount = resume.skills.reduce((n, g) => n + g.items.length, 0)
    const art = ['   ▄████▄  ', '  ██▀  ▀██ ', '  ██ ▄█▄██ ', '  ██ ▀▀▀██ ', '  ██▄  ▄██ ', '   ▀████▀  ', '           ', '           ']
    const info = [
      `${resume.name.split(' ')[0].toLowerCase()}@portfolio`,
      '─────────────────',
      'os        macOS (web edition)',
      'host      MacBook Pro M3 16" · three.js',
      'shell     zsh · react 19',
      'uptime    6+ years in production',
      `packages  ${skillCount} skills, ${projects.length} projects`,
      resume.availability.open ? 'status    ● available for projects' : 'status    open to interesting work',
    ]
    return art.map((a, i) => accent(a + '  ' + (info[i] ?? '')))
  }

  const submit = () => {
    const raw = input
    setInput('')
    histIdx.current = -1
    if (raw.trim()) history.current.unshift(raw)
    const result = exec(raw)
    if (result === 'CLEAR') {
      setLines([])
      return
    }
    setLines((prev) => [...prev, { text: raw, kind: 'cmd' }, ...result])
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Keep every key inside the terminal — page handlers must not see them.
    e.stopPropagation()
    if (e.key === 'Enter') {
      submit()
    } else if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = history.current
      if (h.length) {
        histIdx.current = Math.min(histIdx.current + 1, h.length - 1)
        setInput(h[histIdx.current])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx.current > 0) {
        histIdx.current -= 1
        setInput(history.current[histIdx.current])
      } else {
        histIdx.current = -1
        setInput('')
      }
    }
  }

  return (
    <div
      ref={dragRef}
      className="term-window"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="term-titlebar" onPointerDown={onTitlePointerDown}>
        <button className="traffic red" onClick={onClose} aria-label="Close terminal" />
        <span className="traffic yellow inert" />
        <span className="traffic green inert" />
        <span className="term-title">
          {resume.name.split(' ')[0].toLowerCase()}@portfolio — zsh
        </span>
      </div>
      <div className="term-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
        {lines.map((l, i) => (
          <div key={i} className={`term-line t-${l.kind}`}>
            {l.text}
          </div>
        ))}
        <div className="term-inputrow">
          <span className="term-prompt">❯</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal input"
          />
        </div>
      </div>
    </div>
  )
}
