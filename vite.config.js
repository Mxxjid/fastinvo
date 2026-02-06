import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // ۱. اضافه کردن base برای مسیردهی درست در سرور
  base: '/', 
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // ۲. فعال کردن PWA در حالت توسعه برای تست راحت‌تر (اختیاری)
      devOptions: {
        enabled: true
      },
      // ۳. لیست کردن دارایی‌هایی که باید کش شوند
      includeAssets: ['iconb.png', ],
      manifest: {
        name: 'FastInvo - Professional Invoice Maker',
        short_name: 'FastInvo',
        description: 'Rapid PWA for creating and exporting invoices',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'iconb.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'iconb.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  // ۴. اطمینان از خروجی درست فایل‌ها
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})