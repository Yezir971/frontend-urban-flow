<script setup lang="ts">


interface ResponsePlan {
    itineraries: Array<{
        duration: number;
        legs: Array<{
            mode: string;
            distance: number;
            startTime: number;
            endTime: number;
            from: {
                name: string;
            };
            to: {
                name: string;
            };
            legGeometry: {
                points: string
            };
            route: any; 
        }>;
    }>;
}


interface ResponseTrip {
    data : {
        plan: ResponsePlan;
    }
}

const props = defineProps({
    start: String, 
    end: String,
    planning: Object as () => ResponseTrip | null
})
const emit = defineEmits(['update:start', 'update:end', 'update:planning'])

const localStart = ref(props.start)
const localEnd = ref(props.end)
const planning = ref(props.planning)

const onSearch = async () => {
    emit('update:start', localStart.value);
    emit('update:end', localEnd.value);
    let [cordStartx, cordStarty] = await geoloc(localStart?.value ?? "")
    let [cordEndx, cordEndy] = await geoloc(localEnd?.value ?? "")
    console.log("cordStartx : " + cordStartx + " cordStarty : " + cordStarty)
    console.log("cordEndx : " + cordEndx + " cordEndy : " + cordEndy)
    let result : ResponseTrip = await planTrip({lon : cordStartx! , lat : cordStarty!}, {lon : cordEndx!, lat : cordEndy!}, ["WALK"])

    planning.value = result;
    emit('update:planning', result);
    return planning
}


</script>
<template>
    <main>
        <form @submit.prevent="onSearch" action="" class="mx-auto flex flex-col w-1/3 gap-4 bg-black rounded-lg p-4">
            <div class="flex flex-col gap-3">
                <input class="bg-surface-container-low p-2" type="text" v-model="localStart" placeholder="Localisation">
                <input class="bg-surface-container-low p-2" type="text" v-model="localEnd" placeholder="Destination">
            </div>
            <button type="submit" class="bg-primary text-on-primary rounded-lg p-2">Rechercher</button>
        </form>
        <p class="text-red">temps en s : {{ planning?.data?.plan?.itineraries?.[0]?.duration }}</p>
        <p class="text-red">distance en m : {{ planning?.data?.plan?.itineraries?.[0]?.legs?.[0]?.distance }}</p>
        <ClientOnly>
            <MapLeafet v-if="planning" :otpData="planning" />
        </ClientOnly>
    </main>

</template>


