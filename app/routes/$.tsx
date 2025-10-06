import { type LoaderFunctionArgs } from "react-router";

// Catch-all route for unmatched URLs
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // Handle Chrome DevTools and well-known requests silently
  if (
    url.pathname.startsWith("/.well-known/") ||
    url.pathname.includes("devtools")
  ) {
    return new Response(null, { status: 204 });
  }

  // For other 404s, return a 404 response
  throw new Response("Not Found", { status: 404 });
}

export default function CatchAll() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "system-ui, sans-serif",
      background: "#0b0b0d",
      color: "#fff",
    }}>
      <h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
      <p style={{ fontSize: "1.5rem", opacity: 0.7 }}>Page not found</p>
      <a
        href="/"
        style={{
          marginTop: "2rem",
          padding: "0.75rem 1.5rem",
          background: "#667eea",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "8px",
          transition: "background 0.3s",
        }}
      >
        Go Home
      </a>
    </div>
  );
}
