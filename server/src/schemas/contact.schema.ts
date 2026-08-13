import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please tell me your name.').max(100),
  email: z.string().trim().email('That email address does not look right.').max(200),
  message: z
    .string()
    .trim()
    .min(10, 'A sentence or two about what you need, please.')
    .max(5000, 'That is longer than this form can take — email me directly instead.'),
  /** Honeypot. Real people never see this field, so anything in it is a bot.
   *  Accepted here and rejected in the controller, so the bot gets a 200 and
   *  no signal that it was caught. */
  company: z.string().max(200).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
