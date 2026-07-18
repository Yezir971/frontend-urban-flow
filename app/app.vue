<script setup>
const geo = useGeoStore()

</script>


<template>
  <div class="bg-surface h-screen">
    <UApp>
      <NuxtLayout>
        <NuxtPage :lat="geo.lat" :lng="geo.lng" />
      </NuxtLayout>
    </UApp>
  </div>
</template>
