<template>
  <div class="max-w-md mx-auto pt-6 sm:pt-10 pb-20 px-4 flex flex-col items-center">
    <!-- Header Profil (Avatar + Nom + Macaron Niveau + Pop-up Édition) -->
    <HeaderProfil
      :profile="profile"
      class="mb-6 w-full"
      @profile-updated="onProfileUpdated"
    />

    <!-- Spinner de chargement initial si profil non encore chargé -->
    <div v-if="isLoading && !profile" class="flex flex-col items-center justify-center py-12 gap-3">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-[#0F5238] animate-spin" />
      <p class="text-sm font-medium text-gray-500">Chargement de votre profil...</p>
    </div>

    <!-- Contenu des Paramètres du Profil (Fidèle à prrofil.png) -->
    <div v-else class="w-full flex flex-col gap-6">
      <!-- Section 1 : MOBILITÉ -->
      <div>
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
          Mobilité
        </h3>
        <div class="bg-[#F8FAF9] rounded-3xl p-1.5 flex flex-col gap-1 border border-gray-100/80 shadow-xs">
          <!-- Préférences de transport -->
          <button
            type="button"
            @click="isPreferencesPopupOpen = true"
            class="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white transition-all text-left w-full cursor-pointer group"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-2xl bg-[#E1F6EB] text-[#0F5238] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sliders class="w-5 h-5" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">Préférences de transport</p>
                <p class="text-xs text-gray-500">Modes actifs, vitesse de marche</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          <!-- Accessibilité PMR -->
          <button
            type="button"
            @click="openPmrInfo"
            class="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white transition-all text-left w-full cursor-pointer group"
          >
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-2xl bg-[#E1F6EB] text-[#0F5238] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Accessibility class="w-5 h-5" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">Accessibilité PMR</p>
                <p class="text-xs text-gray-500">Trajets adaptés aux fauteuils et poussettes</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        </div>
      </div>

      <!-- Section 2 : APPLICATION -->
      <div>
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
          Application
        </h3>
        <div class="bg-[#F8FAF9] rounded-3xl p-1.5 flex flex-col gap-1 border border-gray-100/80 shadow-xs">
          <!-- Mode sombre -->
          <div class="flex items-center justify-between p-3.5 rounded-2xl bg-white/40">
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-2xl bg-[#E1F6EB] text-[#0F5238] flex items-center justify-center shrink-0">
                <Moon class="w-5 h-5" />
              </div>
              <span class="text-sm font-semibold text-gray-900">Mode sombre</span>
            </div>
            <div
              @click="isDarkMode = !isDarkMode"
              class="w-12 h-7 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer shrink-0"
              :class="isDarkMode ? 'bg-[#0F5238]' : 'bg-gray-300'"
            >
              <div
                class="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform"
                :class="isDarkMode ? 'translate-x-5' : 'translate-x-0'"
              />
            </div>
          </div>

          <!-- Géolocalisation avec demande de permission native et confirmation -->
          <div class="flex items-center justify-between p-3.5 rounded-2xl bg-white/40">
            <div class="flex items-center gap-3.5 mr-3">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors"
                :class="[
                  geoStore.isEnabled
                    ? 'bg-[#E1F6EB] text-[#0F5238]'
                    : 'bg-gray-100 text-gray-400'
                ]"
              >
                <MapPin class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-gray-900">Géolocalisation</p>
                  <span
                    v-if="geoStore.isEnabled && geoStore.lat && geoStore.lng"
                    class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider"
                  >
                    Active
                  </span>
                </div>
                <p class="text-xs text-gray-500">
                  Activez pour trouver les stations et véhicules à proximité de votre position actuelle.
                </p>
              </div>
            </div>
            <div
              @click="toggleGeolocation"
              class="w-12 h-7 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer shrink-0"
              :class="geoStore.isEnabled ? 'bg-[#0F5238]' : 'bg-gray-300'"
            >
              <div
                class="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform"
                :class="geoStore.isEnabled ? 'translate-x-5' : 'translate-x-0'"
              />
            </div>
          </div>

          <!-- PWA Installer (Grise et non cliquable si déjà installée) -->
          <button
            type="button"
            :disabled="isInstalled"
            @click="installApp"
            class="flex items-center justify-between p-3.5 rounded-2xl transition-all text-left w-full group"
            :class="[
              isInstalled
                ? 'opacity-60 cursor-not-allowed bg-transparent'
                : 'hover:bg-white cursor-pointer'
            ]"
          >
            <div class="flex items-center gap-3.5">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform"
                :class="[
                  isInstalled
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-[#E1F6EB] text-[#0F5238] group-hover:scale-105'
                ]"
              >
                <Check v-if="isInstalled" class="w-5 h-5 text-emerald-600" />
                <Download v-else class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-gray-900">PWA</p>
                  <span
                    v-if="isInstalled"
                    class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider"
                  >
                    Installée
                  </span>
                </div>
                <p class="text-xs text-gray-500">
                  {{ isInstalled ? 'Application déjà installée sur cet appareil' : "Installer l'application sur l'appareil" }}
                </p>
              </div>
            </div>
            <div class="shrink-0">
              <Check v-if="isInstalled" class="w-5 h-5 text-emerald-600" />
              <ExternalLink v-else class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </button>
        </div>
      </div>

      <!-- Section 3 : À PROPOS -->
      <div>
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
          À propos
        </h3>
        <div class="bg-[#F8FAF9] rounded-3xl p-1.5 flex flex-col gap-1 border border-gray-100/80 shadow-xs">
          <!-- Politique de confidentialité -->
          <NuxtLink
            to="/confidentialite"
            class="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white transition-all text-left w-full cursor-pointer group"
          >
            <span class="text-sm font-medium text-gray-800">Politique de confidentialité</span>
            <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0" />
          </NuxtLink>

          <!-- Conditions Générales d'Utilisation -->
          <NuxtLink
            to="/cgu"
            class="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white transition-all text-left w-full cursor-pointer group"
          >
            <span class="text-sm font-medium text-gray-800">Conditions Générales d'Utilisation</span>
            <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0" />
          </NuxtLink>

          <!-- Mentions légales -->
          <NuxtLink
            to="/mentions-legales"
            class="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white transition-all text-left w-full cursor-pointer group"
          >
            <span class="text-sm font-medium text-gray-800">Mentions légales</span>
            <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0" />
          </NuxtLink>

          <!-- Aide -->
          <button
            type="button"
            @click="openHelp"
            class="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white transition-all text-left w-full cursor-pointer group"
          >
            <span class="text-sm font-medium text-gray-800">Aide</span>
            <HelpCircle class="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0" />
          </button>
        </div>
      </div>

      <!-- Bouton Déconnexion -->
      <button
        type="button"
        @click="handleLogout"
        class="w-full bg-[#0F5238] hover:bg-[#0b3d2a] text-white font-semibold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#0F5238]/15 active:scale-[0.98] transition-all cursor-pointer mt-2"
      >
        <LogOut class="w-4 h-4" />
        <span>Se déconnecter</span>
      </button>

      <!-- Version -->
      <p class="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-1">
        Version 1.0.0
      </p>
    </div>

    <!-- Popup Préférences de transport -->
    <TransportPreferencesPopup
      :is-open="isPreferencesPopupOpen"
      @close="isPreferencesPopupOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  Sliders,
  Accessibility,
  Moon,
  MapPin,
  Download,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  LogOut,
  Check,
} from 'lucide-vue-next';
import HeaderProfil from '~/components/header/HeaderProfil.vue';
import TransportPreferencesPopup from '~/components/TransportPreferencesPopup.vue';
import type { UserProfile } from '~/utils/profile.service';
import { fetchUserProfile } from '~/utils/profile.service';
import { useUserPreferences } from '~/composables/useUserPreferences';
import { useUserProfile } from '~/composables/useUserProfile';
import { usePwaInstall } from '~/composables/usePwaInstall';
import { useGeoStore } from '~/stores/geo';

definePageMeta({
  middleware: 'auth',
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();
const { loadPreferences } = useUserPreferences();
const { isInstalled, installApp, checkInstallStatus } = usePwaInstall();
const geoStore = useGeoStore();

const { profile, isLoading, loadProfile: loadUserProfile, setProfile } = useUserProfile();
const isPreferencesPopupOpen = ref(false);

const isDarkMode = ref(false);

async function loadProfile() {
  await loadUserProfile(true);
}

function onProfileUpdated(updatedProfile: UserProfile) {
  setProfile(updatedProfile);
}

async function toggleGeolocation() {
  if (geoStore.isEnabled) {
    geoStore.disableGeolocation();
    toast.add({
      title: 'Géolocalisation désactivée',
      description: 'Votre position actuelle ne sera plus demandée automatiquement.',
      color: 'info',
      icon: 'i-lucide-map-pin-off',
    });
  } else {
    const res = await geoStore.enableGeolocation();
    if (res.success && res.coords) {
      toast.add({
        title: 'Position récupérée',
        description: `Position GPS verrouillée (${res.coords.lat.toFixed(4)}, ${res.coords.lng.toFixed(4)}).`,
        color: 'success',
        icon: 'i-lucide-map-pin-check',
      });
    } else {
      toast.add({
        title: 'Géolocalisation indisponible',
        description: res.error || 'Permission refusée ou GPS désactivé.',
        color: 'error',
        icon: 'i-lucide-triangle-alert',
      });
    }
  }
}

function openPmrInfo() {
  toast.add({
    title: 'Accessibilité PMR',
    description: 'Les itinéraires accessibles aux PMR sont prioritaires sur le réseau TCL.',
    color: 'info',
    icon: 'i-lucide-accessibility',
  });
}

function openHelp() {
  toast.add({
    title: 'Centre d’aide',
    description: 'Pour toute assistance, contactez support@urban-flow-lyon.fr',
    color: 'info',
    icon: 'i-lucide-help-circle',
  });
}

async function handleLogout() {
  try {
    await supabase.auth.signOut();
    toast.add({
      title: 'Déconnexion',
      description: 'À bientôt sur Urban Flow !',
      color: 'info',
      icon: 'i-lucide-log-out',
    });
    navigateTo('/auth');
  } catch (err: any) {
    console.error('Erreur déconnexion:', err);
  }
}

watch(
  user,
  (newUser) => {
    if (newUser) {
      loadProfile();
      loadPreferences();
    }
  },
  { immediate: true },
);

onMounted(() => {
  loadProfile();
  loadPreferences();
  checkInstallStatus();
  geoStore.initGeolocation();
});
</script>