<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { LocationData } from '~/components/SearchPanel.vue'
import type { ItineraryProposal } from '~/types/itinerary'
import { useGeoStore } from '~/stores/geo'
import { useNavigationStore } from '~/stores/navigation'
import SearchPanel from '~/components/SearchPanel.vue'
import TrajetsRecommandes from '~/components/TrajetsRecommandes.vue'
import DetailTrajet from '~/components/DetailTrajet.vue'
import NavigationBanner from '~/components/NavigationBanner.vue'
import MapLeafet from '~/components/mapLeafet.vue'
import UiSpinner from '~/components/ui/spinner.vue'
import { validateRouteInputs } from '~/utils/validation'
import { buildMultimodalProposals, filterProposalsByPreferences } from '~/utils/itinerary.helpers'
import { planTrip } from '~/utils/otp.service'
import { recordCompletedTrip } from '~/utils/trips.service'
import { useUserPreferences } from '~/composables/useUserPreferences'
import { useUserProfile } from '~/composables/useUserProfile'

definePageMeta({
  middleware: 'auth',
  layout: 'map'
})

const { preferences, speedCoefficient, loadPreferences } = useUserPreferences()
const { loadProfile } = useUserProfile()
const navStore = useNavigationStore()
const route = useRoute()
const sheetRef = ref<any>(null)
const geo = useGeoStore()
const toast = useToast()

// États de navigation : 'search' | 'proposals' | 'details'
const currentView = ref<'search' | 'proposals' | 'details'>('search')

const startCoordinates = ref<[number, number]>([0, 0])
const endCoordinates = ref<[number, number]>([0, 0])
const startName = ref<string>('Ma position actuelle')
const endName = ref<string>('')

const proposals = ref<ItineraryProposal[]>([])
const selectedProposal = ref<ItineraryProposal | null>(null)
const activeMapData = ref<any>(null)
const isLoading = ref(false)

const setStartLocation = (locationDataStart: LocationData) => {
  startCoordinates.value = locationDataStart.otpValue
  startName.value = locationDataStart.name
}

const setEndLocation = (locationDataEnd: LocationData) => {
  endCoordinates.value = locationDataEnd.otpValue
  endName.value = locationDataEnd.name
}

// 1. Recherche initiale : passage à la vue 'proposals' (Trajets recommandés)
const onSearch = async (searchData?: { mode: string }) => {
  const startLoc = { lat: startCoordinates.value[1], lon: startCoordinates.value[0], name: startName.value }
  const endLoc = { lat: endCoordinates.value[1], lon: endCoordinates.value[0], name: endName.value }

  if (!validateRouteInputs(startLoc, endLoc)) {
    alert("Veuillez sélectionner un point de départ et une destination valides.")
    return
  }

  let modes: string[] = ['TRANSIT', 'WALK']
  if (searchData?.mode === 'Vélos') {
    modes = ['BICYCLE']
  } else if (searchData?.mode === 'Bus') {
    modes = ['BUS', 'WALK']
  } else if (searchData?.mode === 'Trains & RER') {
    modes = ['SUBWAY', 'TRAM', 'WALK']
  } else if (searchData?.mode === 'Marche'){
    modes = ['WALK']
  } else if (searchData?.mode === 'Voiture'){
    modes = ['CAR']
  }

  try {
    isLoading.value = true
    
    // Appel à l'API Gateway NestJS
    const result = await planTrip(
      { lon: startCoordinates.value[0], lat: startCoordinates.value[1] },
      { lon: endCoordinates.value[0], lat: endCoordinates.value[1] },
      modes as any
    )

    // Construction des propositions multimodales en appliquant le coefficient de vitesse
    const rawProposals = buildMultimodalProposals(
      result,
      startName.value,
      endName.value,
      speedCoefficient.value,
    )

    // Filtrage strict : les modes désélectionnés dans les préférences ne figurent pas dans les recommandations
    proposals.value = filterProposalsByPreferences(rawProposals, preferences.value)
    
    // Sélection par défaut du 1er trajet et affichage du tracé sur Leaflet
    if (proposals.value.length > 0) {
      selectedProposal.value = proposals.value[0]
      activeMapData.value = selectedProposal.value
    } else {
      toast.add({
        title: 'Aucun itinéraire disponible',
        description: 'Vos préférences de transport ont masqué tous les itinéraires calculés.',
        color: 'warning',
        icon: 'i-lucide-alert-triangle'
      })
    }

    currentView.value = 'proposals'

    if (isMobile.value) {
      sheetRef.value?.open()
    }
  } catch (error) {
    console.error('Erreur lors du calcul d\'itinéraire:', error)
    toast.add({
      title: 'Erreur d\'itinéraire',
      description: 'Impossible de calculer les itinéraires pour ces coordonnées.',
      color: 'error',
      icon: 'i-lucide-triangle-alert'
    })
  } finally {
    isLoading.value = false
  }
}

