# Contact API

The backend behind the portfolio's contact form: validate a message, store it,
ping your phone, and refuse everything else. It also serves the private inbox
that `/admin` on the site reads from.

```
POST   /api/contact                  { name, email, message }  -> { ok: true }
GET    /health                                                 -> { status: "ok" }

# all of these require:  Authorization: Bearer $ADMIN_TOKEN
GET    /api/admin/session                                      -> { ok, unread }
GET    /api/admin/messages                                     -> { unread, messages[] }
PATCH  /api/admin/messages/:id/read  { read: boolean }          -> { ok, unread }
DELETE /api/admin/messages/:id                                 -> { ok, unread }
```

Messages are stored **before** the notification is attempted, so a broken or
unreachable Telegram never loses one — it's in the inbox at `/admin` either way.

## Run it locally

From the **repo root**, not this directory:

```sh
npm run setup:api    # once — installs server deps
npm run dev:all      # web on :5173, api on :8000, one Ctrl-C stops both
```

Vite proxies `/api` straight to the API (see `vite.config.ts`), so the frontend
talks to it same-origin exactly like nginx does in production. Nothing to
configure, and no CORS in the loop.

`server/.env` already exists with a generated `ADMIN_TOKEN`. Read it with:

```sh
grep ADMIN_TOKEN server/.env
```

**Notifications are optional.** With nothing configured the API still boots,
still stores every message, and `/admin` still works — it just logs a warning
instead of pinging.

## Notifications (Telegram)

Storage is the delivery mechanism; this only decides how you find out a message
arrived. Telegram rather than email because it needs no app password, can't
land in a spam folder, pushes straight to your phone, and works from a VPS in
places where Gmail's SMTP ports don't.

Setup takes about a minute:

1. Message [@BotFather](https://t.me/BotFather), send `/newbot`, follow the
   prompts. It gives you a token like `123456789:AAE…`.
2. Send your new bot any message — a bot cannot start a conversation with you.
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy
   `result[0].message.chat.id`.

Put both in `.env` as `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Set
`SITE_URL` too and each notification ends with a link straight to your inbox.

The token is checked once at boot and the result logged, so a bad one shows up
in the deploy log rather than the first time someone writes to you. If Telegram
is down or rate-limiting, the submission still succeeds — the failure is logged
and the message sits in `/admin` waiting.

## The /admin inbox

The site serves a private inbox at `amiralibg.xyz/admin` — a lazy-loaded chunk,
never linked from anywhere, and tagged `noindex`. It asks for `ADMIN_TOKEN`,
keeps it in `sessionStorage` (closing the tab logs you out), and from there
lists every message with read/unread state, search, reply, and delete.

Generate the token properly:

```sh
openssl rand -base64 48
```

Anyone holding that string can read every message you have ever received, so
treat it like a password. It is compared server-side in constant time, and
admin requests are rate-limited to 60 per 10 minutes to make guessing painful.

## Deploying (Dokploy)

Build from the `server/` directory using its `Dockerfile`. Set every variable
from `.env.example` in Dokploy's environment settings — the app throws on boot
if any required one is missing, so a bad config fails loudly in the deploy log
rather than quietly at the first real message.

Health check path is `/health`, port `8000`.

**Mount a volume at `/app/data`.** The SQLite file lives there; without a
volume, every redeploy starts with an empty inbox. Back it up by copying that
one file off the VPS.

`better-sqlite3` is a native module, and Alpine is musl, so the Dockerfile
compiles it in the build stage (`python3 make g++`) and ships only the compiled
binding to the runtime image. Nothing to configure — just expect the first
build to take a couple of minutes.

Then connect the frontend, either way:

- **Same origin** — put both containers on one network and uncomment the
  `/api/` proxy block in the root `nginx.conf`. No CORS involved.
- **Separate domain** — deploy at e.g. `api.amiralibg.xyz`, build the frontend
  with `VITE_CONTACT_API=https://api.amiralibg.xyz/api/contact`, and list the
  site's origin in `CORS_ORIGINS`.

## What stops spam

Three cheap layers, no captcha and no third-party script:

- **Honeypot** — a `company` field hidden off-screen. Bots fill it; people never
  see it. A tripped honeypot gets a normal `200 {ok:true}` so the bot learns
  nothing and doesn't retry without the field.
- **Rate limit** — 5 messages per IP per 15 minutes.
- **Schema validation** — length bounds on every field, 32kb body cap.

If spam ever does get through, the next step is a Cloudflare Turnstile widget
rather than tightening these further.

## Notes

- `trust proxy` is set to 1 hop. Behind Dokploy's reverse proxy that's what
  makes the rate limiter see real client IPs instead of the proxy's.
- The Telegram token is verified once at boot and the result logged, so a bad
  one shows up in the deploy log immediately.
- Message text is HTML-escaped before it reaches Telegram — it renders a small
  HTML subset, and unescaped `<` from a visitor makes the send fail silently.
- Notification calls carry a 10s timeout, so an unresponsive Telegram can't pin
  a request handler open.
- No mail server, no SMTP ports, no third-party form service. Dependencies are
  express, cors, helmet, zod, better-sqlite3, express-rate-limit, dotenv.
