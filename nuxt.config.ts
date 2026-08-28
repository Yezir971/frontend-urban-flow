// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  supabase: {
    redirect: false,
    url: process.env.NUXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000',
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE3OTk1MzU2MDB9.ge0f37vJSKRW7so962e9rLJqHu6SgJYjhMx4uc9Bzgw',
  },
  nitro: {
    externals: {
      inline: [
        'vue',
        '@vue/server-renderer',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/shared',
        'vue-router'
      ]
    }
  },
  modules: [
    '@nuxt/test-utils/module',
    '@nuxt/ui',
    'nuxt-charts',
    '@nuxtjs/leaflet',
    '@balalarast/vue-bottom-sheet/nuxt',
    '@pinia/nuxt',
    '@nuxt/fonts',
    '@nuxtjs/supabase',
    '@vite-pwa/nuxt'
  ],
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' }
    ]
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      urlPhoton: process.env.URL_PHOTON || "https://photon.komoot.io",
      urlBaseOtp: process.env.URL_BASE_OTP || "http://localhost:8080",
      urlOtp: process.env.URL_OTP || "http://localhost:8080/otp/routers/default/plan",
      urlBack: process.env.NUXT_PUBLIC_URL_BACK || process.env.URL_BACK || "http://localhost:3002"
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    strategies: 'generateSW',
    devOptions: {
      enabled: true,
      type: 'module',
      suppressWarnings: true,
    },
    manifest: {
      name: 'Urban Flow',
      short_name: 'UrbanFlow',
      description: 'Application de mobilité urbaine sur Lyon',
      theme_color: '#95D4B3',
      background_color: '#F8FAF9',
      display: 'standalone',
      start_url: '/',
      screenshots: [
        {
          src: '/img/pwa/screen-desktop.png', 
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide',
          label: 'Application Desktop'
        },
        {
          src: '/img/pwa/screen-mobile.png', 
          sizes: '750x1334',
          type: 'image/png',
          form_factor: 'narrow',
          label: 'Application Mobile'
        }
      ],
      icons: [
        {
          src: '/img/pwa/icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/img/pwa/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    }
  }
})