<template>
  <div class="flex flex-col gap-6 w-full">
    <!-- En-tête -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">Où allez-vous ?</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Planifiez votre itinéraire éco-responsable.</p>
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
        class="w-full bg-[#104e35] dark:bg-[#1D6045] hover:bg-[#0c3a28] dark:hover:bg-[#154D36] text-white font-semibold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#104e35]/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#104e35]"
      >
        <Clock class="w-4 h-4" />
        <span>Partir maintenant</span>
      </button>
    </form>

    <!-- Filtres rapides (Dynamiques selon les préférences utilisateur) -->
    <div v-if="quickFilters.length > 0">
      <h2 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Filtres rapides</h2>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="filter in quickFilters"
          :key="filter.name"
          type="button"
          @click="toggleFilter(filter.name)"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 cursor-pointer"
          :class="[
            selectedFilter === filter.name
              ? 'bg-[#c5eadd] text-[#104e35] dark:bg-[#1B4D3E] dark:text-[#A7F3D0]'
              : 'bg-[#F3F5F4] dark:bg-[#15221E] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1F332C]'
          ]"
        >
          <component :is="filter.icon" class="w-4 h-4 shrink-0" />
          <span>{{ filter.name }}</span>
        </button>
      </div>
    </div>

    <!-- Favoris & Récents -->
    <div>
      <h2 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Favoris & Récents</h2>
      <div v-if="displayFavorites.length > 0" class="flex flex-col gap-2">
        <button
          v-for="fav in displayFavorites"
          :key="fav.id || fav.title"
          type="button"
          @click="selectFavorite(fav)"
          class="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#15221E] border border-gray-100 dark:border-emerald-900/30 hover:border-gray-200 dark:hover:border-emerald-700/50 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left w-full cursor-pointer group"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#EAF5F1] dark:bg-[#1B4D3E] text-[#104e35] dark:text-[#34D399] group-hover:scale-105 transition-transform"
            >
              <component :is="fav.iconComponent" class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <p class="font-bold text-gray-900 dark:text-white text-sm truncate">{{ fav.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ fav.address }}</p>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 text-gray-400 dark:text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </div>
      <div v-else class="p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#15221E] border border-gray-100/80 dark:border-emerald-900/30 text-center text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
        <span>Aucun favori enregistré</span>
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
  Star,
  User,
  Heart,
  Dumbbell,
  History,
  ChevronRight,
  Footprints
} from 'lucide-vue-next'
import DestinationSelector from './DestinationSelector.vue'
import { useUserPreferences } from '~/composables/useUserPreferences'
import { useFavorites } from '~/composables/useFavorites'
import type { UserFavorite } from '~/types/favorite'

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
  otpValue?: [number, number];
}

const emit = defineEmits([
  'location-selected-start',
  'location-selected-end',
  'search'
])

const { preferences, loadPreferences } = useUserPreferences()
const { favorites: userFavorites, fetchFavorites } = useFavorites()

const startLocation = ref<LocationData | null>(null)
const endLocation = ref<LocationData | null>(null)
const selectedFilter = ref('Transport')
const destinationSelectorRef = ref<InstanceType<typeof DestinationSelector> | null>(null)

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

// Helper pour associer un composant d'icône
function getIconForFav(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case 'work':
    case 'briefcase':
      return Briefcase;
    case 'star':
      return Star;
    case 'user':
      return User;
    case 'heart':
      return Heart;
    case 'gym':
    case 'dumbbell':
      return Dumbbell;
    case 'home':
    default:
      return Home;
  }
}

// Favoris formatés pour l'affichage
const displayFavorites = computed(() => {
  if (userFavorites.value && userFavorites.value.length > 0) {
    return userFavorites.value.map((f) => ({
      id: f.id,
      title: f.name,
      address: f.address,
      lat: f.coordinates.lat,
      lon: f.coordinates.lng,
      startAddress: f.start_address,
      startLat: f.start_coordinates?.lat,
      startLon: f.start_coordinates?.lng,
      iconComponent: getIconForFav(f.icon),
      iconColor: 'green',
    }));
  }

  // Aucun favori par défaut si l'utilisateur n'en a pas enregistré
  return [];
});

// Ajuste automatiquement la sélection si un mode a été désactivé dans les préférences
watch(quickFilters, (filters) => {
  if (filters.length > 0 && !filters.some(f => f.name === selectedFilter.value)) {
    selectedFilter.value = filters[0]!.name
  }
}, { immediate: true })

onMounted(() => {
  loadPreferences();
  fetchFavorites();
});

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

function selectFavorite(fav: {
  title: string;
  address: string;
  lat: number;
  lon: number;
  startAddress?: string | null;
  startLat?: number;
  startLon?: number;
}) {
  // 1. Renseigner la destination
  const endData: LocationData = {
    name: fav.address,
    lat: fav.lat,
    lon: fav.lon,
    otpValue: [fav.lon, fav.lat],
  };

  destinationSelectorRef.value?.setDestination(endData);
  endLocation.value = endData;
  emit('location-selected-end', endData);

  // 2. Renseigner le départ si présent dans le favori
  if (fav.startAddress && fav.startLat != null && fav.startLon != null) {
    const startData: LocationData = {
      name: fav.startAddress,
      lat: fav.startLat,
      lon: fav.startLon,
      otpValue: [fav.startLon, fav.startLat],
    };
    destinationSelectorRef.value?.setStart(startData);
    startLocation.value = startData;
    emit('location-selected-start', startData);
  }
}

function handleSearch() {
  const startVal = startLocation.value ? { lat: startLocation.value.lat, lon: startLocation.value.lon, name: startLocation.value.name } : null
  const endVal = endLocation.value ? { lat: endLocation.value.lat, lon: endLocation.value.lon, name: endLocation.value.name } : null

  if (!startVal || !endVal) {
    alert("Veuillez renseigner un point de départ et une destination valides.")
    return
  }

  emit('search', {
    mode: selectedFilter.value
  })
}
</script>
