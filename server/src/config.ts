import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    // Fail at boot, not on the first visitor who tries to reach out.
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const botToken = process.env.TELEGRAM_BOT_TOKEN
const chatId = process.env.TELEGRAM_CHAT_ID

/** Notifications are optional. Messages are stored and readable at /admin
 *  regardless — this only controls whether your phone buzzes about it. Keeping
 *  it optional also means `npm run dev` needs no credentials at all. */
const telegram = botToken && chatId ? { token: botToken, chatId } : null

export const config = {
  port: Number(process.env.PORT ?? 8000),
  /** SQLite file. Must live on a mounted volume, or redeploys wipe the inbox. */
  dbFile: process.env.DB_FILE ?? './data/messages.db',
  /** Bearer token for /api/admin/*. Generate with `openssl rand -base64 48`. */
  adminToken: required('ADMIN_TOKEN'),
  /** No trailing slashes — these are compared against the Origin header verbatim. */
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean),
  /** Only used to put a link to the inbox in the notification. */
  siteUrl: process.env.SITE_URL ?? '',
  telegram,
}

export const notifyEnabled = telegram !== null
