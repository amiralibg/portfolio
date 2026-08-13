import type { NextFunction, Request, Response } from 'express'
import type { ZodTypeAny } from 'zod'

/** Validate `req.body` at the boundary and replace it with the parsed result,
 *  so controllers only ever see well-formed, typed data. */
export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const fields: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || '_'
        // First message per field — the rest are noise to a form UI.
        if (!fields[key]) fields[key] = issue.message
      }
      res.status(400).json({ error: 'Please check the form and try again.', fields })
      return
    }
    req.body = result.data
    next()
  }
}
