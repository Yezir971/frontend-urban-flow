<template>
  <div class="map-container w-full h-full relative">
    <ClientOnly>
      <div id="map" ref="mapElement" class="w-full h-full absolute inset-0"></div>
      <template #fallback>
        <div class="loading flex items-center justify-center w-full h-full bg-[#f3f5f4] text-gray-500">
          Chargement de la carte...
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { mapGeometryToLeafletPoints } from '~/utils/geometry'
import { useNavigationStore } from '~/stores/navigation'
import { useGeoStore } from '~/stores/geo'

const props = defineProps({
  otpData: {
    type: Object,
    required: false,
    default: null,
  },
})

const mapElement = ref<HTMLElement | null>(null)
const navStore = useNavigationStore()
const geoStore = useGeoStore()

let map: any = null
let routeLayerGroup: any = null
let markerLayerGroup: any = null
let userMarker: any = null
let LInstance: any = null

/**
 * Crée ou met à jour le marqueur GPS de position utilisateur (Curseur bleu pulsant)
 */
const updateUserMarker = (L: any, lat: number, lng: number) => {
  if (!map || !markerLayerGroup) return

  const customPulsingIcon = L.divIcon({
    className: 'custom-user-marker-container',
    html: `
      <div class="user-position-marker">
        <div class="user-position-pulse"></div>
        <div class="user-position-core"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  if (!userMarker) {
    userMarker = L.marker([lat, lng], {
      icon: customPulsingIcon,
      zIndexOffset: 1000,
    }).addTo(markerLayerGroup)
  } else {
    userMarker.setLatLng([lat, lng])
  }

  // Si la navigation guidée est en cours, centrage dynamique et fluide sur la position
  if (navStore.isActive) {
    map.panTo([lat, lng], { animate: true, duration: 0.6 })
  }
}

/**
 * Dessine le tracé polyline et les marqueurs de départ / arrivée
 */
const drawLine = (L: any, geometryData: any) => {
  if (!map || !routeLayerGroup) return

  // Nettoyage des anciens tracés
  routeLayerGroup.clearLayers()

  const points = mapGeometryToLeafletPoints(geometryData)
  if (!points || points.length === 0) return

  // Tracé polyline
  const polylineLayer = L.polyline(points, {
    color: '#0F5238',
    weight: 6,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round',
  }).addTo(routeLayerGroup)

  // Marqueur Départ (Point Vert)
  const startPoint = points[0]
  if (startPoint) {
    const startIcon = L.divIcon({
      className: 'start-pin-container',
      html: `<div class="w-4 h-4 rounded-full bg-white border-3 border-[#0F5238] shadow-md"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })
    L.marker(startPoint, { icon: startIcon }).addTo(routeLayerGroup)
  }

  // Marqueur Arrivée (Point Destination Rouge / Foncé)
  const endPoint = points[points.length - 1]
  if (endPoint) {
    const endIcon = L.divIcon({
      className: 'end-pin-container',
      html: `<div class="w-5 h-5 rounded-full bg-[#e11d48] border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-black">●</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
    L.marker(endPoint, { icon: endIcon }).addTo(routeLayerGroup)
  }

  // Si navigation non active, ajustement des bornes pour voir tout le tracé
  if (!navStore.isActive) {
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [50, 50] })
  }

  return polylineLayer
}

onMounted(async () => {
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')
  LInstance = L

  if (!mapElement.value) return

  // Contraintes de Bounding Box de la Métropole de Lyon
  const lyonBounds = L.latLngBounds(
    L.latLng(45.65, 4.70), // Sud-Ouest
    L.latLng(45.88, 4.95), // Nord-Est
  )

  map = L.map(mapElement.value, {
    maxBounds: lyonBounds,
    maxBoundsViscosity: 0.9,
    minZoom: 11,
    zoomControl: false,
  }).setView([45.76, 4.83], 13)

  // Contrôle de zoom
  L.control.zoom({ position: 'bottomright' }).addTo(map)

  // Couche CartoDB / OSM
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map)

  routeLayerGroup = L.layerGroup().addTo(map)
  markerLayerGroup = L.layerGroup().addTo(map)

  if (props.otpData) {
    drawLine(L, props.otpData)
  }

  // Initialisation de la position de l'utilisateur si disponible
  if (navStore.currentPosition) {
    updateUserMarker(L, navStore.currentPosition[0], navStore.currentPosition[1])
  } else if (geoStore.lat && geoStore.lng) {
    updateUserMarker(L, geoStore.lat, geoStore.lng)
  }

  // Écoute de l'itinéraire
  watch(
    () => props.otpData,
    (newData) => {
      if (newData) {
        drawLine(L, newData)
      } else {
        routeLayerGroup?.clearLayers()
      }
    },
    { deep: true },
  )

  // Écoute de la position de navigation
  watch(
    () => navStore.currentPosition,
    (newPos) => {
      if (newPos) {
        updateUserMarker(L, newPos[0], newPos[1])
      }
    },
  )

  // Écoute du GPS réel quand navigation non simulée
  watch(
    () => [geoStore.lat, geoStore.lng],
    ([lat, lng]) => {
      if (lat && lng && !navStore.isSimulating) {
        updateUserMarker(L, lat, lng)
        if (navStore.isActive) {
          navStore.checkUserPosition([lat, lng])
        }
      }
    },
  )
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style>
/* Style global pour le marqueur GPS pulsant Leaflet */
.custom-user-marker-container {
  background: transparent !important;
  border: none !important;
}

.user-position-marker {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-position-core {
  width: 14px;
  height: 14px;
  background-color: #2563eb;
  border: 3px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  z-index: 2;
  position: relative;
}

.user-position-pulse {
  position: absolute;
  width: 28px;
  height: 28px;
  background-color: rgba(37, 99, 235, 0.35);
  border-radius: 50%;
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  z-index: 1;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  70% {
    transform: scale(1.6);
    opacity: 0.3;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>

<style scoped>
.map-container {
  min-height: 350px;
}
.loading {
  min-height: 350px;
}
</style>