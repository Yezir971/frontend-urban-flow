<script setup lang="ts">
defineProps({
  size: {
    type: String,
    default: 'md' // 'sm' | 'md' | 'lg'
  },
  color: {
    type: String,
    default: 'text-[#104e35]' 
  }
})
</script>

<template>
  <div class="flex items-center justify-center" role="status" aria-label="Chargement...">
    <svg 
      class="animate-spin text-current" 
      :class="[
        size === 'sm' ? 'h-5 w-5' : '',
        size === 'md' ? 'h-8 w-8' : '',
        size === 'lg' ? 'h-12 w-12' : '',
        color
      ]"
      fill="none" 
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Cercle arrière-plan opaque -->
      <circle 
        class="opacity-20" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
      ></circle>
      <!-- Arc animé -->
      <path 
        class="opacity-80" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
</template>
