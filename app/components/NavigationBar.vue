<template>
  <!-- Conteneur principal : Barre en bas sur mobile, Sidebar à gauche sur desktop -->
  <nav class="fixed z-98 transition-all duration-300
              bottom-6 left-1/2 -translate-x-1/2 w-[90%] flex flex-row justify-around items-center bg-[#FFFFFF] shadow-amber-50  p-2 rounded-full
              md:translate-x-0 md:bottom-auto md:left-0 md:top-0 md:h-screen md:w-64 md:flex-col md:justify-start  md:bg-[#F3F5F4] md:p-6 md:rounded-none md:border-r md:border-gray-200">

    <!-- Logo -->
    <div class="hidden md:flex items-center gap-2 mb-10 text-[#0F4C36] font-bold text-2xl w-full px-2">
      <img src="/img/logo.svg" />
      UrbanFlow
    </div>

    <!-- Conteneur des liens -->
    <div class="flex flex-row md:flex-col w-full justify-between md:justify-start gap-1 md:gap-3">
      
      <!-- Boucle sur les éléments de navigation -->
      <NuxtLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        custom
        v-slot="{ href, navigate, isActive }"
      >
        <a
          :href="href"
          @click="navigate"
          class="group relative flex items-center justify-center transition-all duration-300 cursor-pointer md:rounded-xl md:px-8 md:justify-start rounded-full"
          :class="[
            /* Gestion de l'état ACTIF */
            isActive 
              ? 'bg-[#c5eadd] text-[#104e35] flex-row px-5 py-2.5 md:py-3 md:px-4' 
              : 'hover:bg-black/5 hover:bg-gray-200 md:flex-row px-4 py-1.5 md:py-3 md:px-4'
          ]"
        >
          <!-- Icône -->
          <component 
            :is="item.icon" 
            class="w-6 h-6 md:w-5 md:h-5 transition-all" 
            :class="[
              isActive ? 'mr-2 md:mr-3' : 'mb-1 md:mb-0 md:mr-3'
            ]"
          />

          <!-- Texte -->
          <span class="font-medium transition-all"
                :class="'text-[11px] md:text-sm'">
            {{ item.name }}
          </span>
        </a>
      </NuxtLink>

    </div>
  </nav>
</template>

<script setup lang="ts">

import { Home, Search, User } from 'lucide-vue-next'

// Configuration de tes liens (plus besoin de isActive manuel !)
const navItems = [
  { name: 'Accueil', path: '/', icon: Home },
  { name: 'Trajet', path: '/trajet', icon: Search },
  { name: 'Profil', path: '/profil', icon: User },
]
</script>