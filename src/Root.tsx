import { Suspense, lazy } from 'react'
import App from './App'

// The private inbox. Split into its own chunk and only reached by pathname, so
// nothing about it ships to someone visiting the portfolio.
const AdminApp = lazy(() => import('./admin/AdminApp'))

/** The whole routing story: one private path, everything else is the
 *  portfolio. The site itself uses hash links (`#projects/doran`) so it can be
 *  hosted statically — this is the only real path, and nginx's SPA fallback
 *  already serves index.html for it. */
export default function Root() {
  const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin'

  if (!isAdmin) return <App />

  // index.html ships one static <meta name="robots"> for the whole build, and
  // it says "index" because the portfolio is the page that matters. /admin
  // inherits it, so flip it here. robots.txt and nginx's X-Robots-Tag already
  // cover the crawlers that never run JS; this catches the ones that do.
  document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, nofollow')

  return (
    <Suspense fallback={null}>
      <AdminApp />
    </Suspense>
  )
}
