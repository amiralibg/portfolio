import { useCallback, useEffect, useState } from 'react'
import { resume } from '../data/resume'
import {
  ArrowUpRightIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  MailIcon,
  SearchIcon,
} from '../components/icons'
import './admin.css'

const API = import.meta.env.VITE_CONTACT_API
  ? // Same host as the contact endpoint, minus the /contact leaf.
    import.meta.env.VITE_CONTACT_API.replace(/\/contact\/?$/, '')
  : '/api'

/** The token lives in sessionStorage, not localStorage: closing the tab logs
 *  you out, which is the right default for something that reads every message
 *  anyone has ever sent. */
const TOKEN_KEY = 'admin-token'

export interface Message {
  id: number
  name: string
  email: string
  message: string
  ip: string | null
  userAgent: string | null
  read: boolean
  createdAt: string
}

async function api<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY))

  // Never let this get indexed, and never let it inherit the portfolio's title.
  //
  // The theme attribute matters more than it looks: every colour token is
  // defined under `:root[data-theme=…]`, and App.tsx is what normally sets it.
  // App never mounts here, so without this the whole page renders with
  // undefined variables — invisible buttons on a blank white sheet.
  useEffect(() => {
    document.title = 'Inbox'

    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.dataset.theme =
      stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light'

    return () => {
      meta.remove()
    }
  }, [])

  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  const signIn = useCallback((t: string) => {
    sessionStorage.setItem(TOKEN_KEY, t)
    setToken(t)
  }, [])

  return token ? <Inbox token={token} onSignOut={signOut} /> : <TokenGate onSignIn={signIn} />
}

function TokenGate({ onSignIn }: { onSignIn: (t: string) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = value.trim()
    if (!t || busy) return
    setBusy(true)
    setError(null)
    try {
      // Validate before storing, so a bad token never gets persisted.
      await api<{ ok: boolean }>('/admin/session', t)
      onSignIn(t)
    } catch (err) {
      setError(
        err instanceof Error && err.message === 'UNAUTHORIZED'
          ? 'That token is not right.'
          : 'Could not reach the API.',
      )
      setBusy(false)
    }
  }

  return (
    <div className="admin-gate">
      <form className="gate-card" onSubmit={submit}>
        <h1>Inbox</h1>
        <p>Private. Enter the admin token to continue.</p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="admin token"
          autoComplete="off"
          autoFocus
          aria-label="Admin token"
        />
        {error && <span className="gate-error">{error}</span>}
        <button type="submit" disabled={busy || !value.trim()}>
          {busy ? 'checking…' : 'unlock'}
        </button>
      </form>
    </div>
  )
}

type Filter = 'all' | 'unread'

