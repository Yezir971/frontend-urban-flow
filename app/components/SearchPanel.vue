<template>
  <div class="flex flex-col gap-6 w-full">
    <!-- En-tête -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-1">Où allez-vous ?</h1>
      <p class="text-sm text-gray-500">Planifiez votre itinéraire éco-responsable.</p>
    </div>

    <!-- Formulaire de recherche utilisant le sélecteur modulaire -->
    <form @submit.prevent="handleSearch" class="flex flex-col gap-4">
      <DestinationSelector
        ref="destinationSelectorRef"
        @update:start-location="handleStartSelected"
        @update:end-location="handleEndSelected"
      />

      <!-- Bouton d'action -->
      <button
        type="submit"
        :disabled="!startLocation || !endLocation"
        class="w-full bg-[#104e35] hover:bg-[#0c3a28] text-white font-semibold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#104e35]/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#104e35]"
      >
        <Clock class="w-4 h-4" />
        <span>Partir maintenant</span>
      </button>
    </form>

    <!-- Filtres rapides (Dynamiques selon les préférences utilisateur) -->
    <div v-if="quickFilters.length > 0">
      <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filtres rapides</h2>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="filter in quickFilters"
          :key="filter.name"
          type="button"
          @click="toggleFilter(filter.name)"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 cursor-pointer"
          :class="[
            selectedFilter === filter.name
              ? 'bg-[#c5eadd] text-[#104e35]'
              : 'bg-[#F3F5F4] text-gray-600 hover:bg-gray-200'
          ]"
        >
          <component :is="filter.icon" class="w-4 h-4 shrink-0" />
          <span>{{ filter.name }}</span>
        </button>
      </div>
    </div>

    <!-- Favoris & Récents -->
    <div>
      <h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Favoris & Récents</h2>
      <div class="flex flex-col gap-2">
        <button
          v-for="fav in favorites"
          :key="fav.title"
          type="button"
          @click="selectFavorite(fav)"
          class="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left w-full cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="[fav.iconColor === 'green' ? 'bg-[#EAF5F1] text-[#104e35]' : 'bg-[#F3F5F4] text-gray-500']"
            >
              <component :is="fav.icon" class="w-5 h-5" />
            </div>
            <div>
              <p class="font-medium text-gray-900 text-sm">{{ fav.title }}</p>
              <p class="text-xs text-gray-500 line-clamp-1">{{ fav.address }}</p>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-gray-400 shrink-0" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Clock,
  Train,
  Bus,
  Car,
  Bike,
  Home,
  Briefcase,
  History,
  ChevronRight,
  Footprints
} from 'lucide-vue-next'
import DestinationSelector from './DestinationSelector.vue'
import { useUserPreferences } from '~/composables/useUserPreferences'

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
  otpValue: [number, number];
}

const emit = defineEmits([
  'search',
  'location-selected-start',
  'location-selected-end'
])

const { preferences, loadPreferences } = useUserPreferences()

const destinationSelectorRef = ref<any>(null)
const startLocation = ref<LocationData | null>(null)
const endLocation = ref<LocationData | null>(null)

// Filtres selon les préférences de l'utilisateur
const allFilters = [
  { name: 'Trains & RER', key: 'pref_metro' as const, icon: Train },
  { name: 'Bus', key: 'pref_bus' as const, icon: Bus },
  { name: 'Vélos', key: 'pref_bike' as const, icon: Bike },
  { name: 'Marche', key: 'pref_walk' as const, icon: Footprints },
  { name: 'Voiture', key: 'pref_car' as const, icon: Car }
]

const quickFilters = computed(() => {
  return allFilters.filter(f => preferences.value[f.key])
})

const selectedFilter = ref<string>('Trains & RER')

// Ajuste automatiquement la sélection si un mode a été désactivé dans les préférences
watch(quickFilters, (filters) => {
  if (filters.length > 0 && !filters.some(f => f.name === selectedFilter.value)) {
    selectedFilter.value = filters[0].name
  }
}, { immediate: true })

onMounted(() => {
  loadPreferences()
})

const favorites = [
  {
    title: 'Domicile',
    address: 'Place Bellecour, Lyon',
    lat: 45.7578,
    lon: 4.8322,
    icon: Home,
    iconColor: 'green'
  },
  {
    title: 'Travail',
    address: 'Gare Part-Dieu, Lyon',
    lat: 45.7602,
    lon: 4.8596,
    icon: Briefcase,
    iconColor: 'green'
  },
  {
    title: 'Gare Perrache',
    address: 'Place Carnot, Lyon',
    lat: 45.7485,
    lon: 4.8258,
    icon: History,
    iconColor: 'gray'
  }
]

function handleStartSelected(data: LocationData) {
  startLocation.value = data
  emit('location-selected-start', data)
}

function handleEndSelected(data: LocationData) {
  endLocation.value = data
  emit('location-selected-end', data)
}

function toggleFilter(filterName: string) {
  selectedFilter.value = filterName
}

function selectFavorite(fav: typeof favorites[0]) {
  const data: LocationData = {
    name: fav.address,
    lat: fav.lat,
    lon: fav.lon,
    otpValue: [fav.lon, fav.lat]
  }

  destinationSelectorRef.value?.setDestination(data)
}

function handleSearch() {
  const startVal = startLocation.value ? { lat: startLocation.value.lat, lon: startLocation.value.lon, name: startLocation.value.name } : null
  const endVal = endLocation.value ? { lat: endLocation.value.lat, lon: endLocation.value.lon, name: endLocation.value.name } : null

  if (!validateRouteInputs(startVal, endVal)) {
    alert("Veuillez renseigner un point de départ et une destination valides.")
    return
  }

  emit('search', {
    mode: selectedFilter.value
  })
}
</script>
