import type { NextFunction, Request, Response } from 'express'

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' })
}

/** Central error handler — controllers call next(err) and never invent their
 *  own 500 responses. Details are logged, never returned: an SMTP failure can
 *  carry credentials in its message. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // Express identifies the error handler by arity, so `next` must stay.
  _next: NextFunction,
) {
  console.error('[error]', err)
  if (res.headersSent) return
  res.status(500).json({ error: 'Something went wrong on my end. Please email me directly.' })
}
