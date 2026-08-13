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

  return (
    <Suspense fallback={null}>
      <AdminApp />
    </Suspense>
  )
}
