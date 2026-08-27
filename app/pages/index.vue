<template>
  <div class="max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 pb-10">
    <!-- Header Home : Bonjour, <nom> + Avatar dynamique -->
    <HeaderHome :profile="profile" :is-loading="isLoading" />

    <!-- Section Statistiques & Défis -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Encart Vert : Stats CO2 évité -->
      <div class="lg:col-span-3">
        <Co2StatsCard />
      </div>
    </div>

    <!-- Section Favoris : Prêt à partir ? -->
    <FavoritesSection />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import HeaderHome from '~/components/header/HeaderHome.vue';
import Co2StatsCard from '~/components/home/Co2StatsCard.vue';
import FavoritesSection from '~/components/home/FavoritesSection.vue';
import { useUserProfile } from '~/composables/useUserProfile';

definePageMeta({
  middleware: 'auth',
});

const { profile, isLoading, loadProfile } = useUserProfile();

onMounted(() => {
  loadProfile();
});
</script>