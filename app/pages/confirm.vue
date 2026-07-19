<script setup lang="ts">
import { watch } from 'vue';

const user = useSupabaseUser();

watch(user, () => {
  if (user.value) {
    return navigateTo('/');
  }
}, { immediate: true });
</script>

<template>
  <div class="min-h-screen bg-[#F4F5F6] flex flex-col items-center justify-center p-4">
    <div class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F5238]"></div>
      <p class="text-sm text-gray-500 font-semibold">Chargement en cours...</p>
    </div>
  </div>
</template>
