<template>
  <div class="flex flex-col items-center">
    <!-- Photo de profil avec bouton appareil photo -->
    <div class="relative group cursor-pointer" @click="openEditModal">
      <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#E1F6EB] flex items-center justify-center transition-transform duration-200 group-hover:scale-102">
        <img
          v-if="profile?.avatar_url"
          :src="profile.avatar_url"
          :alt="profile.username"
          class="w-full h-full object-cover"
        />
        <div v-else class="flex items-center justify-center w-full h-full text-[#0F5238] font-bold text-3xl">
          {{ initialLetter }}
        </div>
      </div>

      <!-- Bouton Badge Caméra en bas à droite -->
      <button
        type="button"
        class="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-gray-700 hover:text-[#0F5238]"
        title="Modifier la photo ou le profil"
        @click.stop="openEditModal"
      >
        <UIcon name="i-lucide-camera" class="w-4 h-4" />
      </button>
    </div>

    <!-- Nom de l'utilisateur -->
    <h1 class="text-2xl font-bold text-gray-900 mt-4 tracking-tight text-center">
      {{ profile?.username || 'Chargement...' }}
    </h1>

    <!-- Macaron Niveau / Badge Écologique -->
    <div class="bg-[#B1F0CE] text-[#0F5238] font-semibold text-xs px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 mt-2.5 shadow-sm">
      <UIcon name="i-lucide-leaf" class="w-3.5 h-3.5 text-[#0F5238]" />
      <span>{{ profile?.level_label || 'Voyageur Écolo' }}</span>
    </div>

    <!-- Modale de modification du profil (Pop-up) -->
    <Teleport to="body">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-99 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative animate-scale-up">
          <!-- Header de la modale -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 class="text-lg font-bold text-gray-900">Modifier mon profil</h2>
            <button
              type="button"
              class="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              @click="closeModal"
            >
              <UIcon name="i-lucide-x" class="w-5 h-5" />
            </button>
          </div>

          <!-- Corps du formulaire -->
          <div class="py-6 flex flex-col gap-6">
            <!-- Zone photo avec preview et sélecteur de fichier -->
            <div class="flex flex-col items-center gap-3">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Photo de profil</label>
              
              <div
                class="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer group bg-[#E1F6EB] flex items-center justify-center shadow-inner"
                @click="triggerFileInput"
              >
                <img
                  v-if="previewAvatarUrl"
                  :src="previewAvatarUrl"
                  alt="Aperçu avatar"
                  class="w-full h-full object-cover"
                />
                <div v-else class="flex items-center justify-center w-full h-full text-[#0F5238] font-bold text-2xl">
                  {{ initialLetter }}
                </div>

                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-medium text-center p-1">
                  <UIcon name="i-lucide-upload" class="w-5 h-5 mb-1" />
                  Changer
                </div>
              </div>

              <!-- Input file masqué -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/png, image/jpeg, image/webp, image/jpg"
                class="hidden"
                @change="handleFileSelected"
              />

              <button
                type="button"
                class="text-xs font-semibold text-[#0F5238] hover:underline flex items-center gap-1 cursor-pointer"
                @click="triggerFileInput"
              >
                <UIcon name="i-lucide-image" class="w-3.5 h-3.5" />
                Choisir une image
              </button>

              <p class="text-[11px] text-gray-400 text-center">
                Formats acceptés : PNG, JPEG, WebP (max 5 Mo)
              </p>
            </div>

            <!-- Champ Nom Complet -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-600">Nom complet</label>
              <div class="relative flex items-center">
                <UIcon name="i-lucide-user" class="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  v-model="editUsername"
                  type="text"
                  placeholder="Ex: Alexandre Dupont"
                  maxlength="50"
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:border-[#0F5238] focus:ring-2 focus:ring-[#0F5238]/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              class="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              :disabled="isSaving"
              @click="closeModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="px-6 py-2 bg-[#0F5238] hover:bg-[#0c422d] text-white text-sm font-semibold rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              :disabled="isSaving"
              @click="handleSave"
            >
              <UIcon v-if="isSaving" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
              <span>{{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { UserProfile } from '~/utils/profile.service';
import { updateUserProfile, uploadUserAvatar } from '~/utils/profile.service';

const props = defineProps<{
  profile: UserProfile | null;
}>();
const emit = defineEmits<{
  (e: 'profile-updated', profile: UserProfile): void;
}>();

const toast = useToast();

const isModalOpen = ref(false);
const isSaving = ref(false);
const editUsername = ref('');
const selectedFile = ref<File | null>(null);
const previewAvatarUrl = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Lettre initiale pour l'avatar par défaut
const initialLetter = computed(() => {
  const name = props.profile?.username || 'U';
  return name.charAt(0).toUpperCase();
});

// Synchronisation des valeurs à l'ouverture de la modale
watch(
  () => props.profile,
  (newProfile) => {
    if (newProfile) {
      editUsername.value = newProfile.username || '';
      previewAvatarUrl.value = newProfile.avatar_url || null;
    }
  },
  { immediate: true },
);

function openEditModal() {
  if (props.profile) {
    console.log('Props reçues dans HeaderProfil:', props.profile);


    editUsername.value = props.profile.username || '';
    previewAvatarUrl.value = props.profile.avatar_url || null;
  }
  selectedFile.value = null;
  isModalOpen.value = true;
}

function closeModal() {
  if (isSaving.value) return;
  isModalOpen.value = false;
  selectedFile.value = null;
  previewAvatarUrl.value = props.profile?.avatar_url || null;
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // Validation du format
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    toast.add({
      title: 'Format non supporté',
      description: 'Veuillez choisir une image au format PNG, JPEG ou WebP.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    });
    target.value = '';
    return;
  }

  // Validation de la taille (max 5 Mo)
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    toast.add({
      title: 'Fichier trop volumineux',
      description: 'La taille de la photo ne doit pas dépasser 5 Mo.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    });
    target.value = '';
    return;
  }

  selectedFile.value = file;
  previewAvatarUrl.value = URL.createObjectURL(file);
}

async function handleSave() {
  const trimmedName = editUsername.value.trim();
  if (!trimmedName || trimmedName.length < 2) {
    toast.add({
      title: 'Nom invalide',
      description: 'Veuillez saisir un nom complet comportant au moins 2 caractères.',
      color: 'warning',
      icon: 'i-lucide-triangle-alert',
    });
    return;
  }

  isSaving.value = true;
  try {
    let updatedProfile = props.profile;

    // 1. Upload de la nouvelle photo si un fichier a été sélectionné
    if (selectedFile.value) {
      updatedProfile = await uploadUserAvatar(selectedFile.value);
    }

    // 2. Mise à jour du nom si modifié
    if (trimmedName !== props.profile?.username) {
      updatedProfile = await updateUserProfile(trimmedName);
    }

    if (updatedProfile) {
      emit('profile-updated', updatedProfile);
      toast.add({
        title: 'Profil mis à jour',
        description: 'Vos modifications ont été enregistrées avec succès.',
        color: 'success',
        icon: 'i-lucide-circle-check',
      });
      isModalOpen.value = false;
    }
  } catch (err: any) {
    toast.add({
      title: 'Erreur',
      description: err?.message || 'Une erreur est survenue lors de la mise à jour.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    });
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.15s ease-out;
}

.animate-scale-up {
  animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>