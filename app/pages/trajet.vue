<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { ResponseTrip } from '~/types/plan'
import type { LocationData } from '~/components/SearchPanel.vue'
import { useGeoStore } from '~/stores/geo'
import SearchPanel from '~/components/SearchPanel.vue'
import MapLeafet from '~/components/mapLeafet.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'map'
})

const sheetRef = ref<any>(null)
const geo = useGeoStore()

const startCoordinates = ref<[number, number]>([0, 0])
const endCoordinates = ref<[number, number]>([0, 0])
const planning = ref<ResponseTrip | null>(null)

const setStartLocation = (locationDataStart: LocationData) => {
  console.log("Start location selected:", locationDataStart.otpValue)
  startCoordinates.value = locationDataStart.otpValue
}

const setEndLocation = (locationDataEnd: LocationData) => {
  console.log("End location selected:", locationDataEnd.otpValue)
  endCoordinates.value = locationDataEnd.otpValue
}

const onSearch = async (searchData?: { mode: string }) => {
  let modes: string[] = ['WALK']

  if (searchData?.mode === 'Trains & RER') {
    modes = ['TRANSIT', 'WALK']
  } else if (searchData?.mode === 'Bus') {
    modes = ['TRANSIT', 'WALK']
  } else if (searchData?.mode === 'Vélos') {
    modes = ['BICYCLE']
  }

  if (startCoordinates.value[0] !== 0 && endCoordinates.value[0] !== 0) {
    try {
      console.log('Requesting route via OTP service...')
      const result: ResponseTrip = await planTrip(
        { lon: startCoordinates.value[0], lat: startCoordinates.value[1] },
        { lon: endCoordinates.value[0], lat: endCoordinates.value[1] },
        modes as any
      )

      planning.value = result
      console.log('Result from OTP:', result)
    } catch (error) {
      console.error('Error planning trip:', error)
    }
  } else {
    alert("Veuillez sélectionner un point de départ et une destination.")
  }
}

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
    
    <!-- Panneau de recherche Desktop (visible sur md+) -->
    <div class="hidden md:flex flex-col w-95 h-full bg-white border-r border-gray-200 p-6 overflow-y-auto shrink-0 z-10 shadow-lg">
      <SearchPanel
        @search="onSearch"
        @location-selected-start="setStartLocation"
        @location-selected-end="setEndLocation"
      />

      <!-- Options additionnelles / Infos trajet si disponibles -->
      <div v-if="planning?.data?.plan?.itineraries?.[0]" class="mt-6 p-4 bg-[#EAF5F1] rounded-2xl border border-[#c5eadd]">
        <h3 class="font-semibold text-[#104e35] text-sm mb-2">Détails de l'itinéraire</h3>
        <p class="text-sm text-gray-700">
          Temps estimé : 
          <span class="font-bold">
            {{ Math.round(planning.data.plan.itineraries[0].duration / 60) }} min
          </span>
        </p>
        <p class="text-sm text-gray-700 mt-1">
          Distance totale : 
          <span class="font-bold">
            {{ Math.round(planning.data.plan.itineraries[0].legs.reduce((acc, leg) => acc + leg.distance, 0)) }} m
          </span>
        </p>
      </div>
    </div>

    <!-- Conteneur de la carte (Prend tout l'espace restant) -->
    <div class="grow h-full w-full relative z-0">
      <ClientOnly>
        <MapLeafet :otpData="planning ?? undefined" />
        <template #fallback>
          <div class="flex items-center justify-center h-full w-full bg-[#f3f5f4] text-gray-500">
            Chargement de la carte...
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Popup / Bottom Sheet Mobile (visible sur mobile uniquement) -->
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
          <div class="px-4 pb-12 pt-2 max-h-[70vh] overflow-y-auto">
            <SearchPanel
              @search="onSearch"
              @location-selected-start="setStartLocation"
              @location-selected-end="setEndLocation"
            />

            <!-- Résumé d'itinéraire sur Mobile -->
            <div v-if="planning?.data?.plan?.itineraries?.[0]" class="mt-4 p-4 bg-[#EAF5F1] rounded-2xl border border-[#c5eadd]">
              <h3 class="font-semibold text-[#104e35] text-sm mb-1">Détails de l'itinéraire</h3>
              <div class="flex justify-between text-sm text-gray-700">
                <p>Temps : <span class="font-bold">{{ Math.round(planning.data.plan.itineraries[0].duration / 60) }} min</span></p>
                <p>Distance : <span class="font-bold">{{ Math.round(planning.data.plan.itineraries[0].legs.reduce((acc, leg) => acc + leg.distance, 0)) }} m</span></p>
              </div>
            </div>
          </div>
        </template>
      </BottomSheet>
    </div>

  </div>
</template>

<style scoped>
/* Ajustement de la hauteur pour correspondre à l'écran sans scroller */
.h-full {
  height: 100%;
}
</style>