// 2. Sélection d'une proposition : passage à la vue 'details'
const handleSelectProposal = (proposal: ItineraryProposal) => {
  selectedProposal.value = proposal
  activeMapData.value = proposal
  currentView.value = 'details'
}

// 3. Démarrage du guidage en direct (avec ou sans simulation démo)
const handleStartNavigation = (options: { simulate: boolean }) => {
  if (!selectedProposal.value) return

  navStore.startNavigation(selectedProposal.value, {
    simulate: options.simulate,
    onReroute: handleDeviationReroute,
    onFinish: async () => {
      const prop = selectedProposal.value
      if (prop) {
        try {
          const rawMode = ((prop as any).mode || prop.type || 'TRANSIT').toUpperCase()
          const validMode = [
            'TRANSIT',
            'SUBWAY',
            'TRAM',
            'BUS',
            'BICYCLE',
            'SCOOTER',
            'WALK',
            'CAR',
          ].includes(rawMode)
            ? rawMode
            : 'TRANSIT'

          const duration = Math.max(1, Math.round(prop.durationMinutes || 1))
          const distance = Math.max(10, Math.round(prop.distanceMeters || 100))
          const co2 = Math.max(0, Number((prop.co2SavedKg || 0).toFixed(2)))

          await recordCompletedTrip({
            start_name: startName.value || 'Départ',
            end_name: endName.value || 'Destination',
            start_lat: Number(startCoordinates.value[1]) || 45.7640,
            start_lon: Number(startCoordinates.value[0]) || 4.8357,
            end_lat: Number(endCoordinates.value[1]) || 45.7640,
            end_lon: Number(endCoordinates.value[0]) || 4.8357,
            mode: validMode as any,
            line_name: prop.badge || (prop as any).lineBadge || null,
            duration_minutes: duration,
            distance_meters: distance,
            co2_saved_kg: co2,
            points_earned: 10,
            trace: prop.trace || (prop as any).rawTrace || null,
          })

          // Recharge instantanément le profil pour mettre à jour les compteurs globaux
          await loadProfile(true)

          toast.add({
            title: 'Arrivé à destination !',
            description: `Trajet enregistré ! +10 éco-points & ${(prop.co2SavedKg || 0).toFixed(1)} kg CO2 économisés 🌱`,
            color: 'success',
            icon: 'i-lucide-award',
          })
        } catch (err: any) {
          console.warn('Erreur enregistrement trajet:', err)
          toast.add({
            title: 'Arrivé à destination !',
            description: 'Félicitations pour ce trajet éco-responsable avec Urban Flow !',
            color: 'success',
            icon: 'i-lucide-award',
          })
        }
      }
    },
  })

  // Sur mobile, ferme ou réduit le sheet pour libérer la vue de la carte
  if (isMobile.value) {
    sheetRef.value?.close()
  }

  toast.add({
    title: options.simulate ? 'Guidage démo démarré' : 'Guidage GPS en direct',
    description: 'Suivez le déplacement et les instructions sur la carte.',
    color: 'success',
    icon: 'i-lucide-navigation'
  })
}

