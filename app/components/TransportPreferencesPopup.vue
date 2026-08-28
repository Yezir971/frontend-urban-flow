<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-99 flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-xs p-4 animate-fade-in"
      @click.self="close"
    >
      <div
        class="bg-white dark:bg-[#15221E] rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 dark:border-emerald-900/30 flex flex-col max-h-[90vh] overflow-y-auto"
      >
        <!-- En-tête -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-emerald-950/40 mb-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#E1F6EB] dark:bg-[#1B4D3E] text-[#0F5238] dark:text-[#34D399] flex items-center justify-center">
              <Sliders class="w-5 h-5" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">Préférences de transport</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Personnalisez vos itinéraires</p>
            </div>
          </div>

          <button
            type="button"
            @click="close"
            class="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1A2D25] rounded-full transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Section 1 : Vitesse de marche -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-gray-800 dark:text-gray-200">Vitesse de marche</label>
            <span class="text-xs font-medium text-[#0F5238] dark:text-[#34D399] bg-[#E1F6EB] dark:bg-[#1B4D3E] px-2.5 py-0.5 rounded-full">
              {{ speedLabel }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Ajuste les temps de parcours à pied sur vos trajets.
          </p>

          <div class="grid grid-cols-3 gap-2 bg-[#F3F5F4] dark:bg-[#111C18] p-1.5 rounded-2xl">
            <button
              v-for="speed in speedOptions"
              :key="speed.value"
              type="button"
              @click="localPreferences.walking_speed = speed.value"
              class="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              :class="[
                localPreferences.walking_speed === speed.value
                  ? 'bg-[#0F5238] dark:bg-[#1D6045] text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#1A2D25]'
              ]"
            >
              <component :is="speed.icon" class="w-4 h-4 mb-1" />
              <span>{{ speed.label }}</span>
              <span class="text-[10px] opacity-80 font-normal mt-0.5">{{ speed.coefLabel }}</span>
            </button>
          </div>
        </div>

        <!-- Section 2 : Modes de transport autorisés -->
        <div class="mb-6">
          <label class="text-sm font-semibold text-gray-800 dark:text-gray-200 block mb-1">
            Modes de transport autorisés
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Décochez un mode pour le masquer de vos options de trajets.
          </p>

          <div class="flex flex-col gap-2.5">
            <div
              v-for="mode in transportModes"
              :key="mode.key"
              class="flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none"
              :class="[
                localPreferences[mode.key]
                  ? 'bg-white dark:bg-[#15221E] border-gray-200 dark:border-emerald-900/40 hover:border-gray-300 dark:hover:border-emerald-700/60'
                  : 'bg-gray-50/70 dark:bg-[#111C18]/60 border-gray-100 dark:border-gray-800 opacity-60'
              ]"
              @click="toggleMode(mode.key)"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  :class="[
                    localPreferences[mode.key]
                      ? 'bg-[#E1F6EB] dark:bg-[#1B4D3E] text-[#0F5238] dark:text-[#34D399]'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  ]"
                >
                  <component :is="mode.icon" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white leading-snug">{{ mode.title }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 leading-snug">{{ mode.subtitle }}</p>
                </div>
              </div>

              <!-- Switch Toggle iOS style -->
              <div
                class="w-12 h-7 rounded-full transition-colors relative flex items-center p-0.5 shrink-0"
                :class="localPreferences[mode.key] ? 'bg-[#0F5238] dark:bg-[#34D399]' : 'bg-gray-300 dark:bg-gray-700'"
              >
                <div
                  class="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform"
                  :class="localPreferences[mode.key] ? 'translate-x-5' : 'translate-x-0'"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-auto pt-4 border-t border-gray-100 dark:border-emerald-950/40 flex flex-col gap-2">
          <button
            type="button"
            :disabled="isSaving"
            @click="handleSave"
            class="w-full bg-[#0F5238] dark:bg-[#1D6045] hover:bg-[#0b3d2a] dark:hover:bg-[#154D36] text-white font-semibold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#0F5238]/15 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            <Check v-else class="w-4 h-4" />
            <span>{{ isSaving ? 'Enregistrement...' : 'Enregistrer mes préférences' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Sliders,
  X,
  Check,
  Loader2,
  Train,
  Bus,
  Bike,
  Car,
  Footprints,
  Turtle,
  Zap,
} from 'lucide-vue-next';
import {
  type UserPreferences,
  type WalkingSpeed,
  DEFAULT_USER_PREFERENCES,
} from '~/utils/preferences.service';
import { useUserPreferences } from '~/composables/useUserPreferences';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', prefs: UserPreferences): void;
}>();

const toast = useToast();
const { preferences, updatePreferences } = useUserPreferences();

const isSaving = ref(false);
const localPreferences = ref<UserPreferences>({ ...DEFAULT_USER_PREFERENCES });

// Synchronisation quand la pop-up s'ouvre
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      localPreferences.value = { ...preferences.value };
    }
  },
  { immediate: true },
);

const speedOptions = [
  { value: 'slow' as WalkingSpeed, label: 'Lente', icon: Turtle, coefLabel: '+30% temps' },
  { value: 'normal' as WalkingSpeed, label: 'Normale', icon: Footprints, coefLabel: 'Standard' },
  { value: 'fast' as WalkingSpeed, label: 'Rapide', icon: Zap, coefLabel: '-20% temps' },
];

const transportModes: Array<{
  key: keyof Omit<UserPreferences, 'user_id' | 'walking_speed' | 'created_at' | 'updated_at'>;
  title: string;
  subtitle: string;
  icon: any;
}> = [
  {
    key: 'pref_metro',
    title: 'Métro / RER / Tramway',
    subtitle: 'Réseaux urbains',
    icon: Train,
  },
  {
    key: 'pref_bus',
    title: 'Bus / Tramway',
    subtitle: 'Réseau de surface',
    icon: Bus,
  },
  {
    key: 'pref_bike',
    title: 'Vélos en libre-service',
    subtitle: "Vélo'v, Vélib’...",
    icon: Bike,
  },
  {
    key: 'pref_car',
    title: 'Voiture',
    subtitle: 'Véhicule personnel',
    icon: Car,
  },
  {
    key: 'pref_walk',
    title: 'Marche',
    subtitle: 'À pied uniquement',
    icon: Footprints,
  },
];

const speedLabel = computed(() => {
  switch (localPreferences.value.walking_speed) {
    case 'slow':
      return 'Vitesse lente';
    case 'fast':
      return 'Vitesse rapide';
    case 'normal':
    default:
      return 'Vitesse normale';
  }
});

function toggleMode(key: keyof Omit<UserPreferences, 'user_id' | 'walking_speed' | 'created_at' | 'updated_at'>) {
  localPreferences.value[key] = !localPreferences.value[key];
}

function close() {
  if (isSaving.value) return;
  emit('close');
}

async function handleSave() {
  isSaving.value = true;
  try {
    const saved = await updatePreferences(localPreferences.value);
    toast.add({
      title: 'Préférences enregistrées',
      description: 'Vos préférences de déplacement ont été mises à jour.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    });
    emit('saved', saved);
    emit('close');
  } catch (err: any) {
    console.error('Erreur sauvegarde préférences:', err);
    toast.add({
      title: 'Erreur',
      description: err?.message || 'Impossible de sauvegarder vos préférences.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    });
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
