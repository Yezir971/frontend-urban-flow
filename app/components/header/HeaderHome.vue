<template>
  <header class="w-full flex items-center justify-between py-2 sm:py-4">
    <!-- Salutation à gauche -->
    <div class="flex flex-col">
      <!-- État chargement skeleton -->
      <div v-if="isLoading && !profile" class="flex items-center gap-2">
        <div class="h-8 sm:h-9 w-44 bg-gray-200/80 dark:bg-gray-800 rounded-xl animate-pulse"></div>
      </div>

      <!-- Nom d'utilisateur dynamique -->
      <h1 v-else class="text-2xl sm:text-3xl font-extrabold text-[#0F5238] dark:text-[#34D399] tracking-tight leading-tight">
        Bonjour, {{ profile?.username || 'Voyageur' }}
      </h1>
    </div>

    <div>
      <!-- Sélecteur Thème Rapide -->
      

      <!-- Skeleton avatar -->
      <div
        v-if="isLoading && !profile"
        class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gray-200/80 dark:bg-gray-800 animate-pulse"
      ></div>

      <!-- Avatar cliquable -->
      <NuxtLink
        v-else
        to="/profil"
        class="relative block rounded-full group focus:outline-none focus:ring-2 focus:ring-[#0F5238]/40 transition-all"
        title="Voir mon profil"
      >
        <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white dark:border-[#1F332C] shadow-sm ring-1 ring-black/5 dark:ring-white/10 bg-[#E1F6EB] dark:bg-[#162D24] flex items-center justify-center group-hover:scale-105 group-hover:shadow-md group-hover:ring-[#0F5238]/30 transition-all">
          <img
            v-if="profile?.avatar_url"
            :src="profile.avatar_url"
            :alt="profile.username || 'Photo de profil'"
            class="w-full h-full object-cover"
          />
          <div v-else class="flex items-center justify-center w-full h-full text-[#0F5238] dark:text-[#34D399] font-bold text-lg">
            {{ initialLetter }}
          </div>
        </div>
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserProfile } from '~/utils/profile.service';

const props = withDefaults(
  defineProps<{
    profile: UserProfile | null;
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  }
);

// Lettre initiale pour l'avatar par défaut
const initialLetter = computed(() => {
  const name = props.profile?.username || 'U';
  return name.charAt(0).toUpperCase();
});
</script>
