<template>
  <div class="max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 pb-10">
    <!-- Header Home : Bonjour, <nom> + Avatar dynamique -->
    <HeaderHome :profile="profile" :is-loading="isLoading" />

    <!-- Section Statistiques CO2 & Défis -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-3">
        <Co2StatsCard />
      </div>
    </div>

    <!-- Section Graphique Consommation Hebdomadaire CO2 (Nuxt Charts) -->
    <div class="w-full">
      <WeeklyCo2Chart />
    </div>

    <!-- Section Favoris & Trajets récents -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Section Favoris : Prêt à partir ? -->
      <FavoritesSection class="lg:col-span-2" />
  
      <!-- Section Trajets récents -->
      <RecentTripsSection class="lg:col-span-1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import HeaderHome from '~/components/header/HeaderHome.vue';
import Co2StatsCard from '~/components/home/Co2StatsCard.vue';
import WeeklyCo2Chart from '~/components/home/WeeklyCo2Chart.vue';
import FavoritesSection from '~/components/home/FavoritesSection.vue';
import RecentTripsSection from '~/components/home/RecentTripsSection.vue';
import { useUserProfile } from '~/composables/useUserProfile';

definePageMeta({
  middleware: 'auth',
});

const { profile, isLoading, loadProfile } = useUserProfile();

onMounted(() => {
  loadProfile();
});
</script>