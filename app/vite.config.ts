import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Publicado em https://acbranco21.github.io/simuladinho/
  base: '/simuladinho/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Simuladinho',
        short_name: 'Simuladinho',
        description: 'Treino gamificado para provas de bolsa',
        lang: 'pt-BR',
        start_url: '/simuladinho/',
        scope: '/simuladinho/',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#F4F6FB',
        theme_color: '#2F6FED',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
