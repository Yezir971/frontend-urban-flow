<script setup lang="ts">
import { computed } from 'vue';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'user', // 'user', 'mail', 'lock'
  },
  showPasswordToggle: {
    type: Boolean,
    default: false,
  },
  showPasswordState: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'togglePassword']);

const inputType = computed(() => {
  if (props.showPasswordToggle) {
    return props.showPasswordState ? 'text' : 'password';
  }
  return props.type;
});

const inputId = computed(() => `input-${props.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="inputId" class="text-xs font-semibold text-gray-600 uppercase tracking-wide">{{ label }}</label>
    <div class="relative flex items-center bg-[#F3F4F6] rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0F5238] focus-within:bg-white transition-all duration-200">
      
      <!-- Input Icons -->
      <User v-if="icon === 'user'" class="absolute left-4 text-gray-400 w-5 h-5 shrink-0" />
      <Mail v-else-if="icon === 'mail'" class="absolute left-4 text-gray-400 w-5 h-5 shrink-0" />
      <Lock v-else-if="icon === 'lock'" class="absolute left-4 text-gray-400 w-5 h-5 shrink-0" />

      <input 
        :id="inputId"
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :type="inputType" 
        :placeholder="placeholder" 
        required
        class="w-full bg-transparent py-3.5 pl-12 text-sm text-gray-900 placeholder-gray-400 border-none outline-none"
        :class="showPasswordToggle ? 'pr-12' : 'pr-4'"
      />

      <!-- Password Show/Hide Toggle -->
      <button 
        v-if="showPasswordToggle"
        @click="emit('togglePassword')"
        type="button" 
        class="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
      >
        <Eye v-if="!showPasswordState" class="w-5 h-5 shrink-0" />
        <EyeOff v-else class="w-5 h-5 shrink-0" />
      </button>

    </div>
  </div>
</template>
