import { useRef, useState } from 'react'
import { resume } from '../data/resume'
import { CheckIcon, SendIcon } from './icons'

/** Where the message goes. Same-origin `/api/contact` by default so a reverse
 *  proxy can route it; set VITE_CONTACT_API for a separately-hosted API.
 *
 *  Truthiness, not `??`: the Docker build declares `ARG VITE_CONTACT_API=""`,
 *  so when it isn't supplied the value is an empty string rather than
 *  undefined — and `?? ` would happily leave it empty, posting the form to the
 *  current page. */
const ENDPOINT = import.meta.env.VITE_CONTACT_API || '/api/contact'

type Status = 'idle' | 'sending' | 'sent' | 'error'

interface Fields {
  name: string
  email: string
  message: string
}

const EMPTY: Fields = { name: '', email: '', message: '' }

// Deliberately loose: the server does the authoritative check, and this only
// exists to catch typos before someone waits on a round trip.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {}
  if (!f.name.trim()) errors.name = 'Your name, so I know who I’m replying to.'
  if (!f.email.trim()) errors.email = 'I need an address to reply to.'
  else if (!EMAIL_RE.test(f.email.trim())) errors.email = 'That address looks off — check it?'
  if (f.message.trim().length < 10) errors.message = 'A sentence or two about what you need.'
  return errors
}

export function ContactForm() {
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState<string | null>(null)
  // Bots fill every field they find; humans never see this one.
  const honeypot = useRef<HTMLInputElement | null>(null)

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }))
    // Clear the error as soon as they start fixing it, not on the next submit.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return

    const found = validate(fields)
    setErrors(found)
    if (Object.keys(found).length) return

    setStatus('sending')
    setServerError(null)
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, company: honeypot.current?.value ?? '' }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `Server responded ${res.status}`)
      }
      setStatus('sent')
      setFields(EMPTY)
    } catch (err) {
      setStatus('error')
      setServerError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="contact-done" role="status">
        <span className="contact-done-mark" aria-hidden>
          <CheckIcon size={20} />
        </span>
        <strong>Message sent.</strong>
        <p>
          Thanks — I read everything and reply within 24 hours. If it’s urgent,{' '}
          <a href={`mailto:${resume.email}`}>email me directly</a>.
        </p>
        <button type="button" className="ghost-btn" onClick={() => setStatus('idle')}>
          send another
        </button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="field-row">
        <Field label="Name" error={errors.name}>
          <input
            type="text"
            value={fields.name}
            onChange={set('name')}
            placeholder="Ada Lovelace"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={fields.email}
            onChange={set('email')}
            placeholder="ada@company.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>
      </div>

      <Field label="Message" error={errors.message}>
        <textarea
          rows={4}
          value={fields.message}
          onChange={set('message')}
          placeholder="What are you building, and what do you need from me?"
          aria-invalid={Boolean(errors.message)}
        />
      </Field>

      {/* Spam trap — hidden from people and from screen readers alike. */}
      <input
        ref={honeypot}
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hp-field"
      />

      <div className="contact-actions">
        <button type="submit" className="solid-btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'sending…' : <>send message <SendIcon size={14} /></>}
        </button>
        <span className="contact-alt">
          or just email <a href={`mailto:${resume.email}`}>{resume.email}</a>
        </span>
      </div>

      {status === 'error' && (
        <p className="contact-error" role="alert">
          Couldn’t send that{serverError ? ` — ${serverError}` : ''}. Please{' '}
          <a href={`mailto:${resume.email}`}>email me directly</a> instead.
        </p>
      )}
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className={`field${error ? ' has-error' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}
