<template>
  <div class="relative overflow-hidden bg-linear-to-br from-[#104E35] to-[#0A3825] rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-[#104E35]/15 border border-emerald-900/40">
    
    <!-- Filigrane décoratif feuille en arrière-plan -->
    <div class="absolute -right-6 -bottom-8 pointer-events-none opacity-10 select-none text-white">
      <svg width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    </div>

    <!-- Contenu principal -->
    <div class="relative z-10 flex flex-col justify-between h-full">
      
      <!-- Ligne du haut : Badge Pourcentage vs semaine dernière -->
      <div class="flex items-center justify-between">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xs text-white border border-white/10 shadow-xs">
          <span>{{ co2Stats.percentage_label }}</span>
        </div>
      </div>

      <!-- Valeur principale du CO2 évité -->
      <div class="my-4 sm:my-5">
        <h2 class="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-none text-white">
          {{ formattedCo2Value }} kg CO₂ évités
        </h2>
      </div>

      <!-- Ligne du bas : Séparateur et Équivalent en arbres -->
      <div class="border-t border-white/15 pt-3.5 mt-1 flex items-center gap-2.5 text-xs sm:text-sm text-white/90 font-medium">
        <!-- Icône Arbre / Nature -->
        <div class="p-1 rounded-lg bg-white/10 shrink-0">
          <TreePine class="w-4 h-4 text-emerald-300" />
        </div>
        <p class="leading-snug">
          {{ co2Stats.trees_label }}
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { TreePine } from 'lucide-vue-next';
import { fetchUserCo2Stats, type UserCo2Stats } from '~/utils/trips.service';
import { useUserProfile } from '~/composables/useUserProfile';

const { profile } = useUserProfile();

const defaultStats: UserCo2Stats = {
  total_co2_saved_kg: 12.5,
  weekly_co2_saved_kg: 4.2,
  percentage_vs_last_week: -15,
  percentage_label: '-15% vs semaine dernière',
  equivalent_trees: 2,
  trees_label: 'Équivalent de ce que 2 arbres absorbent en une année.',
};

const co2Stats = ref<UserCo2Stats>({ ...defaultStats });
const isLoading = ref(true);

// Formatage de la valeur du CO2 (ex: 12.5 ou valeur du profil/endpoint)
const formattedCo2Value = computed(() => {
  const val = co2Stats.value.total_co2_saved_kg;
  return Number.isInteger(val) ? val.toString() : val.toFixed(1);
});

async function loadCo2Stats() {
  isLoading.value = true;
  try {
    const data = await fetchUserCo2Stats();
    if (data && typeof data.total_co2_saved_kg === 'number') {
      co2Stats.value = data;
    } else {
      applyFallbackFromProfile();
    }
  } catch (err) {
    console.warn('Fallback local pour stats CO2:', err);
    applyFallbackFromProfile();
  } finally {
    isLoading.value = false;
  }
}

function applyFallbackFromProfile() {
  const profileCo2 = Number(profile.value?.total_co2_saved_kg || 0);
  const co2 = profileCo2 > 0 ? profileCo2 : 12.5;
  const trees = co2 > 0 ? Math.max(1, Math.round(co2 / 6.25)) : 2;
  const treeText = trees > 1 ? `${trees} arbres absorbent` : `${trees} arbre absorbe`;

  co2Stats.value = {
    total_co2_saved_kg: Number(co2.toFixed(1)),
    weekly_co2_saved_kg: Number((co2 * 0.35).toFixed(1)),
    percentage_vs_last_week: -15,
    percentage_label: '-15% vs semaine dernière',
    equivalent_trees: trees,
    trees_label: `Équivalent de ce que ${treeText} en une année.`,
  };
}

// Rafraîchissement automatique si le profil utilisateur évolue (nouveau trajet complété)
watch(
  () => profile.value?.total_co2_saved_kg,
  () => {
    loadCo2Stats();
  }
);

onMounted(() => {
  loadCo2Stats();
});
</script>