function Inbox({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [unread, setUnread] = useState(0)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const fetchMessages = useCallback(
    () => api<{ messages: Message[]; unread: number }>('/admin/messages', token),
    [token],
  )

  const apply = useCallback((data: { messages: Message[]; unread: number }) => {
    setMessages(data.messages)
    setUnread(data.unread)
    setState('ready')
  }, [])

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof Error && err.message === 'UNAUTHORIZED') {
        onSignOut()
        return
      }
      setError(err instanceof Error ? err.message : 'Failed to load')
      setState('error')
    },
    [onSignOut],
  )

  // Load on mount, and drop the result if the component went away first — a
  // late response must not repopulate the list after signing out.
  useEffect(() => {
    let active = true
    fetchMessages()
      .then((data) => active && apply(data))
      .catch((err) => active && handleError(err))
    return () => {
      active = false
    }
  }, [fetchMessages, apply, handleError])

  const load = useCallback(
    () => fetchMessages().then(apply).catch(handleError),
    [fetchMessages, apply, handleError],
  )

  const markRead = async (id: number, read: boolean) => {
    // Optimistic — the list should not flicker while a PATCH round-trips.
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, read } : x)))
    try {
      const r = await api<{ unread: number }>(`/admin/messages/${id}/read`, token, {
        method: 'PATCH',
        body: JSON.stringify({ read }),
      })
      setUnread(r.unread)
    } catch {
      void load()
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this message? This cannot be undone.')) return
    const previous = messages
    setMessages((m) => m.filter((x) => x.id !== id))
    if (selected === id) setSelected(null)
    try {
      const r = await api<{ unread: number }>(`/admin/messages/${id}`, token, { method: 'DELETE' })
      setUnread(r.unread)
    } catch {
      setMessages(previous)
    }
  }

  const q = query.trim().toLowerCase()
  const visible = messages.filter((m) => {
    if (filter === 'unread' && m.read) return false
    if (!q) return true
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    )
  })

  const open = messages.find((m) => m.id === selected) ?? null

  return (
    <div className="admin">
      <header className="admin-bar">
        <span className="admin-title">
          <MailIcon size={16} /> Inbox
          {unread > 0 && <span className="admin-badge">{unread}</span>}
        </span>
        <span className="admin-search">
          <SearchIcon size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages…"
            aria-label="Search messages"
          />
        </span>
        <span className="admin-filters" role="tablist">
          <button
            role="tab"
            aria-selected={filter === 'all'}
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            all ({messages.length})
          </button>
          <button
            role="tab"
            aria-selected={filter === 'unread'}
            className={filter === 'unread' ? 'active' : ''}
            onClick={() => setFilter('unread')}
          >
            unread ({unread})
          </button>
        </span>
        <button className="admin-ghost" onClick={() => void load()}>
          refresh
        </button>
        <button className="admin-ghost" onClick={onSignOut}>
          lock
        </button>
      </header>

      {state === 'loading' && <p className="admin-note">Loading…</p>}
      {state === 'error' && <p className="admin-note error">{error}</p>}

      {state === 'ready' && (
        <div className="admin-split">
          <ul className="msg-list">
            {visible.length === 0 && (
              <li className="msg-empty">
                {messages.length === 0
                  ? 'No messages yet.'
                  : 'Nothing matches that filter.'}
              </li>
            )}
            {visible.map((m) => (
              <li key={m.id}>
                <button
                  className={`msg-row${m.id === selected ? ' active' : ''}${m.read ? '' : ' unread'}`}
                  onClick={() => {
                    setSelected(m.id)
                    if (!m.read) void markRead(m.id, true)
                  }}
                >
                  <span className="msg-row-top">
                    <strong>{m.name}</strong>
                    <time dateTime={m.createdAt}>{formatDate(m.createdAt)}</time>
                  </span>
                  <span className="msg-row-email">{m.email}</span>
                  <span className="msg-row-preview">{m.message}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="msg-detail">
            {open ? (
              <MessageDetail
                message={open}
                onToggleRead={() => void markRead(open.id, !open.read)}
                onDelete={() => void remove(open.id)}
              />
            ) : (
              <p className="admin-note">Select a message.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MessageDetail({
  message: m,
  onToggleRead,
  onDelete,
}: {
  message: Message
  onToggleRead: () => void
  onDelete: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(m.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the address is on screen anyway */
    }
  }

  const replyHref = `mailto:${m.email}?subject=${encodeURIComponent(
    `Re: your message via ${resume.name.split(' ')[0].toLowerCase()}.xyz`,
  )}`

  return (
    <article className="detail">
      <header>
        <h2>{m.name}</h2>
        <a href={`mailto:${m.email}`}>{m.email}</a>
        <time dateTime={m.createdAt}>{formatFull(m.createdAt)}</time>
      </header>

      <p className="detail-body">{m.message}</p>

      <div className="detail-actions">
        <a className="admin-solid" href={replyHref}>
          reply <ArrowUpRightIcon size={13} />
        </a>
        <button className="admin-ghost" onClick={copy}>
          {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
          {copied ? 'copied' : 'copy address'}
        </button>
        <button className="admin-ghost" onClick={onToggleRead}>
          mark {m.read ? 'unread' : 'read'}
        </button>
        <button className="admin-ghost danger" onClick={onDelete}>
          <CloseIcon size={13} /> delete
        </button>
      </div>

      <footer className="detail-meta">
        <span>IP {m.ip ?? 'unknown'}</span>
        {m.userAgent && <span title={m.userAgent}>{m.userAgent}</span>}
      </footer>
    </article>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
