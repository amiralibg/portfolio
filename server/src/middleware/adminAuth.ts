import { timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { config } from '../config'

/** Constant-time compare that also tolerates length differences — comparing
 *  buffers of different lengths throws, and returning early on a length
 *  mismatch would leak the token's length through timing. */
function tokenMatches(given: string): boolean {
  const a = Buffer.from(given)
  const b = Buffer.from(config.adminToken)
  if (a.length !== b.length) {
    // Still do the work, so a wrong-length guess costs the same as a
    // right-length one.
    timingSafeEqual(b, b)
    return false
  }
  return timingSafeEqual(a, b)
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token || !tokenMatches(token)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}
