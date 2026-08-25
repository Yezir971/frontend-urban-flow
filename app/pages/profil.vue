<template>
  <div class="max-w-md mx-auto pt-6 sm:pt-10 pb-16 px-4 flex flex-col items-center">
    <!-- Header Profil (Avatar + Nom + Macaron Niveau + Pop-up Édition) -->
    <HeaderProfil
      :profile="profile"
      class="mb-8 w-full"
      @profile-updated="onProfileUpdated"
    />

    <!-- Spinner de chargement initial si profil non encore chargé -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 gap-3">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-[#0F5238] animate-spin" />
      <p class="text-sm font-medium text-gray-500">Chargement de votre profil...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HeaderProfil from '~/components/header/HeaderProfil.vue';
import type { UserProfile } from '~/utils/profile.service';
import { fetchUserProfile } from '~/utils/profile.service';

definePageMeta({
  middleware: 'auth',
});

const toast = useToast();
const profile = ref<UserProfile | null>(null);
const isLoading = ref(true);

async function loadProfile() {
  isLoading.value = true;
  try {
    profile.value = await fetchUserProfile();
  } catch (err: any) {
    console.error('Erreur chargement profil:', err);
    toast.add({
      title: 'Erreur',
      description: err?.message || 'Impossible de récupérer votre profil.',
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    });
  } finally {
    isLoading.value = false;
  }
}

function onProfileUpdated(updatedProfile: UserProfile) {
  profile.value = updatedProfile;
}

onMounted(() => {
  loadProfile();
});
</script>