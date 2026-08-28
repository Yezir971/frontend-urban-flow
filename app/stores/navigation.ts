import { defineStore } from 'pinia'
import {
  mapGeometryToLeafletPoints,
  getMinDistanceToPolyline,
  getDistanceMeters,
} from '~/utils/geometry'
import type { ItineraryProposal, ItineraryLeg } from '~/types/itinerary'

export const useNavigationStore = defineStore('navigation', () => {
  const isActive = ref(false)
  const isSimulating = ref(false)
  const isPaused = ref(false)
  const simulationSpeed = ref(1) // 1x, 2x, 3x
  const currentPointIndex = ref(0)
  const routePoints = ref<[number, number][]>([])
  const currentPosition = ref<[number, number] | null>(null)
  const currentProposal = ref<ItineraryProposal | null>(null)
  const currentLegIndex = ref(0)
  const isRerouting = ref(false)
  const isFinished = ref(false)
  const deviationAlert = ref<string | null>(null)

  let simulationTimer: any = null
  let lastRerouteTime = 0
  let onRerouteCallback: ((currentCoords: [number, number]) => Promise<void>) | null = null
  let onFinishCallback: (() => void) | null = null

  // Instruction actuelle
  const currentLeg = computed<ItineraryLeg | null>(() => {
    if (!currentProposal.value || !currentProposal.value.legs) return null
    return currentProposal.value.legs[currentLegIndex.value] || currentProposal.value.legs[0] || null
  })

  // Distance et durée restantes calculées
  const remainingPercent = computed(() => {
    if (routePoints.value.length <= 1) return 0
    return Math.min(100, Math.round((currentPointIndex.value / (routePoints.value.length - 1)) * 100))
  })

  const remainingDurationMins = computed(() => {
    if (!currentProposal.value) return 0
    const total = currentProposal.value.durationMinutes || 10
    const factor = Math.max(0, 1 - (remainingPercent.value / 100))
    return Math.max(1, Math.round(total * factor))
  })

  const remainingDistanceMeters = computed(() => {
    if (!currentProposal.value) return 0
    const total = currentProposal.value.distanceMeters || 1000
    const factor = Math.max(0, 1 - (remainingPercent.value / 100))
    return Math.max(0, Math.round(total * factor))
  })

  function startNavigation(
    proposal: ItineraryProposal,
    options?: {
      simulate?: boolean
      onReroute?: (coords: [number, number]) => Promise<void>
      onFinish?: () => void
    }
  ) {
    stopNavigation()

    currentProposal.value = proposal
    routePoints.value = mapGeometryToLeafletPoints(proposal)
    currentPointIndex.value = 0
    currentLegIndex.value = 0
    isFinished.value = false
    isRerouting.value = false
    deviationAlert.value = null
    isActive.value = true
    isPaused.value = false

    if (options?.onReroute) onRerouteCallback = options.onReroute
    if (options?.onFinish) onFinishCallback = options.onFinish

    const shouldSimulate = options?.simulate ?? true
    isSimulating.value = shouldSimulate

    if (routePoints.value.length > 0) {
      currentPosition.value = routePoints.value[0] ?? null
    }

    if (shouldSimulate) {
      startSimulationLoop()
    }
  }

  function startSimulationLoop() {
    clearSimulationTimer()
    const intervalMs = Math.max(400, Math.round(1500 / simulationSpeed.value))

    simulationTimer = setInterval(() => {
      if (isPaused.value || isRerouting.value) return
      stepSimulation()
    }, intervalMs)
  }

  function stepSimulation() {
    if (routePoints.value.length === 0) return

    if (currentPointIndex.value < routePoints.value.length - 1) {
      currentPointIndex.value++
      currentPosition.value = routePoints.value[currentPointIndex.value] ?? null

      // Avancement des étapes (legs) en fonction de la progression
      if (currentProposal.value?.legs && currentProposal.value.legs.length > 1) {
        const legCount = currentProposal.value.legs.length
        const targetLegIndex = Math.min(
          legCount - 1,
          Math.floor((currentPointIndex.value / routePoints.value.length) * legCount)
        )
        currentLegIndex.value = targetLegIndex
      }
    } else {
      // Fin du trajet
      completeNavigation()
    }
  }

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  function setSpeed(speed: number) {
    simulationSpeed.value = speed
    if (isSimulating.value && isActive.value) {
      startSimulationLoop()
    }
  }

  /**
   * Vérifie si la position réelle de l'utilisateur a dévié du tracé (> 75m)
   * et déclenche le recalcul automatique en temps réel
   */
  async function checkUserPosition(coords: [number, number]) {
    if (!isActive.value || isRerouting.value) return

    currentPosition.value = coords

    if (routePoints.value.length > 0) {
      const minDistance = getMinDistanceToPolyline(coords, routePoints.value)
      const now = Date.now()

      // Seuil de déviation : 75 mètres
      if (minDistance > 75 && now - lastRerouteTime > 10000) {
        lastRerouteTime = now
        await triggerRerouting(coords)
      }
    }
  }

  async function triggerRerouting(fromCoords: [number, number]) {
    isRerouting.value = true
    deviationAlert.value = 'Déviation détectée. Recalcul de votre itinéraire...'

    try {
      if (onRerouteCallback) {
        await onRerouteCallback(fromCoords)
      }
    } catch (err) {
      console.error('Erreur lors du recalcul:', err)
    } finally {
      setTimeout(() => {
        isRerouting.value = false
        deviationAlert.value = null
      }, 1500)
    }
  }

  /**
   * Met à jour l'itinéraire actif suite à un recalcul
   */
  function updateRoute(newProposal: ItineraryProposal) {
    currentProposal.value = newProposal
    routePoints.value = mapGeometryToLeafletPoints(newProposal)
    currentPointIndex.value = 0
    currentLegIndex.value = 0
    if (routePoints.value.length > 0) {
      currentPosition.value = routePoints.value[0] ?? null
    }
  }

  function completeNavigation() {
    clearSimulationTimer()
    isFinished.value = true
    if (onFinishCallback) {
      onFinishCallback()
    }
  }

  function stopNavigation() {
    clearSimulationTimer()
    isActive.value = false
    isSimulating.value = false
    isPaused.value = false
    isFinished.value = false
    isRerouting.value = false
    deviationAlert.value = null
    currentPosition.value = null
    onRerouteCallback = null
    onFinishCallback = null
  }

  function clearSimulationTimer() {
    if (simulationTimer) {
      clearInterval(simulationTimer)
      simulationTimer = null
    }
  }

  return {
    isActive,
    isSimulating,
    isPaused,
    simulationSpeed,
    currentPosition,
    currentProposal,
    currentLeg,
    currentLegIndex,
    remainingPercent,
    remainingDurationMins,
    remainingDistanceMeters,
    isRerouting,
    isFinished,
    deviationAlert,
    startNavigation,
    stopNavigation,
    stepSimulation,
    togglePause,
    setSpeed,
    checkUserPosition,
    triggerRerouting,
    updateRoute,
  }
})
