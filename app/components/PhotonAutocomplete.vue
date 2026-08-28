<script setup lang="ts">
import { ref } from 'vue'
import type { LocationDataPhoton, ResponseFeaturePhoton } from '../types/photon'
import { MapPin, Navigation, Loader2 } from 'lucide-vue-next'

const query = defineModel<string>({ default: '' })
const results = ref<ResponseFeaturePhoton[]>([])
const isLoading = ref(false)
let timeout: ReturnType<typeof setTimeout> | null = null

const isFocused = ref(false)
const handleBlur = () => {
  // Petit délai de sécurité pour permettre la sélection
  setTimeout(() => {
    isFocused.value = false
  }, 250)
}

// Permet au composant parent d'écouter l'événement quand un lieu est choisi
const emit = defineEmits(['location-selected'])

defineProps({
  placeholder: {
    type: String,
    default: 'Rechercher une adresse...',
  },
  activateCurrentPosition: {
    type: Boolean,
    default: false
  }
})

let defaultPosition: ResponseFeaturePhoton = {    
  properties: {
    name: "Ma position actuelle",
    street: "",
    postcode: "",
    city: "Lyon",
    country: "France",
    osm_id: 0,
  },
  geometry: {
    coordinates: [4.84, 45.76],
  }
}

// Formater le texte secondaire pour qu'il soit lisible
const formatDetails = (properties: ResponseFeaturePhoton['properties']) => {
  const parts = []
  if (properties.street && properties.name !== properties.street) {
    if (properties.housenumber) {
      parts.push(`${properties.housenumber} ${properties.street}`)
    } else {
      parts.push(properties.street)
    }
  }
  if (properties.postcode) parts.push(properties.postcode)
  if (properties.city) parts.push(properties.city)
  return parts.join(', ')
}

const onSearch = () => {
  const config = useRuntimeConfig()
  clearTimeout(timeout as ReturnType<typeof setTimeout>)

  if (!query.value || query.value.trim().length < 2) {
    results.value = []
    isLoading.value = false
    return
  }

  isLoading.value = true

  timeout = setTimeout(async () => {
    try {
      const photonBase = (config.public.urlPhoton || 'https://photon.komoot.io').replace(/\/$/, '')
      const targetUrl = photonBase.endsWith('/api') ? photonBase : `${photonBase}/api`

      // Recherche restreinte et biaisée sur la métropole de Lyon (BBox + Lat/Lon)
      const response = await $fetch<{ features: ResponseFeaturePhoton[] }>(targetUrl, {
        query: {
          q: query.value.trim(),
          limit: 12,
          lang: 'fr',
          lat: 45.7600,
          lon: 4.8400,
          bbox: '4.65,45.58,5.15,45.95'
        }
      })

      const rawFeatures = response.features || []

      // Filtre strict sur la région lyonnaise (BBox Métropole de Lyon ou Code Postal 69 / Ville de Lyon)
      const lyonFeatures = rawFeatures.filter((feat) => {
        const coords = feat.geometry?.coordinates
        if (!coords || coords.length < 2) return false
        const lon = coords[0]
        const lat = coords[1]

        const inBbox = lon >= 4.65 && lon <= 5.15 && lat >= 45.55 && lat <= 45.95
        const p = feat.properties || {}
        const inRhone =
          p.postcode?.startsWith('69') ||
          p.city?.toLowerCase()?.includes('lyon') ||
          p.city?.toLowerCase()?.includes('villeurbanne') ||
          p.city?.toLowerCase()?.includes('caluire') ||
          p.city?.toLowerCase()?.includes('venissieux') ||
          p.city?.toLowerCase()?.includes('vaulx') ||
          p.city?.toLowerCase()?.includes('bron') ||
          p.city?.toLowerCase()?.includes('oullins') ||
          p.state?.toLowerCase()?.includes('rhône')

        return inBbox || inRhone
      })

      results.value = lyonFeatures.slice(0, 6)
    } catch (error) {
      console.error('Erreur Photon autocomplete:', error)
      results.value = []
    } finally {
      isLoading.value = false
    }
  }, 250)
}

const selectLocation = async (feature: ResponseFeaturePhoton, isCurrentPosition: boolean = false) => {
  let lat: number | null = feature.geometry.coordinates[1]
  let lon: number | null = feature.geometry.coordinates[0]
  
  const mainName = feature.properties.name || feature.properties.street || ''
  const details = formatDetails(feature.properties)
  const fullLabel = details ? `${mainName}, ${details}` : mainName
  let name = fullLabel

  if (isCurrentPosition) {
    query.value = "Récupération de votre position..."
    const geo = useGeoStore()
    try {
      geo.startTracking()
      lat = geo.lat
      lon = geo.lng
      name = "Ma position actuelle"
    } catch (error) {
      console.error("Erreur de géolocalisation:", error)
      query.value = ""
      alert("Impossible de récupérer votre position. Vérifiez vos autorisations.")
      return
    }
  }

  query.value = name
  results.value = [] // Ferme le menu déroulant
  isFocused.value = false
  
  const locationData: LocationDataPhoton = {
    name: name,
    lat: lat,
    lon: lon,
    otpValue: [lon, lat]
  }

  emit('location-selected', locationData)
}
</script>

<template>
  <div class="relative w-full">
    <!-- Champ de saisie -->
    <div class="relative flex items-center w-full">
      <input
        v-model="query"
        @input="onSearch"
        @focus="isFocused = true"
        @blur="handleBlur"
        type="text"
        :placeholder="placeholder"
        autocomplete="off"
        class="w-full bg-transparent py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none focus:outline-none pr-6"
      />
      <Loader2
        v-if="isLoading"
        class="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin absolute right-1 shrink-0"
      />
    </div>

    <!-- Menu déroulant des suggestions Photon (100% Lyon & Métropole) -->
    <ul
      v-if="isFocused && (results.length > 0 || (activateCurrentPosition && query.length >= 2))"
      class="absolute left-0 right-0 z-[9999] mt-2 bg-white dark:bg-[#15221E] border border-gray-200 dark:border-emerald-900/40 rounded-2xl shadow-2xl overflow-hidden py-1.5 max-h-60 overflow-y-auto"
    >
      <!-- Option : Ma position actuelle -->
      <li
        v-if="activateCurrentPosition && query.length >= 2"
        @mousedown.prevent="selectLocation(defaultPosition, true)"
        class="px-4 py-2.5 cursor-pointer hover:bg-emerald-50/70 dark:hover:bg-[#1B382C] flex items-center gap-2.5 transition-colors border-b border-gray-100 dark:border-emerald-950/40"
      >
        <Navigation class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span class="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{{ defaultPosition.properties.name }}</span>
      </li>

      <!-- Suggestions d'adresses retournées (Lyon & Métropole) -->
      <li
        v-for="result in results"
        :key="result.properties.osm_id"
        @mousedown.prevent="selectLocation(result)"
        class="px-4 py-2.5 cursor-pointer hover:bg-emerald-50/60 dark:hover:bg-[#1B382C] flex items-start gap-2.5 transition-colors border-b border-gray-50 dark:border-emerald-950/40 last:border-none"
      >
        <MapPin class="w-4 h-4 text-[#104e35] dark:text-[#34D399] shrink-0 mt-0.5" />
        <div class="flex flex-col min-w-0">
          <!-- Nom principal (ex: Place Bellecour, Rue de la République) -->
          <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
            {{ result.properties.name || result.properties.street }}
          </span>
          <!-- Détails (code postal, ville) -->
          <span class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ formatDetails(result.properties) }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>
