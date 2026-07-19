<script setup lang="ts">
import NavigationBar from '~/components/NavigationBar.vue';
</script>

<template>
  <div class="min-h-screen bg-[#F7F9F8] text-gray-800 md:gap-8">
    <NavigationBar />

    <!-- Zone principale pour le contenu de la page -->
    <!-- md:pl-64 décale le contenu vers la droite pour laisser la place à la Sidebar sur desktop -->
    <!-- pb-28 évite que la barre du bas ne chevauche le contenu sur mobile -->
    <div class="transition-all duration-300 pb-28 md:pb-0 md:pl-64 min-h-screen">
      <div class="p-4 md:p-8 max-w-7xl mx-auto">
        <slot />
      </div>
    </div>
  </div>
</template>