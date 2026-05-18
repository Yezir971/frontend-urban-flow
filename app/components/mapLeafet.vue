<template>
  <div class="map-container">
    <ClientOnly>
      <div id="map" ref="mapElement"></div>
      <template #fallback>
        <div class="loading">Chargement de la carte...</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import polyline from '@mapbox/polyline'

const props = defineProps({
  otpData: {
    type: Object,
    required: true
  }
})

const mapElement = ref(null)
let map = null

onMounted(async () => {
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  map = L.map(mapElement.value).setView([0, 0], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  const legs = props.otpData?.data?.plan?.itineraries[0]?.legs || []
  const allCoordinates = []

  legs.forEach(leg => {
    const encodedPoints = leg.legGeometry.points
    if (!encodedPoints) return

    const coordinates = polyline.decode(encodedPoints)
    allCoordinates.push(...coordinates)

    let routeColor = '#3388ff'
    if (leg.mode === 'foot') routeColor = '#00a86b'
    if (leg.mode === 'bus') routeColor = '#ff5f00'

    const polylineLayer = L.polyline(coordinates, {
      color: routeColor,
      weight: 5,
      opacity: 0.8
    }).addTo(map)

    polylineLayer.bindPopup(`<b>${leg.mode}</b> - ${Math.round(leg.distance)}m`)
  })

  if (allCoordinates.length > 0) {
    const bounds = L.latLngBounds(allCoordinates)
    map.fitBounds(bounds, { padding: [50, 50] }) 
  }
})
</script>

<style scoped>
#map {
  width: 100%;
  height: 500px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.loading {
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
}
</style>