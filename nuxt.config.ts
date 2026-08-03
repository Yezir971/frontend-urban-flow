// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  supabase: {
    redirect: false
  },
  modules: [
    '@nuxt/test-utils/module',
    '@nuxt/ui',
    '@nuxtjs/leaflet',
    '@balalarast/vue-bottom-sheet/nuxt',
    '@pinia/nuxt',
    '@nuxt/fonts',
    '@nuxtjs/supabase',
    ['@vite-pwa/nuxt', {
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      devOptions: {
        enabled: true,
        type: 'module',
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
        navigateFallback: '/',
        globPatterns: ['**/*.{js,css,html,png,svg,ico}']
      }
    }]
  ],
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' }
    ]
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      urlPhoton: "empty URL_PHOTON",
      urlBaseOtp: "empty urlBaseOtp",
      urlOtp: "empty urlOtp",
      urlBack: "empty urlGateway"
    }
  },
  pwa: {
    registerType: 'autoUpdate', // Met à jour l'app automatiquement en arrière-plan
    strategies: 'generateSW',
    // includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Fichiers à mettre en cache globalement

    devOptions: {
      enabled: true,
      type: 'module',
    },
    
    manifest: {
      name: 'Urban Flow',
      short_name: 'UrbanFlow',
      description: 'Application de mobilité urbaine sur Lyon',
      theme_color: '#95D4B3',
      background_color: '#F8FAF9',
      display: 'standalone',
      start_url: '/', // Point d'entrée de l'application
      
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
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    }
  }
})