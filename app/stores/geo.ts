import { defineStore } from 'pinia'

export const useGeoStore = defineStore('geo', () => {
  const lat = ref<number | null>(null)
  const lng = ref<number | null>(null)
  const accuracy = ref<number | null>(null)
  const error = ref<string | null>(null)
  const isTracking = ref(false)
  const isEnabled = ref(false)
  let watchId: number | null = null

  // Initialisation au chargement côté client
  function initGeolocation() {
    if (typeof window === 'undefined') return
    const storedPref = localStorage.getItem('urbanflow_geolocation_enabled')
    if (storedPref === 'true') {
      enableGeolocation(false) // Tente de reprendre sans toast agressif
    }
  }

  function enableGeolocation(notifyError = true): Promise<{ success: boolean; coords?: { lat: number; lng: number }; error?: string }> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        error.value = "La géolocalisation n'est pas supportée par votre navigateur."
        isEnabled.value = false
        resolve({ success: false, error: error.value })
        return
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          lat.value = coords.latitude
          lng.value = coords.longitude
          accuracy.value = coords.accuracy
          error.value = null
          isEnabled.value = true
          localStorage.setItem('urbanflow_geolocation_enabled', 'true')
          localStorage.setItem('urbanflow_last_coords', JSON.stringify({ lat: coords.latitude, lng: coords.longitude }))

          // Démarre le suivi en continu si pas déjà en cours
          startTracking()

          resolve({
            success: true,
            coords: { lat: coords.latitude, lng: coords.longitude }
          })
        },
        (err) => {
          let errorMsg = "Impossible de récupérer votre position."
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = "Permission de géolocalisation refusée. Veuillez l'activer dans les paramètres de votre navigateur."
              break
            case err.POSITION_UNAVAILABLE:
              errorMsg = "Signal GPS indisponible ou désactivé sur votre appareil."
              break
            case err.TIMEOUT:
              errorMsg = "Délai d'attente de la géolocalisation dépassé."
              break
          }
          error.value = errorMsg
          isEnabled.value = false
          localStorage.setItem('urbanflow_geolocation_enabled', 'false')
          stopTracking()
          resolve({ success: false, error: errorMsg })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }

  function startTracking() {
    if (typeof window === 'undefined' || !navigator.geolocation || isTracking.value) return

    isTracking.value = true
    watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        lat.value = coords.latitude
        lng.value = coords.longitude
        accuracy.value = coords.accuracy
        error.value = null
        isEnabled.value = true
      },
      (err) => {
        error.value = err.message
      },
      { enableHighAccuracy: true }
    )
  }

  function disableGeolocation() {
    stopTracking()
    isEnabled.value = false
    lat.value = null
    lng.value = null
    accuracy.value = null
    error.value = null
    if (typeof window !== 'undefined') {
      localStorage.setItem('urbanflow_geolocation_enabled', 'false')
    }
  }

  function stopTracking() {
    if (typeof window !== 'undefined' && watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    isTracking.value = false
  }

  return {
    lat,
    lng,
    accuracy,
    error,
    isTracking,
    isEnabled,
    initGeolocation,
    enableGeolocation,
    disableGeolocation,
    startTracking,
    stopTracking
  }
})