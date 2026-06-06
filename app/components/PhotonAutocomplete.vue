
<script setup lang="ts">
import { ref } from 'vue'
import type { LocationDataPhoton, ResponseFeaturePhoton } from '../types/photon'

const query = ref('')
const results = ref<ResponseFeaturePhoton[]>([])
let timeout : ReturnType<typeof setTimeout> | null = null

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

let defaultPostion : ResponseFeaturePhoton = {    
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
      // Photon returns an object with a `features` array
      const response = await $fetch<{ features: ResponseFeaturePhoton[]  }>(`${config.public.urlPhoton}`, {
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



const selectLocation = (feature: ResponseFeaturePhoton, isCurrentPosition: boolean = true) => {
  if (isCurrentPosition) {
    const geo = useGeoStore()
    console.log("Position actuelle sélectionnée :", geo.lat, geo.lng)
     // On prépare l'objet parfait pour OpenTripPlanner
     const locationData : LocationDataPhoton = {
      name: feature.properties.name || 'Ma position actuelle',
      lat: geo?.lat,
      lon: geo?.lng,
      otpValue: [geo?.lng, geo?.lat]
    }
    emit('location-selected', locationData)
  }
  // On met à jour l'input avec le nom formaté
  query.value = feature.properties.name || feature.properties.street || ''
  results.value = [] // On ferme le menu déroulant
  
  const [lon, lat] = feature.geometry.coordinates


  // On prépare l'objet parfait pour OpenTripPlanner
  const locationData : LocationDataPhoton = {
    name: query.value,
    lat: lat,
    lon: lon,
    otpValue: [lon, lat]
  }

  // On envoie les données au composant parent
  emit('location-selected', locationData)
}

</script>

<template>
  <div class="relative w-full max-w-md">
    <!-- Champ de recherche -->
    <input
      v-model="query"
      @input="onSearch"
      type="text"
      :placeholder=placeholder
      class="bg-surface-container-low p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-primary"
    />

    <!-- Liste des suggestions -->
    <ul
      v-if="results.length > 0"
      class="absolute z-10 w-full mt-1 bg-green-300 border border-gray-300 rounded shadow-lg"
    >
    <!-- Position actuelle -->
    <li
      v-if="activateCurrentPosition"
      @click="selectLocation(defaultPostion, true)"
      class="p-2 cursor-pointer hover:bg-gray-100 flex flex-col"
    >
        <span class="font-bold">{{ defaultPostion.properties.name }}</span>
      </li>
      <li
        v-for="result in results"
        :key="result.properties.osm_id"
        @click="selectLocation(result)"
        class="p-2 cursor-pointer hover:bg-gray-100 flex flex-col"
      >
        <!-- Nom principal (ex: Tour Eiffel ou Rue de Rivoli) -->
        <span class="font-bold">{{ result.properties.name || result.properties.street }}</span>
        <!-- Détails (ex: 75007 Paris, France) -->
        <span class="text-sm text-gray-500">{{ formatDetails(result.properties) }}</span>
      </li>
    </ul>
  </div>
</template>
