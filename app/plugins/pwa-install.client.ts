export default defineNuxtPlugin(() => {
  const deferredPrompt = useState<any>('pwa_deferred_prompt', () => null)
  const isInstalled = useState<boolean>('pwa_is_installed', () => false)

  if (typeof window !== 'undefined') {
    // 1. Détection si l'application tourne déjà en mode PWA installée
    const checkIsInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIosStandalone = (window.navigator as any).standalone === true
      const isAndroidTwa = document.referrer.startsWith('android-app://')
      return isStandalone || isIosStandalone || isAndroidTwa
    }

    isInstalled.value = checkIsInstalled()

    // 2. Écoute de l'événement natif avant l'invite d'installation
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault()
      deferredPrompt.value = e
    })

    // 3. Écoute de l'événement une fois l'application installée avec succès
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      deferredPrompt.value = null
    })

    // 4. Écoute des changements de display-mode
    try {
      window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
        isInstalled.value = e.matches
      })
    } catch {
      // Ignorer sur les anciens navigateurs ne supportant pas addEventListener sur matchMedia
    }
  }
})
