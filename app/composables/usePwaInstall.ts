export function usePwaInstall() {
  const deferredPrompt = useState<any>('pwa_deferred_prompt', () => null)
  const isInstalled = useState<boolean>('pwa_is_installed', () => false)
  const toast = useToast()

  // Détection en cours au montage
  const checkInstallStatus = () => {
    if (typeof window === 'undefined') return false
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIosStandalone = (window.navigator as any).standalone === true
    const isAndroidTwa = document.referrer.startsWith('android-app://')
    const installed = isStandalone || isIosStandalone || isAndroidTwa
    isInstalled.value = installed
    return installed
  }

  const isIos = computed(() => {
    if (typeof window === 'undefined') return false
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
  })

  async function installApp(): Promise<boolean> {
    if (isInstalled.value) {
      toast.add({
        title: 'Application déjà installée',
        description: 'Urban Flow est déjà installée sur votre appareil.',
        color: 'info',
        icon: 'i-lucide-check-circle',
      })
      return true
    }

    // 1. Si l'événement natif avant l'invite d'installation est disponible
    if (deferredPrompt.value) {
      try {
        await deferredPrompt.value.prompt()
        const choiceResult = await deferredPrompt.value.userChoice
        if (choiceResult.outcome === 'accepted') {
          isInstalled.value = true
          deferredPrompt.value = null
          toast.add({
            title: 'Installation réussie',
            description: 'Urban Flow a été ajoutée à votre écran d’accueil !',
            color: 'success',
            icon: 'i-lucide-sparkles',
          })
          return true
        } else {
          toast.add({
            title: 'Installation annulée',
            description: "Vous pourrez réinstaller l'application à tout moment.",
            color: 'neutral',
            icon: 'i-lucide-info',
          })
          return false
        }
      } catch (err) {
        console.error('Erreur lors de l’installation PWA:', err)
      }
    }

    // 2. Gestion spécifique iOS Safari
    if (isIos.value) {
      toast.add({
        title: 'Installer sur iOS',
        description:
          "Appuyez sur le bouton Partager ⎋ puis sélectionnez 'Sur l'écran d'accueil' ➕.",
        color: 'info',
        icon: 'i-lucide-share',
        timeout: 8000,
      })
      return false
    }

    // 3. Navigateurs Chromium ou autres sans prompt intercepté
    toast.add({
      title: 'Installer l’application',
      description:
        "Utilisez le menu de votre navigateur (trois points en haut à droite) et cliquez sur 'Installer l'application'.",
      color: 'info',
      icon: 'i-lucide-download',
      timeout: 6000,
    })
    return false
  }

  return {
    isInstalled,
    deferredPrompt,
    isIos,
    checkInstallStatus,
    installApp,
  }
}