// 4. Recalcul automatique en temps réel en cas de déviation (> 75m)
const handleDeviationReroute = async (deviatedCoords: [number, number]) => {
  try {
    const modes: string[] = ['TRANSIT', 'WALK']
    const result = await planTrip(
      { lon: deviatedCoords[1], lat: deviatedCoords[0] },
      { lon: endCoordinates.value[0], lat: endCoordinates.value[1] },
      modes as any
    )

    const rawProposals = buildMultimodalProposals(
      result,
      'Position actuelle',
      endName.value,
      speedCoefficient.value
    )

    const filtered = filterProposalsByPreferences(rawProposals, preferences.value)
    if (filtered.length > 0) {
      selectedProposal.value = filtered[0]!
      activeMapData.value = selectedProposal.value
      navStore.updateRoute(selectedProposal.value)
      toast.add({
        title: 'Itinéraire recalculé',
        description: 'Le nouveau parcours a été recalculé et appliqué en direct.',
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    }
  } catch (err) {
    console.error('Erreur recalcul déviation:', err)
  }
}

// 5. Arrêt du guidage
const handleStopNavigation = () => {
  if (isMobile.value) {
    sheetRef.value?.open()
  }
}

// 6. Boutons retour
const handleBackToSearch = () => {
  navStore.stopNavigation()
  currentView.value = 'search'
  activeMapData.value = null
}

const handleBackToProposals = () => {
  navStore.stopNavigation()
  currentView.value = 'proposals'
}

// 7. Terminer le trajet
const handleFinishTrip = () => {
  navStore.stopNavigation()
  toast.add({
    title: 'Trajet terminé',
    description: 'Bravo pour ce trajet éco-responsable !',
    color: 'success',
    icon: 'i-lucide-circle-check'
  })
  currentView.value = 'search'
  activeMapData.value = null
}

// 8. Signaler un problème
const handleReportIssue = () => {
  toast.add({
    title: 'Signalement envoyé',
    description: 'Merci pour votre contribution au réseau Urban Flow.',
    color: 'info',
    icon: 'i-lucide-alert-circle'
  })
}

// Gestion responsive
const isMobile = ref(false)

const handleResize = () => {
  const currentIsMobile = window.innerWidth < 768
  if (currentIsMobile !== isMobile.value) {
    isMobile.value = currentIsMobile
    if (isMobile.value) {
      sheetRef.value?.open()
    } else {
      sheetRef.value?.close()
    }
  }
}

onMounted(() => {
  loadPreferences()
  loadProfile()
  geo.initGeolocation()
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    setTimeout(() => {
      sheetRef.value?.open()
    }, 300)
  }
  window.addEventListener('resize', handleResize)

  // Si on arrive depuis un favori avec des coordonnées dans l'URL
  if (route.query.lat && route.query.lon) {
    const destLat = parseFloat(route.query.lat as string)
    const destLon = parseFloat(route.query.lon as string)
    if (!isNaN(destLat) && !isNaN(destLon)) {
      endCoordinates.value = [destLon, destLat]
      endName.value = (route.query.name as string) || (route.query.destination as string) || 'Destination'

      if (route.query.start_lat && route.query.start_lon) {
        const sLat = parseFloat(route.query.start_lat as string)
        const sLon = parseFloat(route.query.start_lon as string)
        if (!isNaN(sLat) && !isNaN(sLon)) {
          startCoordinates.value = [sLon, sLat]
          startName.value = (route.query.start as string) || 'Départ'
        }
      } else {
        const startLon = geo.lng || 4.8590
        const startLat = geo.lat || 45.7606
        startCoordinates.value = [startLon, startLat]
        startName.value = 'Ma position actuelle'
      }

      // Déclenche immédiatement la recherche
      setTimeout(() => {
        handleSearch({ mode: 'Transport' })
      }, 200)
    }
  }
})

onBeforeUnmount(() => {
  navStore.stopNavigation()
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="flex flex-col md:flex-row h-full w-full relative overflow-hidden bg-[#F7F9F8]">
    
    <!-- Panneau latéral Desktop (visible sur md+) -->
    <div class="hidden md:flex flex-col w-96 h-full bg-white border-r border-gray-200 p-6 overflow-y-auto shrink-0 z-10 shadow-lg relative">
      <!-- Overlay de chargement avec Spinner -->
      <div v-if="isLoading" class="absolute inset-0 bg-white/90 z-30 flex flex-col items-center justify-center gap-3">
        <UiSpinner size="lg" color="text-[#104e35]" />
        <p class="text-sm font-semibold text-[#104e35]">Calcul des itinéraires recommandés...</p>
      </div>

      <!-- Vue 1 : Recherche -->
      <SearchPanel
        v-if="currentView === 'search'"
        @search="onSearch"
        @location-selected-start="setStartLocation"
        @location-selected-end="setEndLocation"
      />

      <!-- Vue 2 : Trajets recommandés -->
      <TrajetsRecommandes
        v-else-if="currentView === 'proposals'"
        :proposals="proposals"
        @select="handleSelectProposal"
        @back="handleBackToSearch"
      />

      <!-- Vue 3 : Détails du trajet -->
      <DetailTrajet
        v-else-if="currentView === 'details' && selectedProposal"
        :itinerary="selectedProposal"
        :startName="startName"
        :endName="endName"
        @back="handleBackToProposals"
        @finish="handleFinishTrip"
        @report="handleReportIssue"
        @start-navigation="handleStartNavigation"
      />
    </div>

    <!-- Bandeau flottant de guidage Turn-by-Turn -->
    <NavigationBanner
      @stop="handleStopNavigation"
      @deviate="handleDeviationReroute"
    />
    <!-- Conteneur Carte Leaflet avec NavigationBanner flottant -->
    <div class="grow h-full w-full relative z-0">

      <ClientOnly>
        <MapLeafet :otpData="activeMapData ?? undefined" />
        <template #fallback>
          <div class="flex items-center justify-center h-full w-full bg-[#f3f5f4] text-gray-500">
            Chargement de la carte...
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Bottom Sheet Mobile (visible sur mobile uniquement) -->
    <div class="block md:hidden z-999">
      <BottomSheet
        :hideScrollbar="true"
        ref="sheetRef"
        :overlay="false"
        :canSwipeClose="false"
        :snapPoints="['50%','3%', '100%']"
        :initialSnapPoint="1"
      >
        <template #header>
          <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-2"></div>
        </template>
        <template #default>
          <div class="px-4 pb-14 pt-2 max-h-[75vh] overflow-y-auto relative">
            <!-- Overlay de chargement Mobile -->
            <div v-if="isLoading" class="absolute inset-0 bg-white/90 z-30 flex flex-col items-center justify-center gap-3">
              <UiSpinner size="md" color="text-[#104e35]" />
              <p class="text-sm font-semibold text-[#104e35]">Calcul des itinéraires recommandés...</p>
            </div>

            <!-- Vue 1 : Recherche -->
            <SearchPanel
              v-if="currentView === 'search'"
              @search="onSearch"
              @location-selected-start="setStartLocation"
              @location-selected-end="setEndLocation"
            />

            <!-- Vue 2 : Trajets recommandés -->
            <TrajetsRecommandes
              v-else-if="currentView === 'proposals'"
              :proposals="proposals"
              @select="handleSelectProposal"
              @back="handleBackToSearch"
            />

            <!-- Vue 3 : Détails du trajet -->
            <DetailTrajet
              v-else-if="currentView === 'details' && selectedProposal"
              :itinerary="selectedProposal"
              :startName="startName"
              :endName="endName"
              @back="handleBackToProposals"
              @finish="handleFinishTrip"
              @report="handleReportIssue"
              @start-navigation="handleStartNavigation"
            />
          </div>
        </template>
      </BottomSheet>
    </div>

  </div>
</template>
