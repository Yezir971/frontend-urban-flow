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

      <!-- Valeur principale du CO2 évité (formatage intelligent g ou kg) -->
      <div class="my-4 sm:my-5">
        <h2 class="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-none text-white">
          {{ displayCo2Headline }}
        </h2>
      </div>

      <!-- Ligne du bas : Séparateur et Équivalent concret en km voiture évités -->
      <div class=" border-t border-white/15 pt-3.5 mb-2 flex items-center gap-2.5 text-xs sm:text-sm text-white/90 font-medium">
        <!-- Icône Voiture / Mobilité propre -->
        <div class="p-1 rounded-lg bg-white/10 shrink-0">
          <Car class="w-4 h-4 text-emerald-300" />
        </div>
        <p class="leading-snug">
          {{ co2Stats.equivalent_label || co2Stats.trees_label }}
        </p>
      </div>
      <span class="mt-2 text-[10px] sm:text-xs text-white/50 font-normal flex flex-col gap-0.5">
        <p>* Tout les calculs d'émission de CO₂ sont basés sur les données de l'ADEME et Impact CO₂</p>
        <a href="https://impactco2.fr/outils/transport" target="_blank" rel="noopener noreferrer" class="text-emerald-300 hover:text-emerald-400 underline">
          En savoir plus sur impactco2.fr
        </a>
        <a href="https://www.ademe.fr" target="_blank" rel="noopener noreferrer" class="text-emerald-300 hover:text-emerald-400 underline">
          En savoir plus sur ADEME
        </a>
      </span>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Car } from 'lucide-vue-next';
import { fetchUserCo2Stats, type UserCo2Stats } from '~/utils/trips.service';
import { useUserProfile } from '~/composables/useUserProfile';
import { EMISSION_FACTORS_G_PER_KM } from '~/utils/itinerary.helpers';

const { profile } = useUserProfile();

const defaultStats: UserCo2Stats = {
  total_co2_saved_kg: 12.5,
  weekly_co2_saved_kg: 4.2,
  percentage_vs_last_week: -15,
  percentage_label: '-15% vs semaine dernière',
  equivalent_trees: 2,
  equivalent_car_km: 57,
  equivalent_label: 'Équivalent de 57 km en voiture thermique évités.',
  trees_label: 'Équivalent de 57 km en voiture thermique évités.',
};

const co2Stats = ref<UserCo2Stats>({ ...defaultStats });
const isLoading = ref(true);

// Formatage du titre principal : "12.5 kg CO₂ évités" ou "650 g CO₂ évités"
const displayCo2Headline = computed(() => {
  const kg = co2Stats.value.total_co2_saved_kg;
  if (kg > 0 && kg < 1.0) {
    const grams = Math.round(kg * 1000);
    return `${grams} g CO₂ évités`;
  }
  const formatted = Number.isInteger(kg) ? kg.toString() : kg.toFixed(1);
  return `${formatted} kg CO₂ évités`;
});

async function loadCo2Stats() {
  isLoading.value = true;
  try {
    const data = await fetchUserCo2Stats();
    if (data && typeof data.total_co2_saved_kg === 'number') {
      co2Stats.value = {
        ...data,
        equivalent_label:
          data.equivalent_label ||
          `Équivalent de ${Math.round((data.total_co2_saved_kg * 1000) / EMISSION_FACTORS_G_PER_KM.CAR)} km en voiture thermique évités.`,
      };
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
  const carKm = Math.round((co2 * 1000) / EMISSION_FACTORS_G_PER_KM.CAR);

  co2Stats.value = {
    total_co2_saved_kg: Number(co2.toFixed(2)),
    weekly_co2_saved_kg: Number((co2 * 0.35).toFixed(2)),
    percentage_vs_last_week: -15,
    percentage_label: '-15% vs semaine dernière',
    equivalent_trees: Math.max(1, Math.round(co2 / 6.25)),
    equivalent_car_km: carKm,
    equivalent_label: `Équivalent de ${carKm} km en voiture thermique évités.`,
    trees_label: `Équivalent de ${carKm} km en voiture thermique évités.`,
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
