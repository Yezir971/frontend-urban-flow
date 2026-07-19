<script setup>
const geo = useGeoStore()

</script>


<template>
  <VitePwaManifest />
  <div class="bg-surface h-screen">
    <UApp>
      <NuxtLayout>
        <NuxtPage :lat="geo.lat" :lng="geo.lng" />
      </NuxtLayout>
    </UApp>
  </div>
</template>
