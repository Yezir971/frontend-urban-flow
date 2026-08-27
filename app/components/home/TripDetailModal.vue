<template>
  <Teleport to="body">
    <div
      v-if="isOpen && trip"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      <!-- Backdrop sombre avec flou -->
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        @click="closeModal"
      />

      <!-- Conteneur Modal -->
      <div
        class="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden transform transition-all flex flex-col z-10 my-auto border border-gray-100 max-h-[90vh]"
      >
        <!-- En-tête avec Carte du tracé -->
        <div class="relative w-full h-48 sm:h-56 bg-slate-100 overflow-hidden">
          <!-- Mini carte Leaflet -->
          <div ref="mapContainer" class="w-full h-full z-0" />

          <!-- Bouton de fermeture en haut à droite -->
          <button
            type="button"
            @click="closeModal"
            class="absolute top-4 right-4 z-20 w-9 h-9 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
            aria-label="Fermer la modal"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Badges de départ / arrivée superposés sur le bas de la carte -->
          <div class="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2 pointer-events-none">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-xs font-semibold text-gray-800 shadow-sm border border-gray-100 backdrop-blur-sm truncate max-w-[48%]">
              <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span class="truncate">{{ trip.start_name || trip.start_point }}</span>
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-xs font-semibold text-gray-800 shadow-sm border border-gray-100 backdrop-blur-sm truncate max-w-[48%]">
              <span class="w-2 h-2 rounded-full bg-[#104E35] shrink-0" />
              <span class="truncate">{{ trip.end_name || trip.end_point }}</span>
            </span>
          </div>
        </div>

        <!-- Contenu du trajet -->
        <div class="p-6 sm:p-7 flex flex-col gap-6 overflow-y-auto">
          <!-- Titre & Date -->
          <div class="flex flex-col">
            <h2 class="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              Trajet {{ trip.end_name || trip.end_point }}
            </h2>
            <p class="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              {{ formattedTripDate }}
            </p>
          </div>

          <!-- 3 Badges Statistiques -->
          <div class="grid grid-cols-3 gap-2.5 sm:gap-3">
            <!-- TEMPS -->
            <div class="bg-[#F4F6F5] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Clock class="w-4 h-4 text-gray-500 mb-1" />
              <span class="text-[10px] font-bold tracking-wider text-gray-500 uppercase">TEMPS</span>
              <span class="text-sm sm:text-base font-extrabold text-gray-900 mt-0.5">
                {{ trip.duration_minutes || 1 }} min
              </span>
            </div>

            <!-- DISTANCE -->
            <div class="bg-[#F4F6F5] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <MapPin class="w-4 h-4 text-gray-500 mb-1" />
              <span class="text-[10px] font-bold tracking-wider text-gray-500 uppercase">DISTANCE</span>
              <span class="text-sm sm:text-base font-extrabold text-gray-900 mt-0.5">
                {{ trip.distance_km || ((trip.distance_meters || 0) / 1000).toFixed(1) }} km
              </span>
            </div>

            <!-- CO2 ÉCONOMISÉ -->
            <div class="bg-[#C6F0DB] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Leaf class="w-4 h-4 text-[#104E35] mb-1" />
              <span class="text-[10px] font-bold tracking-wider text-[#104E35] uppercase">CO₂ ÉCONOMISÉ</span>
              <span class="text-sm sm:text-base font-extrabold text-[#104E35] mt-0.5">
                {{ formatCo2Value(trip.co2_saved_kg) }}
              </span>
            </div>
          </div>

          <!-- DÉTAILS DE L'ITINÉRAIRE -->
          <div class="flex flex-col gap-3">
            <span class="text-[11px] font-extrabold tracking-wider text-gray-500 uppercase">
              DÉTAILS DE L'ITINÉRAIRE
            </span>

            <div class="relative flex flex-col gap-4 pl-3 border-l-2 border-dashed border-emerald-300 ml-3">
              <!-- Point de départ -->
              <div class="relative flex items-start justify-between gap-3">
                <span class="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold text-gray-900 truncate">
                    Départ : {{ trip.start_name || trip.start_point }}
                  </span>
                  <span class="text-[11px] text-gray-500">Point d'origine</span>
                </div>
                <component :is="getModeIcon(trip.mode)" class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              </div>

              <!-- Étape Mode de transport -->
              <div class="relative flex items-start justify-between gap-3">
                <span class="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-[#104E35] ring-4 ring-white" />
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold text-gray-900 truncate">
                    {{ getModeLabel(trip.mode, trip.line_name) }} • {{ trip.duration_minutes }} min
                  </span>
                  <span class="text-[11px] text-gray-500 truncate">
                    {{ trip.distance_km || ((trip.distance_meters || 0) / 1000).toFixed(1) }} km
                  </span>
                </div>
                <component :is="getModeIcon(trip.mode)" class="w-4 h-4 text-[#104E35] shrink-0 mt-0.5" />
              </div>

              <!-- Point d'arrivée -->
              <div class="relative flex items-start justify-between gap-3">
                <span class="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full bg-[#104E35] ring-4 ring-white" />
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold text-gray-900 truncate">
                    Arrivée : {{ trip.end_name || trip.end_point }}
                  </span>
                  <span class="text-[11px] text-gray-500">Destination</span>
                </div>
                <MapPin class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              </div>
            </div>
          </div>

          <!-- Bouton Refaire ce trajet -->
          <button
            type="button"
            @click="redoTrip"
            class="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[#104E35] hover:bg-[#0D3E2A] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#104E35]/20 hover:shadow-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
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
import { normalizeGeometry } from '~/utils/geometry';
import { formatCo2 } from '~/utils/itinerary.helpers';

const props = defineProps<{
  isOpen: boolean;
  trip: UserTrip | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: any = null;
let polylineLayer: any = null;

function closeModal() {
  emit('close');
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

// Initialisation de la mini carte
async function initMiniMap() {
  if (typeof window === 'undefined' || !props.isOpen || !props.trip) return;

  await nextTick();
  const L = (await import('leaflet')).default;

  if (!mapContainer.value) return;

  if (!mapInstance) {
    mapInstance = L.map(mapContainer.value, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(mapInstance);
  }

  if (polylineLayer) {
    mapInstance.removeLayer(polylineLayer);
  }

  const startCoord: [number, number] = [props.trip.start_lat, props.trip.start_lon];
  const endCoord: [number, number] = [props.trip.end_lat, props.trip.end_lon];

  let points: [number, number][] = [];

  if (props.trip.trace) {
    try {
      points = normalizeGeometry(props.trip.trace);
    } catch {
      points = [startCoord, endCoord];
    }
  } else {
    points = [startCoord, endCoord];
  }

  // Ligne de tracé verte en pointillés
  polylineLayer = L.polyline(points, {
    color: '#104E35',
    weight: 4,
    dashArray: '6, 8',
    opacity: 0.9,
  }).addTo(mapInstance);

  // Marqueurs de départ et arrivée
  const startIcon = L.divIcon({
    className: 'custom-map-marker',
    html: '<div style="background-color: #10B981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  const endIcon = L.divIcon({
    className: 'custom-map-marker',
    html: '<div style="background-color: #104E35; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  L.marker(startCoord, { icon: startIcon }).addTo(mapInstance);
  L.marker(endCoord, { icon: endIcon }).addTo(mapInstance);

  mapInstance.fitBounds(polylineLayer.getBounds(), {
    padding: [30, 30],
  });
}

watch(
  () => [props.isOpen, props.trip],
  ([newOpen]) => {
    if (newOpen) {
      setTimeout(initMiniMap, 150);
    }
  },
);
</script>

<style scoped>
/* Assure le bon affichage de Leaflet */
:deep(.leaflet-container) {
  width: 100%;
  height: 100%;
}
</style>
