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
import { ref, onMounted, watch } from 'vue'
import { mapGeometryToLeafletPoints } from '~/utils/geometry'

const props = defineProps({
  otpData: {
    type: Object,
    required: false,
    default: null
  }
})

const mapElement = ref<HTMLElement | null>(null)
let map: any = null
let routeLayerGroup: any = null

/**
 * Mappe la géométrie retournée par l'API et dessine le tracé polyline violet (#6366f1) sur Leaflet
 */
const drawLine = (L: any, geometryData: any) => {
  if (!map || !routeLayerGroup) return

  // Nettoyage des anciens tracés
  routeLayerGroup.clearLayers()

  // Conversion/Mapping des coordonnées [lon, lat] ou Polyline string vers [lat, lon] Leaflet
  const points = mapGeometryToLeafletPoints(geometryData)
  if (!points || points.length === 0) return

  // Tracé polyline violet (#6366f1)
  const polylineLayer = L.polyline(points, {
    color: '#6366f1',
    weight: 6,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(routeLayerGroup)

  // Ajustement du centrage et du zoom de la carte sur la ligne tracée
  const bounds = L.latLngBounds(points)
  map.fitBounds(bounds, { padding: [50, 50] })

  return polylineLayer
}

onMounted(async () => {
  // Chargement dynamique de Leaflet pour compatibilité SSR Nuxt 3/4
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  if (!mapElement.value) return

  // Contraintes de Bounding Box de la Métropole de Lyon
  const lyonBounds = L.latLngBounds(
    L.latLng(45.70, 4.77), // Sud-Ouest
    L.latLng(45.82, 4.90)  // Nord-Est
  )

  map = L.map(mapElement.value, {
    maxBounds: lyonBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 12,
    zoomControl: false
  }).setView([45.76, 4.83], 13)

  // Contrôle de zoom
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map)

  // Couche OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  // Groupe de calques pour le tracé d'itinéraire
  routeLayerGroup = L.layerGroup().addTo(map)

  // Tracé initial
  if (props.otpData) {
    drawLine(L, props.otpData)
  }

  // Écoute dynamique des modifications d'itinéraire
  watch(
    () => props.otpData,
    (newData) => {
      if (newData) {
        drawLine(L, newData)
      } else {
        routeLayerGroup?.clearLayers()
      }
    },
    { deep: true }
  )
})
</script>

<style scoped>
.map-container {
  min-height: 350px;
}
.loading {
  min-height: 350px;
}
</style>