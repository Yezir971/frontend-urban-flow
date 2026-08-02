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
        class="w-full bg-[#104e35] hover:bg-[#0c3a28] text-white font-semibold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#104e35]/10 active:scale-[0.98] transition-all cursor-pointer"
      >
        <Clock class="w-4 h-4" />
        <span>Partir maintenant</span>
      </button>
    </form>

    <!-- Filtres rapides -->
    <div>
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
import { ref } from 'vue'
import {
  Clock,
  Train,
  Bus,
  Bike,
  Home,
  Briefcase,
  History,
  ChevronRight
} from 'lucide-vue-next'
import DestinationSelector from './DestinationSelector.vue'

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

const destinationSelectorRef = ref<any>(null)
const startLocation = ref<LocationData | null>(null)
const endLocation = ref<LocationData | null>(null)

// Filtre rapide sélectionné (mode)
const selectedFilter = ref<string>('Trains & RER')

const quickFilters = [
  { name: 'Trains & RER', icon: Train },
  { name: 'Bus', icon: Bus },
  { name: 'Vélos', icon: Bike }
]

const favorites = [
  {
    title: 'Domicile',
    address: '12 rue de la Paix, Paris',
    lat: 48.8694,
    lon: 2.3303,
    icon: Home,
    iconColor: 'green'
  },
  {
    title: 'Travail',
    address: "Station F, 5 Parvis Alan Turing",
    lat: 48.8344,
    lon: 2.3718,
    icon: Briefcase,
    iconColor: 'green'
  },
  {
    title: 'Gare de Lyon',
    address: 'Place Louis-Armand, Paris',
    lat: 48.8443,
    lon: 2.3744,
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

  // Force la valeur de destination dans le sélecteur modulaire
  destinationSelectorRef.value?.setDestination(data)
}

function handleSearch() {
  emit('search', {
    mode: selectedFilter.value
  })
}
</script>
