import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "pwa-icon-512.png", "pwa-icon-192.png"],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,json}"],
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            // Supabase REST endpoints: cache for offline reads with quick fallback
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-rest-cache",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Supabase Storage (e.g. crop diagnoses photos, field photos)
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-storage-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // OpenStreetMap, CartoDB and ArcGIS Satellite Tiles for offline field geocoding & mapping
            urlPattern: /^https:\/\/(?:[a-c]\.tile\.openstreetmap\.org|[a-d]\.basemaps\.cartocdn\.com|server\.arcgisonline\.com)\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "map-tiles-cache",
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Google Fonts & Static CDNs
            urlPattern: /^https:\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net)\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "static-cdn-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: "Koobnaaba - Gestion Agricole",
        short_name: "Koobnaaba",
        description: "Plateforme de gestion agricole intelligente pour l'Afrique",
        theme_color: "#2d6a4f",
        background_color: "#faf8f5",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
