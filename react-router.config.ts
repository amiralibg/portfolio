import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,

  // Build optimizations
  buildEnd: async ({ viteConfig }) => {
    // Additional build configurations can go here
  },
} satisfies Config;
