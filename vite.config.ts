import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],

  build: {
    // Increase chunk size warning limit to 1500 kB (Three.js is large)
    chunkSizeWarningLimit: 1500,

    // Source map configuration (disabled for production to avoid warnings)
    sourcemap: false,

    // Minification with esbuild (faster than terser)
    minify: 'esbuild',
    target: 'es2020',

    // Optimize rollup
    rollupOptions: {
      output: {
        // Automatic chunk splitting based on module imports
        manualChunks(id) {
          // Split vendor chunks intelligently
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
          }
        },
      },
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['framer-motion'],
  },
});
