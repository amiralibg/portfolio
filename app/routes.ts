import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("*", "routes/$.tsx"), // Catch-all route for 404s and DevTools requests
] satisfies RouteConfig;
