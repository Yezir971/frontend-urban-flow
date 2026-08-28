<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <!-- Boîte de dialogue de la modale -->
        <div
          class="relative w-full max-w-lg bg-white dark:bg-[#15221E] rounded-[32px] p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-emerald-900/30 transform transition-all flex flex-col gap-6"
        >
          <!-- En-tête -->
          <div class="flex items-start justify-between">
            <div class="flex flex-col gap-1 pr-6">
              <h2 class="text-2xl font-black tracking-tight text-[#104E35] dark:text-[#34D399]">
                Ajouter un favori
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Enregistrez vos lieux fréquents pour y accéder rapidement.
              </p>
            </div>

            <!-- Bouton fermer (Croix) -->
            <button
              type="button"
              @click="closeModal"
              class="p-2 rounded-full text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1A2D25] transition-colors cursor-pointer shrink-0"
              aria-label="Fermer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Formulaire -->
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
            <!-- 1. Adresse de départ (Optionnelle) -->
            <div class="flex flex-col gap-1.5 relative z-20">
              <label class="text-xs font-bold text-gray-700 dark:text-gray-300">
                Adresse de départ
              </label>
              <div class="relative bg-[#F4F6F5] dark:bg-[#111C18] rounded-2xl px-4 py-3 border border-transparent focus-within:border-[#104E35]/40 dark:focus-within:border-emerald-500/50 focus-within:bg-white dark:focus-within:bg-[#162922] transition-all flex items-center gap-2.5">
                <Search class="w-4 h-4 text-gray-400 shrink-0" />
                <PhotonAutocomplete
                  v-model="startQuery"
                  :activate-current-position="true"
                  @location-selected="handleStartSelected"
                  placeholder="Rechercher une adresse..."
                  class="w-full bg-transparent text-sm text-gray-800 dark:text-gray-100 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            <!-- 2. Adresse de destination (Obligatoire) -->
            <div class="flex flex-col gap-1.5 relative z-10">
              <label class="text-xs font-bold text-gray-700 dark:text-gray-300">
                Adresse de destination <span class="text-red-500">*</span>
              </label>
              <div class="relative bg-[#F4F6F5] dark:bg-[#111C18] rounded-2xl px-4 py-3 border border-transparent focus-within:border-[#104E35]/40 dark:focus-within:border-emerald-500/50 focus-within:bg-white dark:focus-within:bg-[#162922] transition-all flex items-center gap-2.5">
                <Search class="w-4 h-4 text-gray-400 shrink-0" />
                <PhotonAutocomplete
                  v-model="endQuery"
                  @location-selected="handleEndSelected"
                  placeholder="Rechercher une adresse..."
                  class="w-full bg-transparent text-sm text-gray-800 dark:text-gray-100 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            <!-- 3. Nom du favori -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-700 dark:text-gray-300">
                Nom du favori <span class="text-red-500">*</span>
              </label>
              <input
                v-model="favoriteName"
                type="text"
                required
                placeholder="Ex: Mon bureau, Chez Maman..."
                class="w-full bg-[#F4F6F5] dark:bg-[#111C18] rounded-2xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100 border border-transparent focus:border-[#104E35]/40 dark:focus:border-emerald-500/50 focus:bg-white dark:focus:bg-[#162922] focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <!-- 4. Choisir une icône -->
            <div class="flex flex-col gap-2 pt-1">
              <label class="text-xs font-bold text-gray-700 dark:text-gray-300">
                Choisir une icône
              </label>
              <div class="flex items-center gap-3">
                <button
                  v-for="iconOption in iconOptions"
                  :key="iconOption.id"
                  type="button"
                  @click="selectedIcon = iconOption.id"
                  :class="[
                    'flex-1 py-3 px-2 rounded-2xl flex items-center justify-center transition-all cursor-pointer border',
                    selectedIcon === iconOption.id
                      ? 'bg-[#c5eadd] dark:bg-[#1B4D3E] text-[#104E35] dark:text-[#A7F3D0] border-[#a7d9c6] dark:border-emerald-700/60 shadow-xs'
                      : 'bg-[#F4F6F5] dark:bg-[#111C18] text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-200/80 dark:hover:bg-[#1A2D25]',
                  ]"
                  :aria-label="iconOption.label"
                >
                  <component :is="iconOption.icon" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Message d'erreur -->
            <p v-if="errorMessage" class="text-xs text-red-500 font-medium">
              {{ errorMessage }}
            </p>

            <!-- Bouton d'enregistrement -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="isSubmitting || !favoriteName.trim() || !destinationLocation"
                class="w-full bg-[#104E35] dark:bg-[#1D6045] hover:bg-[#0c3a28] dark:hover:bg-[#154D36] text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#104E35]/15 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span v-if="!isSubmitting">Enregistrer le favori</span>
                <span v-else>Enregistrement...</span>
                <Check class="w-4 h-4 shrink-0" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  X,
  Search,
  Star,
  Briefcase,
  Home,
  User,
  Heart,
  Check,
} from 'lucide-vue-next';
import PhotonAutocomplete from '~/components/PhotonAutocomplete.vue';
import { useFavorites } from '~/composables/useFavorites';
import type { LocationDataPhoton } from '~/types/photon';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created'): void;
}>();

