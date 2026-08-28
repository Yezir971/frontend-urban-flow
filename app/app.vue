<script setup>
import { onMounted } from 'vue';
import { useGeoStore } from '~/stores/geo';
import { useTheme } from '~/composables/useTheme';

const geo = useGeoStore();
const { initTheme } = useTheme();

onMounted(() => {
  initTheme();
});
</script>

<template>
  <VitePwaManifest />
  <div class="bg-surface dark:bg-[#0B1311] min-h-screen text-[#191C1C] dark:text-[#E6EDE9] transition-colors duration-200">
    <UApp>
      <NuxtLayout>
        <NuxtPage :lat="geo.lat" :lng="geo.lng" />
      </NuxtLayout>
    </UApp>
  </div>
</template>
