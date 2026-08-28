<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <button
    type="button"
    @click="router.back()"
    class="w-9 h-9 rounded-full bg-gray-50 dark:bg-[#1C2F28] border border-gray-200 dark:border-emerald-900/60 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#253E35] active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
    aria-label="Retour"
  >
    <ArrowLeft class="w-4 h-4" />
  </button>
</template>