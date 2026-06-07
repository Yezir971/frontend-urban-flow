<script setup>
const geo = useGeoStore()

</script>

<template >
  <div class="bg-surface h-screen " >
    <UApp >
      <NuxtPage :lat="geo.lat" :lng="geo.lng"  />
    </UApp>
  </div>
</template>
