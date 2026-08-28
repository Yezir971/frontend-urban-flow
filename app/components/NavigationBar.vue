<template>
  <!-- Conteneur principal : Barre en bas sur mobile, Sidebar à gauche sur desktop -->
  <nav class="fixed z-98 transition-all duration-300
              bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md flex flex-row justify-around items-center bg-white dark:bg-[#15221E] shadow-xl dark:shadow-black/50 p-2 rounded-full border border-gray-100 dark:border-emerald-900/30
              md:translate-x-0 md:bottom-auto md:left-0 md:top-0 md:h-screen md:w-64 md:flex-col md:justify-between md:bg-[#F3F5F4] md:dark:bg-[#111C18] md:p-6 md:rounded-none md:border-r md:border-gray-200 md:dark:border-emerald-950/50">

    <!-- Haut de la Sidebar sur desktop : Logo + Navigation -->
    <div class="flex flex-row md:flex-col w-full items-center md:items-start justify-between md:justify-start gap-1 md:gap-3">
      <!-- Logo (Desktop uniquement) -->
      <div class="hidden md:flex items-center gap-2 mb-10 text-[#0F4C36] dark:text-[#34D399] font-bold text-2xl w-full px-2">
        <img src="/img/logo.svg" alt="UrbanFlow Logo" class="w-8 h-8" />
        <span>UrbanFlow</span>
      </div>

      <!-- Liens de navigation -->
      <NuxtLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        custom
        v-slot="{ href, navigate, isActive }"
      >
        <a
          :href="href ?? undefined"
          @click="navigate"
          class="group relative flex items-center justify-center transition-all duration-300 cursor-pointer md:rounded-xl md:px-4 md:py-3 md:justify-start rounded-full flex-1 md:flex-none md:w-full"
          :class="[
            isActive 
              ? 'bg-[#c5eadd] text-[#104e35] dark:bg-[#1B4D3E] dark:text-[#A7F3D0] px-4 py-2' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 hover:dark:bg-white/5 px-3 py-1.5'
          ]"
        >
          <!-- Icône -->
          <component 
            :is="item.icon" 
            class="w-5 h-5 transition-all" 
            :class="[
              isActive ? 'mr-1.5 md:mr-3' : 'md:mr-3'
            ]"
          />

          <!-- Texte -->
          <span class="font-medium text-xs md:text-sm">
            {{ item.name }}
          </span>
        </a>
      </NuxtLink>

    </div>


  </nav>
</template>

<script setup lang="ts">
import { Home, Search, User, Sun, Moon } from 'lucide-vue-next';
import { useTheme } from '~/composables/useTheme';

const { isDark } = useTheme();

const navItems = [
  { name: 'Accueil', path: '/', icon: Home },
  { name: 'Trajet', path: '/trajet', icon: Search },
  { name: 'Profil', path: '/profil', icon: User },
];
</script>