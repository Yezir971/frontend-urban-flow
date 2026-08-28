<template>
  <Teleport to="body">
    <div
      v-if="isOpen && trip"
      class="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      <!-- Backdrop sombre avec flou -->
      <div
        class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        @click="closeModal"
      />

      <!-- Conteneur Modal -->
      <div
        class="relative w-full max-w-lg bg-white dark:bg-[#15221E] rounded-[32px] shadow-2xl overflow-hidden transform transition-all flex flex-col z-10 my-auto border border-gray-100 dark:border-emerald-900/30 max-h-[90vh]"
      >
        <!-- En-tête avec Carte du tracé -->
        <div class="relative w-full h-52 sm:h-60 bg-[#E8ECE9] dark:bg-[#0F1A16] overflow-hidden">
          <!-- Mini carte Leaflet -->
          <ClientOnly>
            <div ref="mapContainer" class="w-full h-full absolute inset-0 z-0" />
            <template #fallback>
              <div class="w-full h-full flex items-center justify-center bg-[#E8ECE9] dark:bg-[#0F1A16] text-xs text-gray-400">
                Chargement de la carte...
              </div>
            </template>
          </ClientOnly>

          <!-- Bouton de fermeture en haut à droite -->
          <button
            type="button"
            @click="closeModal"
            class="absolute top-4 right-4 z-20 w-9 h-9 bg-white/90 dark:bg-[#1A2D25]/90 hover:bg-white dark:hover:bg-[#253E33] text-gray-700 dark:text-gray-200 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
            aria-label="Fermer la modal"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Badges de départ / arrivée superposés sur le bas de la carte -->
          <div class="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2 pointer-events-none">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-[#14231E]/95 text-xs font-semibold text-gray-800 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-emerald-900/40 backdrop-blur-sm truncate max-w-[48%]">
              <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span class="truncate">{{ trip.start_name || trip.start_point }}</span>
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-[#14231E]/95 text-xs font-semibold text-gray-800 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-emerald-900/40 backdrop-blur-sm truncate max-w-[48%]">
              <span class="w-2 h-2 rounded-full bg-[#104E35] dark:bg-[#34D399] shrink-0" />
              <span class="truncate">{{ trip.end_name || trip.end_point }}</span>
            </span>
          </div>
        </div>

        <!-- Contenu du trajet -->
        <div class="p-6 sm:p-7 flex flex-col gap-6 overflow-y-auto">
          <!-- Titre & Date -->
          <div class="flex flex-col">
            <h2 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
              Trajet {{ trip.end_name || trip.end_point }}
            </h2>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              {{ formattedTripDate }}
            </p>
          </div>

          <!-- 3 Badges Statistiques -->
          <div class="grid grid-cols-3 gap-2.5 sm:gap-3">
            <!-- TEMPS -->
            <div class="bg-[#F4F6F5] dark:bg-[#111C18] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Clock class="w-4 h-4 text-gray-500 dark:text-gray-400 mb-1" />
              <span class="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">TEMPS</span>
              <span class="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                {{ trip.duration_minutes || 1 }} min
              </span>
            </div>

            <!-- DISTANCE -->
            <div class="bg-[#F4F6F5] dark:bg-[#111C18] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <MapPin class="w-4 h-4 text-gray-500 dark:text-gray-400 mb-1" />
              <span class="text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">DISTANCE</span>
              <span class="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                {{ trip.distance_km || ((trip.distance_meters || 0) / 1000).toFixed(1) }} km
              </span>
            </div>

            <!-- CO2 ÉCONOMISÉ -->
            <div class="bg-[#C6F0DB] dark:bg-[#153D2C] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Leaf class="w-4 h-4 text-[#104E35] dark:text-[#34D399] mb-1" />
              <span class="text-[10px] font-bold tracking-wider text-[#104E35] dark:text-[#A7F3D0] uppercase">CO₂ ÉCONOMISÉ</span>
              <span class="text-sm sm:text-base font-extrabold text-[#104E35] dark:text-[#34D399] mt-0.5">
                {{ formatCo2Value(trip.co2_saved_kg) }}
              </span>
            </div>
          </div>

          <!-- DÉTAILS DE L'ITINÉRAIRE -->
          <div class="flex flex-col gap-3">
            <span class="text-[11px] font-extrabold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
              DÉTAILS DE L'ITINÉRAIRE
            </span>

            <div class="relative flex flex-col gap-4 pl-3 border-l-2 border-dashed border-emerald-300 dark:border-emerald-700/60 ml-3">
              <!-- Point de départ -->
              <div class="relative flex items-start justify-between gap-3">
                <span class="absolute -left-4.75 top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#15221E]" />
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                    Départ : {{ trip.start_name || trip.start_point }}
                  </span>
                  <span class="text-[11px] text-gray-500 dark:text-gray-400">Point d'origine</span>
                </div>
                <component :is="getModeIcon(trip.mode)" class="w-4 h-4 text-gray-400 dark:text-gray-400 shrink-0 mt-0.5" />
              </div>

              <!-- Étape Mode de transport -->
              <div class="relative flex items-start justify-between gap-3">
                <span class="absolute -left-4.75 top-1.5 w-3 h-3 rounded-full bg-[#104E35] dark:bg-[#34D399] ring-4 ring-white dark:ring-[#15221E]" />
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                    {{ getModeLabel(trip.mode, trip.line_name) }} • {{ trip.duration_minutes }} min
                  </span>
                  <span class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {{ trip.distance_km || ((trip.distance_meters || 0) / 1000).toFixed(1) }} km
                  </span>
                </div>
                <component :is="getModeIcon(trip.mode)" class="w-4 h-4 text-[#104E35] dark:text-[#34D399] shrink-0 mt-0.5" />
              </div>

              <!-- Point d'arrivée -->
              <div class="relative flex items-start justify-between gap-3">
                <span class="absolute -left-4.75 top-1.5 w-3 h-3 rounded-full bg-[#104E35] dark:bg-[#34D399] ring-4 ring-white dark:ring-[#15221E]" />
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                    Arrivée : {{ trip.end_name || trip.end_point }}
                  </span>
                  <span class="text-[11px] text-gray-500 dark:text-gray-400">Destination</span>
                </div>
                <MapPin class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              </div>
            </div>
          </div>

          <!-- Bouton Refaire ce trajet -->
          <button
            type="button"
            @click="redoTrip"
            class="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#104E35] dark:bg-[#1D6045] hover:bg-[#0D3E2A] dark:hover:bg-[#154D36] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#104E35]/20 hover:shadow-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw class="w-4 h-4" />
            <span>Refaire ce trajet</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  X,
  Clock,
  MapPin,
  Leaf,
  RotateCcw,
  Footprints,
  Bike,
  Bus,
  Train,
  Car,
} from 'lucide-vue-next';
import type { UserTrip } from '~/types/trip';
import { mapGeometryToLeafletPoints } from '~/utils/geometry';
import { formatCo2 } from '~/utils/itinerary.helpers';
import { useTheme } from '~/composables/useTheme';

const props = defineProps<{
  isOpen: boolean;
  trip: UserTrip | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const { isDark } = useTheme();
const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: any = null;
let polylineLayer: any = null;
let startMarker: any = null;
let endMarker: any = null;

function closeModal() {
  destroyMap();
  emit('close');
}

function destroyMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    polylineLayer = null;
    startMarker = null;
    endMarker = null;
  }
}

function formatCo2Value(kg?: number | null) {
  return formatCo2(kg);
}

const formattedTripDate = computed(() => {
  if (!props.trip?.timestamp && !props.trip?.completed_at) {
    return "Aujourd'hui";
  }
  const date = new Date(props.trip.timestamp || props.trip.completed_at);
  if (isNaN(date.getTime())) return "Aujourd'hui";

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  const dateStr = date.toLocaleDateString('fr-FR', options);
  const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  const timeStr = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${capitalizedDate} • Départ à ${timeStr}`;
});

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

function getModeLabel(mode?: string, lineName?: string | null) {
  const m = mode?.toUpperCase();
  if (lineName) return `Ligne ${lineName}`;
  if (m === 'BICYCLE' || m === 'BIKE') return 'Vélo';
  if (m === 'BUS') return 'Bus';
  if (m === 'SUBWAY' || m === 'METRO') return 'Métro';
  if (m === 'TRAM') return 'Tramway';
  if (m === 'TRANSIT') return 'Transports en commun';
  if (m === 'CAR') return 'Voiture';
  return 'Marche à pied';
}

function redoTrip() {
  if (!props.trip) return;

  const queryParams: Record<string, string> = {
    destination: props.trip.end_name || props.trip.end_point,
    lat: props.trip.end_lat.toString(),
    lon: props.trip.end_lon.toString(),
    name: props.trip.end_name || props.trip.end_point,
  };

  if (props.trip.start_name || props.trip.start_point) {
    queryParams.start = props.trip.start_name || props.trip.start_point;
  }
  if (props.trip.start_lat != null && props.trip.start_lon != null) {
    queryParams.start_lat = props.trip.start_lat.toString();
    queryParams.start_lon = props.trip.start_lon.toString();
  }

  closeModal();
  router.push({
    path: '/trajet',
    query: queryParams,
  });
}

// Initialisation robuste de la mini carte Leaflet
async function initMiniMap() {
  if (typeof window === 'undefined' || !props.isOpen || !props.trip) return;

  await nextTick();

  if (!mapContainer.value) return;

  const L = (await import('leaflet')).default;

  // Nettoyage préalable de l'ancienne instance de carte
  destroyMap();

  if (!mapContainer.value) return;

  mapInstance = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
  });

  // Fond de carte OpenStreetMap (100% libre et sans clé API)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(mapInstance);

  const startLat = Number(props.trip.start_lat);
  const startLon = Number(props.trip.start_lon);
  const endLat = Number(props.trip.end_lat);
  const endLon = Number(props.trip.end_lon);

  const startCoord: [number, number] = [
    !isNaN(startLat) && startLat !== 0 ? startLat : 45.7606,
    !isNaN(startLon) && startLon !== 0 ? startLon : 4.859,
  ];
  const endCoord: [number, number] = [
    !isNaN(endLat) && endLat !== 0 ? endLat : 45.7578,
    !isNaN(endLon) && endLon !== 0 ? endLon : 4.8322,
  ];

  let points: [number, number][] = [];

  if (props.trip.trace) {
    try {
      points = mapGeometryToLeafletPoints(props.trip.trace);
    } catch {
      points = [startCoord, endCoord];
    }
  }

  if (!points || points.length < 2) {
    points = [startCoord, endCoord];
  }

  // Tracé polyline
  polylineLayer = L.polyline(points, {
    color: isDark.value ? '#34D399' : '#104E35',
    weight: 5,
    dashArray: '6, 8',
    opacity: 0.95,
  }).addTo(mapInstance);

  // Marqueurs de départ et arrivée
  const startIcon = L.divIcon({
    className: 'custom-map-marker-start',
    html: '<div style="background-color: #10B981; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  const endIcon = L.divIcon({
    className: 'custom-map-marker-end',
    html: `<div style="background-color: ${isDark.value ? '#34D399' : '#104E35'}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.45);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  startMarker = L.marker(points[0] || startCoord, { icon: startIcon }).addTo(mapInstance);
  endMarker = L.marker(points[points.length - 1] || endCoord, { icon: endIcon }).addTo(mapInstance);

  const bounds = polylineLayer.getBounds();
  if (bounds.isValid()) {
    mapInstance.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 16,
    });
  } else {
    mapInstance.setView(startCoord, 13);
  }

  // Redimensionnement dynamique garanti
  setTimeout(() => {
    mapInstance?.invalidateSize();
  }, 150);
}

watch(
  () => [props.isOpen, props.trip],
  ([newOpen, newTrip]) => {
    if (newOpen && newTrip) {
      setTimeout(initMiniMap, 100);
    } else {
      destroyMap();
    }
  },
);

onBeforeUnmount(() => {
  destroyMap();
});
</script>

<style scoped>
:deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  background: #e8ece9;
}
</style>
