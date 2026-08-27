<template>
  <div class="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-gray-100 flex flex-col gap-4">
    <!-- Titre de la section -->
    <h2 class="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
      Prêt à partir ?
    </h2>

    <!-- Liste des vignettes en scroll horizontal ou flex wrap -->
    <div class="flex items-center gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none">
      <!-- Vignettes des favoris existants -->
      <div
        v-for="fav in favorites"
        :key="fav.id"
        class="group flex flex-col items-center gap-1.5 shrink-0"
      >
        <!-- Carte Favori cliquable (lance le trajet) -->
        <button
          type="button"
          @click="startFavoriteTrip(fav)"
          class="w-28 sm:w-32 h-28 sm:h-32 bg-[#EAF5F1]/80 hover:bg-[#EAF5F1] rounded-2xl flex flex-col items-center justify-center gap-2 p-3 transition-all active:scale-95 cursor-pointer border border-[#c5eadd]/50 hover:border-[#104E35]/30 hover:shadow-md text-center"
          :title="`Partir vers ${fav.name}`"
        >
          <!-- Icône personnalisée -->
          <div class="w-10 h-10 rounded-full bg-white/80 text-[#104E35] flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
            <component :is="getIconComponent(fav.icon)" class="w-5 h-5" />
          </div>

          <!-- Nom du favori -->
          <span class="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-[#104E35]">
            {{ fav.name }}
          </span>
        </button>

        <!-- Petite poubelle en dessous de chaque vignette -->
        <button
          type="button"
          @click.stop="openDeleteModal(fav)"
          class="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-all cursor-pointer opacity-70 hover:opacity-100"
          :title="`Supprimer ${fav.name}`"
          aria-label="Supprimer ce favori"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Vignette Ajouter un favori (Pointillés) -->
      <div class="flex flex-col items-center gap-1.5 shrink-0">
        <button
          type="button"
          @click="isAddModalOpen = true"
          class="w-28 sm:w-32 h-28 sm:h-32 border-2 border-dashed border-gray-300 hover:border-[#104E35] bg-gray-50/50 hover:bg-[#EAF5F1]/30 rounded-2xl flex flex-col items-center justify-center gap-2 p-3 text-gray-500 hover:text-[#104E35] transition-all active:scale-95 cursor-pointer text-center"
          title="Ajouter un lieu favori"
        >
          <div class="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white text-gray-400 group-hover:text-[#104E35] flex items-center justify-center transition-colors">
            <PlusCircle class="w-6 h-6" />
          </div>
          <span class="text-xs font-bold line-clamp-2">
            Ajouter un favori
          </span>
        </button>
        
        <!-- Spacer invisible pour aligner verticalement avec les poubelles -->
        <div class="h-6.5"></div>
      </div>
    </div>

    <!-- Modale d'ajout de favori -->
    <AddFavoriteModal
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @created="handleFavoriteCreated"
    />

    <!-- Modale de confirmation de suppression -->
    <DeleteFavoriteModal
      :is-open="isDeleteModalOpen"
      :favorite="favoriteToDelete"
      @close="isDeleteModalOpen = false"
      @deleted="handleFavoriteDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Home,
  Briefcase,
  Star,
  User,
  Heart,
  Dumbbell,
  PlusCircle,
  Trash2,
} from 'lucide-vue-next';
import { useFavorites } from '~/composables/useFavorites';
import type { UserFavorite } from '~/types/favorite';
import AddFavoriteModal from './AddFavoriteModal.vue';
import DeleteFavoriteModal from './DeleteFavoriteModal.vue';

const router = useRouter();
const { favorites, fetchFavorites } = useFavorites();

const isAddModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const favoriteToDelete = ref<UserFavorite | null>(null);

function getIconComponent(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case 'work':
    case 'briefcase':
      return Briefcase;
    case 'star':
      return Star;
    case 'user':
      return User;
    case 'heart':
      return Heart;
    case 'gym':
    case 'dumbbell':
      return Dumbbell;
    case 'home':
    default:
      return Home;
  }
}

function startFavoriteTrip(fav: UserFavorite) {
  const queryParams: Record<string, string> = {
    destination: fav.address,
    lat: fav.coordinates.lat.toString(),
    lon: fav.coordinates.lng.toString(),
    name: fav.name,
  };

  if (fav.start_address) {
    queryParams.start = fav.start_address;
  }
  if (fav.start_coordinates) {
    queryParams.start_lat = fav.start_coordinates.lat.toString();
    queryParams.start_lon = fav.start_coordinates.lng.toString();
  }

  router.push({
    path: '/trajet',
    query: queryParams,
  });
}

function openDeleteModal(fav: UserFavorite) {
  favoriteToDelete.value = fav;
  isDeleteModalOpen.value = true;
}

function handleFavoriteCreated() {
  fetchFavorites();
}

function handleFavoriteDeleted() {
  favoriteToDelete.value = null;
}

onMounted(() => {
  fetchFavorites();
});
</script>
