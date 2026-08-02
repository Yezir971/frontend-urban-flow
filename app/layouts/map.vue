<script setup lang="ts">
import NavigationBar from '~/components/NavigationBar.vue';
</script>

<template>
  <div class="min-h-screen bg-[#F7F9F8] text-gray-800 overflow-hidden relative">
    <NavigationBar />

    <div class="transition-all pb-24 md:pb-0 md:pl-64 h-screen w-full">
      <slot />
    </div>
  </div>
</template>
