// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  app: {
    head: {
      htmlAttrs: {
        lang: 'fr',
        dir: 'ltr'
      },
      title: 'Urban Flow — Éco-mobilité & Itinéraires à Lyon',
      titleTemplate: '%s · Urban Flow',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        { name: 'format-detection', content: 'telephone=no' },
        {
          name: 'description',
          content: "Planifiez vos trajets multimodaux à Lyon : métro, bus, tramway, vélo et marche. Mesurez vos économies de CO₂ en temps réel et suivez vos parcours avec Urban Flow."
        },
        {
          name: 'keywords',
          content: 'éco-mobilité Lyon, transports en commun Lyon, TCL, itinéraires Lyon, CO2 économisé, vélo Lyon, multimodal Lyon, calcul itinéraire, mobilité douce'
        },
        { name: 'author', content: 'Urban Flow — Métropole de Lyon' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'theme-color', content: '#104E35', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0B1311', media: '(prefers-color-scheme: dark)' },
        
        // Open Graph / Facebook
        { property: 'og:site_name', content: 'Urban Flow Lyon' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:title', content: 'Urban Flow — Éco-mobilité & Itinéraires à Lyon' },
        {
          property: 'og:description',
          content: "Calculateur d'itinéraires éco-responsables à Lyon. Comparez les modes de transport doux et réduisez vos émissions de CO₂ au quotidien."
        },
        { property: 'og:url', content: 'https://urban-flow-lyon.fr' },
        { property: 'og:image', content: 'https://urban-flow-lyon.fr/img/pwa/screen-desktop.png' },
        { property: 'og:image:width', content: '1280' },
        { property: 'og:image:height', content: '720' },
        { property: 'og:image:alt', content: "Aperçu de l'application Urban Flow Lyon" },

        // Twitter Cards
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Urban Flow — Éco-mobilité & Itinéraires à Lyon' },
        {
          name: 'twitter:description',
          content: "Calculateur d'itinéraires éco-responsables à Lyon. Comparez les modes de transport doux et réduisez vos émissions de CO₂ au quotidien."
        },
        { name: 'twitter:image', content: 'https://urban-flow-lyon.fr/img/pwa/screen-desktop.png' },
        { name: 'twitter:image:alt', content: "Aperçu de l'application Urban Flow Lyon" }
      ],
      link: [
        { rel: 'canonical', href: 'https://urban-flow-lyon.fr' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/img/logo.svg' },
        { rel: 'apple-touch-icon', href: '/img/pwa/icons/pwa-192x192.png' }
      ]
    }
  },

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
      name: 'Urban Flow — Éco-mobilité Lyon',
      short_name: 'UrbanFlow',
      description: 'Application de mobilité urbaine multimodale et calcul de CO2 sur Lyon',
      theme_color: '#104E35',
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