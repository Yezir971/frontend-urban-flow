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
import polyline from '@mapbox/polyline'

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

const drawRoute = (L: any) => {
  if (!map || !routeLayerGroup) return

  // Nettoyage des anciens tracés
  routeLayerGroup.clearLayers()

  if (!props.otpData) return

  const legs = props.otpData?.data?.plan?.itineraries?.[0]?.legs || []
  const allCoordinates: [number, number][] = []

  legs.forEach((leg: any) => {
    const encodedPoints = leg.legGeometry?.points
    if (!encodedPoints) return

    const coordinates = polyline.decode(encodedPoints)
    allCoordinates.push(...coordinates)

    // Code couleur selon le mode de transport
    let routeColor = '#104e35' // Vert forêt par défaut (WALK / foot)
    if (leg.mode === 'BUS' || leg.mode === 'bus') routeColor = '#ff5f00' // Orange pour les bus
    if (leg.mode === 'TRAIN' || leg.mode === 'rail' || leg.mode === 'SUBWAY') routeColor = '#0066cc' // Bleu pour les trains/métros
    if (leg.mode === 'BICYCLE' || leg.mode === 'bicycle') routeColor = '#95d4b3' // Vert clair pour les vélos

    const polylineLayer = L.polyline(coordinates, {
      color: routeColor,
      weight: 6,
      opacity: 0.85
    }).addTo(routeLayerGroup)

    polylineLayer.bindPopup(`<b>${leg.mode}</b> - ${Math.round(leg.distance)}m`)
  })

  // Centrage sur le tracé de l'itinéraire s'il y a des coordonnées
  if (allCoordinates.length > 0) {
    const bounds = L.latLngBounds(allCoordinates)
    map.fitBounds(bounds, { padding: [50, 50] })
  }
}

onMounted(async () => {
  // Chargement dynamique de Leaflet pour le SSR de Nuxt
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  if (!mapElement.value) return

  // Initialisation de la carte avec les contraintes Bounding Box imposées par la Métropole de Lyon
  // [[Sud-Ouest], [Nord-Est]]
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

  // Ajout du bouton de zoom en bas à droite
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map)

  // Couche de tuiles OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  // Groupe de calques pour le tracé d'itinéraire
  routeLayerGroup = L.layerGroup().addTo(map)

  // Tracé initial
  drawRoute(L)

  // Regarder les changements de l'itinéraire calculé
  watch(
    () => props.otpData,
    () => {
      drawRoute(L)
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