const { addFavorite } = useFavorites();

const startQuery = ref('');
const endQuery = ref('');
const favoriteName = ref('');
const selectedIcon = ref('home');
const isSubmitting = ref(false);
const errorMessage = ref<string | null>(null);

const startLocation = ref<{ lat: number; lon: number; name: string } | null>(null);
const destinationLocation = ref<{ lat: number; lon: number; name: string } | null>(null);

const iconOptions = [
  { id: 'star', label: 'Étoile', icon: Star },
  { id: 'work', label: 'Travail', icon: Briefcase },
  { id: 'home', label: 'Domicile', icon: Home },
  { id: 'user', label: 'Personnel', icon: User },
  { id: 'heart', label: 'Coup de cœur', icon: Heart },
];

function handleStartSelected(data: any) {
  startLocation.value = {
    lat: data.lat,
    lon: data.lon,
    name: data.name,
  };
  startQuery.value = data.name;
}

function handleEndSelected(data: any) {
  destinationLocation.value = {
    lat: data.lat,
    lon: data.lon,
    name: data.name,
  };
  endQuery.value = data.name;

  // Si le champ nom est vide, pré-remplir avec le nom du lieu
  if (!favoriteName.value.trim()) {
    favoriteName.value = data.name.split(',')[0] || '';
  }
}

function closeModal() {
  errorMessage.value = null;
  emit('close');
}

async function handleSubmit() {
  if (!favoriteName.value.trim()) {
    errorMessage.value = 'Veuillez saisir un nom pour ce favori.';
    return;
  }

  if (!destinationLocation.value) {
    errorMessage.value = 'Veuillez sélectionner une adresse de destination valide dans la liste.';
    return;
  }

  errorMessage.value = null;
  isSubmitting.value = true;

  try {
    await addFavorite({
      name: favoriteName.value.trim(),
      address: destinationLocation.value.name,
      start_address: startLocation.value?.name || null,
      start_coordinates: startLocation.value
        ? {
            lat: startLocation.value.lat,
            lng: startLocation.value.lon,
          }
        : null,
      icon: selectedIcon.value,
      coordinates: {
        lat: destinationLocation.value.lat,
        lng: destinationLocation.value.lon,
      },
    });

    // Reset du formulaire
    favoriteName.value = '';
    startQuery.value = '';
    endQuery.value = '';
    startLocation.value = null;
    destinationLocation.value = null;
    selectedIcon.value = 'home';

    emit('created');
    emit('close');
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || "Erreur lors de l'enregistrement.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
