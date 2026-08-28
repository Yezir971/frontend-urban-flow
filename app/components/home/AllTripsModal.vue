<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-9998 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      <!-- Backdrop avec flou -->
      <div
        class="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        @click="closeModal"
      />

      <!-- Conteneur Modal -->
      <div
        class="relative w-full max-w-xl bg-white dark:bg-[#15221E] rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-hidden transform transition-all flex flex-col gap-6 z-10 my-auto border border-gray-100 dark:border-emerald-900/30 max-h-[85vh]"
      >
        <!-- En-tête -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              Historique des trajets récents
            </h2>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Consultez vos derniers trajets et leur bilan carbone
            </p>
          </div>
          <button
            type="button"
            @click="closeModal"
            class="w-9 h-9 bg-gray-100 dark:bg-[#1A2D25] hover:bg-gray-200 dark:hover:bg-[#253E33] text-gray-700 dark:text-gray-200 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Liste des trajets -->
        <div class="flex flex-col gap-3 overflow-y-auto pr-1">
          <div
            v-if="trips.length === 0"
            class="py-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2"
          >
            <Clock class="w-8 h-8 text-gray-300 dark:text-gray-600" />
            <p class="text-sm font-medium">Aucun trajet récent enregistré.</p>
          </div>

          <div
            v-for="trip in trips"
            :key="trip.id"
            @click="selectTrip(trip)"
            class="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#111C18] hover:bg-[#F0F5F2] dark:hover:bg-[#182B24] border border-gray-100 dark:border-emerald-950/40 hover:border-emerald-200 dark:hover:border-emerald-700/50 cursor-pointer transition-all duration-150 group"
          >
            <div class="flex items-center gap-3 min-w-0">
              <!-- Icône du mode dans un cercle vert foncé -->
              <div class="w-10 h-10 rounded-full bg-[#104E35] dark:bg-[#1B4D3E] flex items-center justify-center text-white dark:text-[#A7F3D0] shrink-0 group-hover:scale-105 transition-transform">
                <component :is="getModeIcon(trip.mode)" class="w-5 h-5" />
              </div>

              <!-- Titre et Date -->
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {{ trip.end_name || trip.end_point }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ formatTripDate(trip.timestamp || trip.completed_at) }} • {{ trip.duration_minutes }} min
                </span>
              </div>
            </div>

            <!-- Badge CO2 sauvé -->
            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C6F0DB] dark:bg-[#1C4D38] text-xs font-bold text-[#104E35] dark:text-[#A7F3D0]">
                <Leaf class="w-3 h-3" />
                {{ formatCo2Value(trip.co2_saved_kg) }} saved
              </span>
              <ChevronRight class="w-4 h-4 text-gray-400 dark:text-gray-400 group-hover:text-[#104E35] dark:group-hover:text-[#34D399] transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  X,
  Clock,
  Leaf,
  ChevronRight,
  Footprints,
  Bike,
  Bus,
  Train,
  Car,
} from 'lucide-vue-next';
import type { UserTrip } from '~/types/trip';
import { formatCo2 } from '~/utils/itinerary.helpers';

const props = defineProps<{
  isOpen: boolean;
  trips: UserTrip[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', trip: UserTrip): void;
}>();

function closeModal() {
  emit('close');
}

function selectTrip(trip: UserTrip) {
  emit('select', trip);
}

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
</script>
