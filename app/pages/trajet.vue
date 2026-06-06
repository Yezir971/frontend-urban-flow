<script setup lang="ts">
import type { ResponseTrip } from '~/types/plan';
import { ref } from 'vue'
import { useGeoStore } from '~/stores/geo';

const sheetRef = ref<{ open: () => void } | null>(null)
const geo = useGeoStore()
function openSheet() {
  sheetRef.value?.open()
}

export interface LocationData {
    name: string;
    lat: number;
    lon: number;
    otpValue: [number, number];
}

const startCoordinates = ref([0,0])
const endCoordinates = ref([0,0])

const setStartLocation = (locationDataStart: LocationData) => {
  console.log("Prêt pour OTP :", locationDataStart.otpValue)
  startCoordinates.value = locationDataStart.otpValue
}

const setEndLocation = (locationDataEnd: LocationData) => {
  console.log("Prêt pour OTP :", locationDataEnd.otpValue)
  endCoordinates.value = locationDataEnd.otpValue
}



const props = defineProps({
    start: String, 
    end: String,
    planning: Object as () => ResponseTrip | null
})
const emit = defineEmits(['update:start', 'update:end', 'update:planning'])

// const localStart = ref(props.start)
// const localEnd = ref(props.end)
const planning = ref(props.planning)

const onSearch = async () => {
    let result : ResponseTrip = await planTrip({lon : startCoordinates.value?.[0]! , lat : startCoordinates.value?.[1]!}, {lon : endCoordinates.value?.[0]!, lat : endCoordinates.value?.[1]!}, ["WALK"])

    planning.value = result;
    emit('update:planning', result);
    return planning
}


</script>
<template>
    <main>
        <button @click="openSheet">Open Bottom Sheet</button>

        <BottomSheet :hideScrollbar="true" :darkMode="true" ref="sheetRef" :overlay="false" :canSwipeClose="false">
            <template #header>
                <h3>Bottom Sheet Header</h3>
            </template>
            <template #default>
                <form @submit.prevent="onSearch" action="" class="mx-auto flex flex-col gap-4 bg-black rounded-lg p-4">
                    <div class="flex flex-col gap-3">
                        <PhotonAutocomplete  :activateCurrentPosition=true @location-selected="setStartLocation" placeholder="Localisation" />
                        <PhotonAutocomplete @location-selected="setEndLocation" placeholder="Destination" />
                    </div>
                    <button type="submit" class="bg-primary text-on-primary rounded-lg p-2">Rechercher</button>
                </form>
            </template>
        </BottomSheet>  



        <p class="text-red">temps en s : {{ planning?.data?.plan?.itineraries?.[0]?.duration }}</p>
        <p class="text-red">distance en m : {{ planning?.data?.plan?.itineraries?.[0]?.legs?.[0]?.distance }}</p>
        <ClientOnly>
            <MapLeafet v-if="planning" :otpData="planning" />
        </ClientOnly>
    </main>

    <p>Latitude : {{ geo.lat }}</p>
    <p>Longitude : {{ geo.lng }}</p>
    <p v-if="!geo.isTracking">Tracking inactif</p>
    <USwitch v-model="geo.isTracking" :label="geo.isTracking ? 'Tracking actif' : 'Tracking inactif'" />

</template>


