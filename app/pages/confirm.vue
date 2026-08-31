<script setup lang="ts">
import { watch } from 'vue';

definePageMeta({
  layout: 'auth',
});

useSeoMeta({
  title: 'Confirmation de connexion',
  robots: 'noindex, nofollow',
});

const user = useSupabaseUser();

watch(user, () => {
  if (user.value) {
    return navigateTo('/');
  }
}, { immediate: true });
</script>

<template>
  <div class="min-h-screen bg-[#F4F5F6] dark:bg-[#0B1311] flex flex-col items-center justify-center p-4 transition-colors duration-200">
    <div class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F5238] dark:border-[#34D399]"></div>
      <p class="text-sm text-gray-500 dark:text-gray-400 font-semibold">Validation de votre session...</p>
    </div>
  </div>
</template>
