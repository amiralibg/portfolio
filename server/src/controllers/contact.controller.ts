import type { NextFunction, Request, Response } from 'express'
import type { ContactInput } from '../schemas/contact.schema'
import { notifyNewMessage } from '../services/notify.service'
import { saveMessage } from '../services/message.service'

export async function submitContact(req: Request, res: Response, next: NextFunction) {
  const input = req.body as ContactInput

  // Honeypot tripped. Answer exactly like a success so the bot has nothing to
  // learn and no reason to retry with the field removed.
  if (input.company) {
    console.warn('[contact] honeypot tripped, dropping submission')
    res.status(200).json({ ok: true })
    return
  }

  try {
    // Store first. If this fails the message is genuinely lost, so it's the
    // only step allowed to fail the request.
    saveMessage({
      name: input.name,
      email: input.email,
      message: input.message,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })
  } catch (err) {
    next(err)
    return
  }

  // The ping is a convenience on top of storage. Telegram being unreachable
  // must not tell the visitor their message was lost — it is safely in the
  // inbox at /admin either way.
  try {
    await notifyNewMessage(input)
  } catch (err) {
    console.error('[contact] saved but notification failed:', err)
  }

  res.status(200).json({ ok: true })
}
