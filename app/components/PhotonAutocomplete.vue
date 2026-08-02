<script setup lang="ts">
import { ref } from 'vue'
import type { LocationDataPhoton, ResponseFeaturePhoton } from '../types/photon'

const query = defineModel<string>({ default: '' })
const results = ref<ResponseFeaturePhoton[]>([])
let timeout: ReturnType<typeof setTimeout> | null = null

const isFocused = ref(false)
const handleBlur = () => {
  // Un délai de 200ms permet de s'assurer que le clic sur un élément de la liste soit bien pris en compte
  setTimeout(() => {
    isFocused.value = false
  }, 200)
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

let defaultPostion: ResponseFeaturePhoton = {    
  properties: {
    name: "Ma position actuelle",
    street: "",
    postcode: "",
    city: "",
    country: "",
    osm_id: 0,
  },
  geometry: {
    coordinates: [0, 0],
  }
}

// Formater le texte secondaire pour qu'il soit lisible
const formatDetails = (properties: ResponseFeaturePhoton['properties']) => {
  const parts = []
  if (properties.postcode) parts.push(properties.postcode)
  if (properties.city) parts.push(properties.city)
  if (properties.country) parts.push(properties.country)
  return parts.join(' ')
}

const onSearch = () => {
  const config = useRuntimeConfig()
  clearTimeout(timeout as ReturnType<typeof setTimeout>)

  timeout = setTimeout(async () => {
    if (query.value.length < 3) {
      results.value = []
      return
    }

    try {
      const response = await $fetch<{ features: ResponseFeaturePhoton[] }>(`${config.public.urlPhoton}`, {
        query: {
          q: query.value,
          limit: 5,
          lang: 'fr'
        }
      })
      console.log('Réponse Photon:', response.features)
      results.value = response.features || []
    } catch (error) {
      console.error('Erreur Photon:', error)
    }
  }, 300)
}

const selectLocation = async (feature: ResponseFeaturePhoton, isCurrentPosition: boolean = false) => {
  let lat: number | null = feature.geometry.coordinates[1]
  let lon: number | null = feature.geometry.coordinates[0]
  let name = feature.properties.name || feature.properties.street || ''

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
    <!-- Champ de recherche transparent avec texte gris foncé/noir conforme à la version desktop -->
    <input
      v-model="query"
      @input="onSearch"
      @focus="isFocused = true"
      @blur="handleBlur"
      type="text"
      :placeholder="placeholder"
      class="w-full bg-transparent py-1.5 text-sm text-gray-900 placeholder-gray-400 border-none outline-none focus:outline-none"
    />

    <!-- Liste des suggestions en blanc cassé -->
    <ul
      v-if="isFocused && (results.length > 0 || (activateCurrentPosition && query.length >= 3))"
      class="absolute left-0 right-0 z-50 mt-2 bg-[#FAF9F6] border border-gray-200/80 rounded-2xl shadow-xl overflow-hidden py-1.5"
    >
      <!-- Position actuelle -->
      <li
        v-if="activateCurrentPosition && query.length >= 3"
        @click="selectLocation(defaultPostion, true)"
        class="px-4 py-2.5 cursor-pointer hover:bg-[#F3F5F4] flex flex-col transition-all duration-150"
      >
        <span class="text-sm font-semibold text-gray-900">{{ defaultPostion.properties.name }}</span>
      </li>

      <!-- Suggestions Photon -->
      <li
        v-for="result in results"
        :key="result.properties.osm_id"
        @click="selectLocation(result)"
        class="px-4 py-2.5 cursor-pointer hover:bg-[#F3F5F4] flex flex-col transition-all duration-150 border-t border-gray-100/50 first:border-none"
      >
        <!-- Nom principal -->
        <span class="text-sm font-semibold text-gray-900">{{ result.properties.name || result.properties.street }}</span>
        <!-- Détails (code postal, ville, pays) -->
        <span class="text-xs text-gray-500 mt-0.5">{{ formatDetails(result.properties) }}</span>
      </li>
    </ul>
  </div>
</template>
