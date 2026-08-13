import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { submitContact } from '../controllers/contact.controller'
import { contactSchema } from '../schemas/contact.schema'
import { validate } from '../middleware/validate'

/** Nobody legitimately sends five messages in fifteen minutes. Generous enough
 *  that a real person who mistypes their email never notices it. */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many messages from this address. Try again in a little while.' },
})

export const contactRouter = Router()

contactRouter.post('/', contactLimiter, validate(contactSchema), submitContact)
