import { config, notifyEnabled } from '../config'
import type { ContactInput } from '../schemas/contact.schema'

/** Telegram renders a small HTML subset; anything else in user text has to be
 *  escaped or the message silently fails to send. */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Ping Amirali's phone that someone got in touch.
 *
 *  Best-effort by design: the message is already saved and readable at /admin
 *  before this runs, so a rate limit or a dropped connection to Telegram must
 *  never turn into a failed submission for the visitor. */
export async function notifyNewMessage(input: ContactInput): Promise<void> {
  if (!config.telegram) {
    console.warn('[notify] Telegram not configured — message stored, no ping sent')
    return
  }

  const lines = [
    '<b>New portfolio message</b>',
    '',
    `<b>From:</b> ${escapeHtml(input.name)}`,
    `<b>Email:</b> ${escapeHtml(input.email)}`,
    '',
    escapeHtml(input.message),
  ]
  if (config.siteUrl) lines.push('', `${config.siteUrl.replace(/\/$/, '')}/admin`)

  const res = await fetch(`https://api.telegram.org/bot${config.telegram.token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: config.telegram.chatId,
      text: lines.join('\n'),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
    // Without this a hung connection would keep the request handler alive.
    signal: AbortSignal.timeout(10_000),
  })

  if (!res.ok) {
    // Telegram puts the real reason in the body; the status alone is useless.
    const body = await res.text().catch(() => '')
    throw new Error(`Telegram responded ${res.status}: ${body.slice(0, 200)}`)
  }
}

/** Called at boot so a bad token shows up in the deploy log immediately,
 *  rather than the first time someone actually writes to you. */
export async function verifyNotifier(): Promise<void> {
  if (!config.telegram) {
    console.warn(
      '[notify] Telegram not configured (set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID). ' +
        'Messages are still stored and readable at /admin — you just will not be pinged.',
    )
    return
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${config.telegram.token}/getMe`, {
      signal: AbortSignal.timeout(10_000),
    })
    const body = (await res.json()) as { ok: boolean; result?: { username?: string } }
    if (!body.ok) throw new Error('token rejected')
    console.log(`[notify] Telegram ready — notifying via @${body.result?.username ?? 'bot'}`)
  } catch (err) {
    console.error('[notify] Telegram check failed — pings will not arrive:', err)
  }
}

export { notifyEnabled }
