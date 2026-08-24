<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { LocationData } from '~/components/SearchPanel.vue'
import type { ItineraryProposal } from '~/types/itinerary'
import { useGeoStore } from '~/stores/geo'
import SearchPanel from '~/components/SearchPanel.vue'
import TrajetsRecommandes from '~/components/TrajetsRecommandes.vue'
import DetailTrajet from '~/components/DetailTrajet.vue'
import MapLeafet from '~/components/mapLeafet.vue'
import UiSpinner from '~/components/ui/spinner.vue'
import { validateRouteInputs } from '~/utils/validation'
import { buildMultimodalProposals } from '~/utils/itinerary.helpers'
import { planTrip } from '~/utils/otp.service'

definePageMeta({
  middleware: 'auth',
  layout: 'map'
})

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

    // Construction des 3 propositions multimodales réelles (Transit TCL, Marche, Vélo)
    proposals.value = buildMultimodalProposals(result, startName.value, endName.value)
    
    // Sélection par défaut du 1er trajet et affichage du tracé sur Leaflet
    if (proposals.value.length > 0) {
      selectedProposal.value = proposals.value[0]
      activeMapData.value = selectedProposal.value
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

// 2. Sélection d'une proposition : passage à la vue 'details' (Détails du trajet)
const handleSelectProposal = (proposal: ItineraryProposal) => {
  selectedProposal.value = proposal
  activeMapData.value = proposal // Met à jour le tracé Leaflet en violet (#6366f1)
  currentView.value = 'details'
}

// 3. Bouton retour depuis les propositions vers la recherche
const handleBackToSearch = () => {
  currentView.value = 'search'
  activeMapData.value = null
}

// 4. Bouton retour depuis les détails vers les propositions
const handleBackToProposals = () => {
  currentView.value = 'proposals'
}

// 5. Terminer le trajet : retour au formulaire de recherche
const handleFinishTrip = () => {
  toast.add({
    title: 'Trajet terminé',
    description: 'Bravo pour ce trajet éco-responsable !',
    color: 'success',
    icon: 'i-lucide-circle-check'
  })
  currentView.value = 'search'
  activeMapData.value = null
}

// 6. Signaler un problème
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
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    setTimeout(() => {
      sheetRef.value?.open()
    }, 300)
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
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
      />
    </div>

    <!-- Conteneur Carte Leaflet -->
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
    <div class="block md:hidden">
      <BottomSheet
        :hideScrollbar="true"
        ref="sheetRef"
        :overlay="false"
        :canSwipeClose="false"
        class="mobile-bottom-sheet"
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
            />
          </div>
        </template>
      </BottomSheet>
    </div>

  </div>
</template>

<style scoped>
.h-full {
  height: 100%;
}
</style>
