<template>
  <div class="relative rounded-2xl p-4 flex flex-col gap-3">
    <!-- Input de départ -->
    <div class="flex items-center gap-3 bg-white dark:bg-[#15221E] rounded-xl px-3 py-2.5 border border-gray-100/50 dark:border-emerald-900/40 shadow-sm focus-within:ring-2 focus-within:ring-[#104e35]/30 dark:focus-within:ring-emerald-500/30 focus-within:border-[#104e35]/80 dark:focus-within:border-emerald-500/80 transition-all duration-200">
      <Navigation class="w-5 h-5 text-[#104e35] dark:text-[#34D399] shrink-0 animate-pulse" />
      <PhotonAutocomplete
        v-model="startQuery"
        :activateCurrentPosition="true"
        @location-selected="handleStartSelected"
        placeholder="Ma position actuelle"
      />
    </div>

    <!-- Input de destination -->
    <div class="flex items-center gap-3 bg-white dark:bg-[#15221E] rounded-xl px-3 py-2.5 border border-gray-100/50 dark:border-emerald-900/40 shadow-sm focus-within:ring-2 focus-within:ring-[#104e35]/30 dark:focus-within:ring-emerald-500/30 focus-within:border-[#104e35]/80 dark:focus-within:border-emerald-500/80 transition-all duration-200">
      <MapPin class="w-5 h-5 text-gray-400 dark:text-gray-400 shrink-0" />
      <PhotonAutocomplete
        v-model="endQuery"
        @location-selected="handleEndSelected"
        placeholder="Rechercher une destination"
      />
    </div>

    <!-- Bouton d'inversion des destinations (Swap) -->
    <button
      type="button"
      @click="swapLocations"
      class="absolute right-8 top-1/2 -translate-y-1/2 bg-white dark:bg-[#1C2F28] text-gray-700 dark:text-gray-200 hover:text-[#104e35] dark:hover:text-[#34D399] border border-gray-200 dark:border-emerald-900/60 rounded-full p-2.5 shadow-md hover:shadow-lg transition-all active:scale-90 cursor-pointer z-10"
      aria-label="Inverser les adresses de départ et de destination"
    >
      <ArrowUpDown class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Navigation, MapPin, ArrowUpDown } from 'lucide-vue-next'
import type { LocationData } from '~/components/SearchPanel.vue'

const startQuery = ref('')
const endQuery = ref('')

const startLocation = ref<LocationData | null>(null)
const endLocation = ref<LocationData | null>(null)

const emit = defineEmits([
  'update:start-location',
  'update:end-location'
])

function handleStartSelected(data: LocationData) {
  startLocation.value = data
  startQuery.value = data.name
  emit('update:start-location', data)
}

function handleEndSelected(data: LocationData) {
  endLocation.value = data
  endQuery.value = data.name
  emit('update:end-location', data)
}

function swapLocations() {
  // Inverser les chaînes de caractères
  const tempQuery = startQuery.value
  startQuery.value = endQuery.value
  endQuery.value = tempQuery

  // Inverser les objets géographiques
  const tempLoc = startLocation.value
  startLocation.value = endLocation.value
  endLocation.value = tempLoc

  // Propagation des événements vers le parent
  emit('update:start-location', startLocation.value)
  emit('update:end-location', endLocation.value)
}

// Permettre au parent de forcer une valeur (ex: en choisissant un favori)
defineExpose({
  setDestination: (data: LocationData) => {
    endLocation.value = data
    endQuery.value = data.name
    emit('update:end-location', data)
  },
  setStart: (data: LocationData) => {
    startLocation.value = data
    startQuery.value = data.name
    emit('update:start-location', data)
  }
})
</script>
