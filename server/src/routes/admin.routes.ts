import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAdmin } from '../middleware/adminAuth'
import {
  countUnread,
  deleteMessage,
  listMessages,
  setRead,
} from '../services/message.service'

/** The token is the only thing guarding the inbox, so make guessing expensive.
 *  Counts every admin request, not just failures — a script trying tokens has
 *  no way to avoid it. */
const adminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
})

export const adminRouter = Router()

adminRouter.use(adminLimiter, requireAdmin)

/** Cheap endpoint for the login screen to validate a token against. */
adminRouter.get('/session', (_req, res) => {
  res.json({ ok: true, unread: countUnread() })
})

adminRouter.get('/messages', (_req, res) => {
  const rows = listMessages()
  res.json({
    unread: countUnread(),
    messages: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      message: r.message,
      ip: r.ip,
      userAgent: r.user_agent,
      read: Boolean(r.read),
      // Stored as a UTC datetime string; hand the client real ISO so it can
      // localise without guessing the zone.
      createdAt: `${r.created_at.replace(' ', 'T')}Z`,
    })),
  })
})

adminRouter.patch('/messages/:id/read', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Bad id' })
    return
  }
  const read = req.body?.read !== false
  if (!setRead(id, read)) {
    res.status(404).json({ error: 'No such message' })
    return
  }
  res.json({ ok: true, unread: countUnread() })
})

adminRouter.delete('/messages/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Bad id' })
    return
  }
  if (!deleteMessage(id)) {
    res.status(404).json({ error: 'No such message' })
    return
  }
  res.json({ ok: true, unread: countUnread() })
})
