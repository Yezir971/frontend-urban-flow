<script setup lang="ts">
import { Check, X } from 'lucide-vue-next';

defineProps({
  isLengthValid: {
    type: Boolean as () => boolean | null,
    default: null,
  },
  isSpecialValid: {
    type: Boolean as () => boolean | null,
    default: null,
  },
  isDigitValid: {
    type: Boolean as () => boolean | null,
    default: null,
  },
});

function getConstraintClass(status: boolean | null): string {
  if (status === null) return 'text-gray-400';
  return status ? 'text-emerald-600' : 'text-red-500';
}

function getBulletClass(status: boolean | null): string {
  if (status === null) return 'border-gray-200 bg-white';
  return status 
    ? 'border-emerald-600 bg-emerald-50 text-emerald-600' 
    : 'border-red-400 bg-red-50 text-red-500';
}
</script>

<template>
  <div class="bg-[#F8F9FA] rounded-2xl p-4 flex flex-col gap-2.5 mt-2 border border-gray-100">
    <span class="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Liste de sécurité</span>
    <div class="flex flex-col gap-2">
      
      <!-- Constraint 1: Length -->
      <div :class="['flex items-center gap-2.5 text-xs font-semibold transition-colors duration-200', getConstraintClass(isLengthValid)]">
        <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200" :class="getBulletClass(isLengthValid)">
          <Check v-if="isLengthValid === true" class="w-2.5 h-2.5 stroke-3" />
          <span v-else-if="isLengthValid === null" class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
          <X v-else class="w-2.5 h-2.5 stroke-3" />
        </span>
        <span>Au moins 8 caractères</span>
      </div>

      <!-- Constraint 2: Special char -->
      <div :class="['flex items-center gap-2.5 text-xs font-semibold transition-colors duration-200', getConstraintClass(isSpecialValid)]">
        <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200" :class="getBulletClass(isSpecialValid)">
          <Check v-if="isSpecialValid === true" class="w-2.5 h-2.5 stroke-3" />
          <span v-else-if="isSpecialValid === null" class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
          <X v-else class="w-2.5 h-2.5 stroke-3" />
        </span>
        <span>Un caractère spécial (!@#$)</span>
      </div>

      <!-- Constraint 3: Digit -->
      <div :class="['flex items-center gap-2.5 text-xs font-semibold transition-colors duration-200', getConstraintClass(isDigitValid)]">
        <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200" :class="getBulletClass(isDigitValid)">
          <Check v-if="isDigitValid === true" class="w-2.5 h-2.5 stroke-3" />
          <span v-else-if="isDigitValid === null" class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
          <X v-else class="w-2.5 h-2.5 stroke-3" />
        </span>
        <span>Un chiffre (0-9)</span>
      </div>

    </div>
  </div>
</template>
