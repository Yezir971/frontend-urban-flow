import { defineStore } from 'pinia'

export const useGeoStore = defineStore('geo', () => {
  const lat = ref<number | null>(null)
  const lng = ref<number | null>(null)
  const error = ref<string | null>(null)
  const isTracking = ref(false)
  let watchId: number | null = null

  function startTracking() {
    if (!navigator.geolocation || isTracking.value) return

    isTracking.value = true
    watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        lat.value = coords.latitude
        lng.value = coords.longitude
      },
      (err) => {
        error.value = err.message
      },
      { enableHighAccuracy: true }
    )
  }

  function stopTracking() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    isTracking.value = false
  }

  return { lat, lng, error, isTracking, startTracking, stopTracking }
})