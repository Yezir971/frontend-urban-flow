<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template >
  <button
    type="button"
    @click="router.back()"
    class="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
    aria-label="Retour"
  >
    <ArrowLeft class="w-4 h-4" />
  </button>
</template>