<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen && favorite"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div
          class="relative w-full max-w-md bg-white dark:bg-[#15221E] rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-emerald-900/30 transform transition-all flex flex-col gap-5 text-center"
        >
          <!-- Icône Poubelle Alerte -->
          <div class="mx-auto w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
            <Trash2 class="w-6 h-6" />
          </div>

          <!-- Textes -->
          <div class="flex flex-col gap-1.5">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
              Supprimer ce favori ?
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer <strong class="text-gray-800 dark:text-gray-200">"{{ favorite.name }}"</strong> de vos favoris ?
            </p>
          </div>

          <!-- Message d'erreur éventuel -->
          <p v-if="errorMessage" class="text-xs text-red-500 font-medium">
            {{ errorMessage }}
          </p>

          <!-- Boutons d'action -->
          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 py-3 px-4 rounded-full border border-gray-200 dark:border-emerald-900/50 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-[#1A2D25] active:scale-95 transition-all cursor-pointer text-sm"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="isDeleting"
              @click="handleConfirmDelete"
              class="flex-1 py-3 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              <span v-if="!isDeleting">Supprimer</span>
              <span v-else>Suppression...</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Trash2 } from 'lucide-vue-next';
import type { UserFavorite } from '~/types/favorite';
import { useFavorites } from '~/composables/useFavorites';

const props = defineProps<{
  isOpen: boolean;
  favorite: UserFavorite | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'deleted'): void;
}>();

const { deleteFavorite } = useFavorites();
const isDeleting = ref(false);
const errorMessage = ref<string | null>(null);

function closeModal() {
  errorMessage.value = null;
  emit('close');
}

async function handleConfirmDelete() {
  if (!props.favorite) return;

  isDeleting.value = true;
  errorMessage.value = null;

  try {
    await deleteFavorite(props.favorite.id);
    emit('deleted');
    emit('close');
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Erreur lors de la suppression';
  } finally {
    isDeleting.value = false;
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
