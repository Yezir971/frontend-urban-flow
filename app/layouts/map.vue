<script setup lang="ts">
import NavigationBar from '~/components/NavigationBar.vue';
</script>

<template>
  <div class="min-h-screen bg-[#F7F9F8] dark:bg-[#0B1311] text-gray-800 dark:text-gray-100 overflow-hidden relative transition-colors duration-200">
    <NavigationBar />

    <div class="transition-all pb-24 md:pb-0 md:pl-64 h-screen w-full">
      <slot />
    </div>
  </div>
</template>
