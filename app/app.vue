<script setup>
const geo = useGeoStore()

</script>

<template>
  <div>
    <UApp>
      <NuxtPage :lat="geo.lat" :lng="geo.lng"  />
    </UApp>
  </div>
</template>
