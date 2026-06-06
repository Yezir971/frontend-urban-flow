<script setup>
const geo = useGeoStore()
onMounted(() => geo.startTracking())
onUnmounted(() => geo.stopTracking())
</script>

<template>
  <div>
    <UApp>
      <NuxtPage :lat="geo.lat" :lng="geo.lng"  />
    </UApp>
  </div>
</template>
