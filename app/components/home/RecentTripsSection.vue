<template>
  <div class="flex flex-col gap-3">
    <!-- En-tête de section -->
    <div class="flex items-center justify-between">
      <h2 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
        Trajets récents
      </h2>
      <button
        v-if="recentTrips.length > 0"
        type="button"
        @click="openAllTripsModal"
        class="text-xs sm:text-sm font-semibold text-[#104E35] dark:text-[#34D399] hover:text-[#0D3E2A] dark:hover:text-[#6EE7B7] transition-colors cursor-pointer"
      >
        Voir tout
      </button>
    </div>

    <!-- État : Aucun trajet récent -->
    <div
      v-if="recentTrips.length === 0 && !isLoading"
      class="bg-white/80 dark:bg-[#15221E] rounded-2xl p-6 border border-gray-100/80 dark:border-emerald-900/30 shadow-xs flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left transition-colors duration-200"
    >
      <div class="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#104E35] dark:text-[#34D399] flex items-center justify-center shrink-0">
        <Clock class="w-5 h-5" />
      </div>
      <div>
        <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">Aucun trajet récent</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">Vos trajets effectués et leurs économies de CO₂ s'afficheront ici.</p>
      </div>
    </div>

    <!-- Liste des 5 derniers trajets -->
    <div v-else class="flex flex-col gap-2.5">
      <div
        v-for="trip in recentTrips"
        :key="trip.id"
        @click="openDetailModal(trip)"
        class="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#F8FAF9] dark:bg-[#15221E] hover:bg-[#F0F5F2] dark:hover:bg-[#1B2F29] border border-gray-100/70 dark:border-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-700/50 cursor-pointer transition-all duration-150 group"
      >
        <div class="flex items-center gap-3.5 min-w-0">
          <!-- Icône mode dans cercle vert foncé -->
          <div class="w-10 h-10 rounded-full bg-[#104E35] dark:bg-[#1B4D3E] flex items-center justify-center text-white dark:text-[#A7F3D0] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <component :is="getModeIcon(trip.mode)" class="w-5 h-5" />
          </div>

          <!-- Nom et Date -->
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
              {{ trip.end_name || trip.end_point }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ formatTripDate(trip.timestamp || trip.completed_at) }}
            </span>
          </div>
        </div>

        <!-- Badge CO2 économisé -->
        <div class="flex items-center shrink-0 ml-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C6F0DB] dark:bg-[#1C4D38] text-xs font-bold text-[#104E35] dark:text-[#A7F3D0]">
            <Leaf class="w-3.5 h-3.5" />
            <span>{{ formatCo2Value(trip.co2_saved_kg) }} saved</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Pop-up Détail du trajet sélectionné -->
    <TripDetailModal
      :is-open="isDetailModalOpen"
      :trip="selectedTrip"
      @close="isDetailModalOpen = false"
    />

    <!-- Pop-up Voir tout les trajets -->
    <AllTripsModal
      :is-open="isAllTripsModalOpen"
      :trips="allTrips.length > 0 ? allTrips : recentTrips"
      @close="isAllTripsModalOpen = false"
      @select="handleSelectFromAllModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  Clock,
  Leaf,
  Footprints,
  Bike,
  Bus,
  Train,
  Car,
} from 'lucide-vue-next';
import { useTrips } from '~/composables/useTrips';
import type { UserTrip } from '~/types/trip';
import { formatCo2 } from '~/utils/itinerary.helpers';
import TripDetailModal from './TripDetailModal.vue';
import AllTripsModal from './AllTripsModal.vue';

const { recentTrips, allTrips, isLoading, fetchRecentTrips } = useTrips();

const isDetailModalOpen = ref(false);
const isAllTripsModalOpen = ref(false);
const selectedTrip = ref<UserTrip | null>(null);

function formatCo2Value(kg?: number | null) {
  return formatCo2(kg);
}

function formatTripDate(timestamp?: string) {
  if (!timestamp) return "Aujourd'hui";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "Aujourd'hui";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Aujourd'hui, ${timeStr}`;
  }

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Hier, ${timeStr}`;
  }

  return `${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}, ${timeStr}`;
}

function getModeIcon(mode?: string) {
  switch (mode?.toUpperCase()) {
    case 'BICYCLE':
    case 'BIKE':
      return Bike;
    case 'BUS':
      return Bus;
    case 'SUBWAY':
    case 'METRO':
    case 'TRAM':
    case 'TRANSIT':
      return Train;
    case 'CAR':
      return Car;
    case 'WALK':
    default:
      return Footprints;
  }
}

function openDetailModal(trip: UserTrip) {
  selectedTrip.value = trip;
  isDetailModalOpen.value = true;
}

function openAllTripsModal() {
  fetchRecentTrips(20);
  isAllTripsModalOpen.value = true;
}

function handleSelectFromAllModal(trip: UserTrip) {
  isAllTripsModalOpen.value = false;
  openDetailModal(trip);
}

onMounted(() => {
  fetchRecentTrips(5);
});
</script>
