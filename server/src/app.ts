import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config'
import { contactRouter } from './routes/contact.routes'
import { adminRouter } from './routes/admin.routes'
import { errorHandler, notFound } from './middleware/error'
import { verifyNotifier } from './services/notify.service'

const app = express()

app.use(helmet())
// Behind Dokploy's proxy, so trust one hop — otherwise every request looks
// like it comes from the proxy and the rate limiter keys them all together.
app.set('trust proxy', 1)

const isAllowedOrigin = (origin: string) =>
  config.corsOrigins.includes(origin.replace(/\/$/, ''))

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: curl, health checks, server-to-server. Not a browser,
      // so there is no cross-origin risk to guard against.
      // Never pass an Error here — cors would surface it as a 500, and a
      // request from the wrong site is a client error, not a server fault.
      callback(null, !origin || isAllowedOrigin(origin))
    },
    // PATCH/DELETE are the admin inbox marking and deleting messages. Omitting
    // them makes the browser preflight fail, and the UI silently reverts every
    // change it just made.
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Missing CORS headers only stop a browser from *reading* the response — the
// request still ran. Reject outright so an unapproved site can't use this to
// send mail.
app.use((req, res, next) => {
  const origin = req.get('origin')
  if (origin && !isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Origin not allowed.' })
    return
  }
  next()
})

// A contact form has no reason to accept anything larger.
app.use(express.json({ limit: '32kb' }))

/** Docker HEALTHCHECK and Dokploy both poll this. */
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/contact', contactRouter)
app.use('/api/admin', adminRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`[server] contact API listening on :${config.port}`)
  console.log(`[server] allowed origins: ${config.corsOrigins.join(', ') || '(none configured)'}`)
  void verifyNotifier()
})

export default app
