import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves a project site from https://<user>.github.io/<repo>/,
// not the domain root, so that build needs every asset URL prefixed with
// "/<repo>/". Netlify (and dev mode) serve from the domain root, so they
// need base "/" instead, run `DEPLOY_TARGET=root npm run build` for those.
// Deploying the wrong one is the classic "blank page" bug: assets 404
// silently because they're looked for under the wrong path.
// If you rename the GitHub repo, update BASE_PATH to match.
const BASE_PATH = '/sharedlove-demo/'
const useRootBase = process.env.DEPLOY_TARGET === 'root'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' && !useRootBase ? BASE_PATH : '/',
  server: {
    // --host alone isn't always enough on newer Vite: it still checks the
    // Host header against an allowlist and can silently refuse phones that
    // hit it by LAN IP. allowedHosts: true turns that check off since this
    // never leaves a private wifi/hotspot for a booth demo.
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'SharedLove: Secondhand, Verified',
        short_name: 'SharedLove',
        description: 'Secondhand clothing marketplace with AI condition grading and open-box delivery.',
        theme_color: '#059669',
        background_color: '#ecfdf5',
        display: 'standalone',
        // Relative, not absolute, so the installed PWA opens correctly
        // whether it's served from the domain root (dev/preview) or from
        // /sharedlove-demo/ (GitHub Pages) — an absolute "/" would send a
        // Pages-installed PWA to the wrong path.
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
}))
