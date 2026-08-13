# Deploying to Dokploy

The repo now produces **two** images, so the single Application you have today
becomes two:

| What | Build context | Dockerfile | Port |
|---|---|---|---|
| Portfolio (static, nginx) | repo root | `Dockerfile` | 80 |
| Contact API (Express) | `server/` | `server/Dockerfile` | 8000 |

Your existing Application is the first one and mostly stays as it is. Below is
what changes, and what to add.

---

## 1. Existing Application (the portfolio)

Two things to set, then redeploy.

**Build arg** — Vite inlines `VITE_*` at *build* time, so a normal Dokploy
environment variable will not reach the bundle. It has to be a **build
argument**:

```
VITE_CONTACT_API=https://api.amiralibg.xyz/api/contact
```

In Dokploy this lives under the Application's build settings as a Docker build
arg, not under Environment. If you put it in Environment it will silently do
nothing and the contact form will post to the wrong place.

**Nothing else changes.** Same repo, same root Dockerfile, same domain.

> If you'd rather not use a subdomain, see [Same-origin instead](#same-origin-instead)
> at the bottom — then you leave this build arg empty.

---

## 2. New Application (the contact API)

Create a second Application pointing at the same repository.

**Build**
- Build path / context: `server`
- Dockerfile path: `server/Dockerfile`
- Build takes a couple of minutes the first time: `better-sqlite3` is a native
  module and Alpine is musl, so it compiles from source in the build stage.

**Domain**
- `api.amiralibg.xyz` → container port `8000`
- Add the DNS A record for that subdomain pointing at the VPS, and let Dokploy
  issue the certificate.

**Volume — do not skip this**
- Mount a persistent volume at `/app/data`.
- That's where the SQLite file lives. Without it, **every redeploy starts with
  an empty inbox** and past messages are gone for good.

**Environment**

```sh
PORT=8000
CORS_ORIGINS=https://amiralibg.xyz,https://www.amiralibg.xyz
DB_FILE=/app/data/messages.db
ADMIN_TOKEN=<paste the output of: openssl rand -base64 48>

# Optional — only decides whether your phone buzzes.
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
SITE_URL=https://amiralibg.xyz
```

Notes that will save you a debugging session:

- `CORS_ORIGINS` needs the **frontend's** origin, no trailing slash. Getting
  this wrong gives a `403 Origin not allowed` on submit.
- `DB_FILE` must point *inside* the mounted volume (`/app/data/...`), not the
  `./data/...` default.
- `ADMIN_TOKEN` is required — the API refuses to boot without it, on purpose.
  Generate a fresh one; do not reuse the local dev token.
- Health check path is `/health`, which returns `{"status":"ok"}`.

---

## 3. Verify, in this order

```sh
# API is alive
curl https://api.amiralibg.xyz/health
# -> {"status":"ok"}

# Auth works (use your real token)
curl https://api.amiralibg.xyz/api/admin/session -H "Authorization: Bearer $ADMIN_TOKEN"
# -> {"ok":true,"unread":0}

# Auth actually rejects
curl -i https://api.amiralibg.xyz/api/admin/session -H "Authorization: Bearer wrong"
# -> 401
```

Then submit the form on the live site and check `https://amiralibg.xyz/admin`.

**Confirm persistence before you trust it**: redeploy the API once and reload
`/admin`. If the message is still there, the volume is mounted correctly. If
it's gone, fix the volume now rather than after you lose a real enquiry.

---

## Same-origin instead

If you'd rather avoid a second domain and CORS entirely:

1. Leave the `VITE_CONTACT_API` build arg **empty** so the frontend posts to
   the relative `/api/contact`.
2. Uncomment the `location /api/` block in `nginx.conf` and set the service name
   Dokploy gave the API container.
3. Make sure both Applications share a Docker network.

The block uses Docker's embedded resolver with a variable upstream on purpose —
with a literal hostname, nginx resolves it once at boot and refuses to start if
the API is down, which would take the whole portfolio offline. The variable form
defers resolution to request time, so a dead API only breaks the contact form.

Trade-off: no CORS and no extra DNS, but the two containers are now coupled and
failures are a little harder to read. The subdomain setup above is easier to
debug, which is why it's the default.

---

## Rollback

Both Applications deploy from the same repo, so a bad frontend deploy doesn't
touch the API and vice versa. The API's data lives in the volume, not the image,
so rolling the API back to a previous deploy keeps every stored message.
