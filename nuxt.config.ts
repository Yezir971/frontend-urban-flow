// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/test-utils/module',
    '@nuxt/ui',
    '@nuxtjs/leaflet',
    '@balalarast/vue-bottom-sheet/nuxt',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      urlPhoton: "empty URL_PHOTON",
      urlBaseOtp: "empty urlBaseOtp",
      urlOtp: "empty urlOtp",
    }
  },
  nitro: {
    routeRules: {
      '/otp-api/**': {
        proxy: `http://localhost:8080/**`
      }
    }
  }
})