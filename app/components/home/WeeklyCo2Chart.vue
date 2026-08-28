<template>
  <div class="w-full bg-white dark:bg-[#15221E] rounded-3xl p-5 sm:p-7 border border-gray-100 dark:border-emerald-900/30 shadow-xs flex flex-col gap-6 transition-colors duration-200">
    <!-- En-tête du graphique -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#104E35] dark:text-[#34D399] flex items-center justify-center">
            <BarChart3 class="w-4 h-4" />
          </div>
          <h2 class="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
            Consommation CO₂ de la semaine
          </h2>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          CO₂ réel émis (mobilité douce & transports) vs équivalent en voiture thermique
        </p>
      </div>

      <!-- Badge de réduction globale -->
      <div
        v-if="reductionPercentage > 0"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C6F0DB] dark:bg-[#1C4D38] text-xs font-bold text-[#104E35] dark:text-[#A7F3D0] self-start sm:self-auto"
      >
        <TrendingDown class="w-3.5 h-3.5" />
        <span>-{{ reductionPercentage }}% de CO₂ émis vs voiture</span>
      </div>
    </div>

    <!-- 3 Cartes de résumé rapide -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <!-- CO2 Émis réellement -->
      <div class="bg-[#F8FAF9] dark:bg-[#111C18] rounded-2xl p-3.5 flex flex-col justify-between border border-gray-100/60 dark:border-emerald-950/50">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">CO₂ ÉMIS</span>
          <span class="w-2.5 h-2.5 rounded-full bg-[#104E35] dark:bg-[#34D399]" />
        </div>
        <span class="text-lg font-black text-gray-900 dark:text-white mt-1.5">{{ totalActualCo2 }} kg</span>
        <span class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Transports & mobilités actives</span>
      </div>

      <!-- CO2 Théorique voiture -->
      <div class="bg-[#FEF2F2] dark:bg-[#251414] rounded-2xl p-3.5 flex flex-col justify-between border border-red-100/60 dark:border-red-950/40">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">SI EN VOITURE</span>
          <span class="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
        </div>
        <span class="text-lg font-black text-red-600 dark:text-red-400 mt-1.5">{{ totalCarCo2 }} kg</span>
        <span class="text-[10px] text-red-400/80 dark:text-red-400/60 mt-0.5">Thermique (218g/km)</span>
      </div>

      <!-- CO2 Économisé -->
      <div class="bg-[#C6F0DB]/60 dark:bg-[#143B2B] rounded-2xl p-3.5 flex flex-col justify-between border border-emerald-200/60 dark:border-emerald-800/40">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-wider text-[#104E35] dark:text-[#A7F3D0]">CO₂ ÉCONOMISÉ</span>
          <Leaf class="w-3.5 h-3.5 text-[#104E35] dark:text-[#34D399]" />
        </div>
        <span class="text-lg font-black text-[#104E35] dark:text-[#34D399] mt-1.5">{{ totalSavedCo2 }} kg</span>
        <span class="text-[10px] text-[#104E35]/80 dark:text-[#A7F3D0]/80 mt-0.5">Grâce à vos choix écoresponsables</span>
      </div>
    </div>

    <!-- Conteneur Graphique Nuxt Charts (Grouped Bar Chart) -->
    <div class="w-full relative min-h-70">
      <ClientOnly>
        <BarChart
          :data="weeklyData"
          :height="280"
          :categories="chartCategories"
          :y-axis="['actual_co2', 'car_co2']"
          :group-padding="0.1"
          :bar-padding="0.2"
          :x-num-ticks="7"
          :radius="6"
          :x-formatter="xFormatter"
          :y-formatter="yFormatter"
          :legend-position="LegendPosition.TopRight"
          :hide-legend="false"
          :y-grid-line="true"
        />
        <template #fallback>
          <div class="w-full h-70 flex items-center justify-center bg-[#F8FAF9] dark:bg-[#111C18] rounded-2xl text-xs text-gray-400">
            Chargement du graphique...
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BarChart3, TrendingDown, Leaf } from 'lucide-vue-next';
import { LegendPosition } from 'vue-chrts/enums';
import { useTheme } from '~/composables/useTheme';

type WeeklyCo2Item = {
  day: string;
  actual_co2: number;
  car_co2: number;
  co2_saved?: number;
};

const config = useRuntimeConfig();
const rawUrl = (config.public?.urlBack as string | undefined) || '';
const gatewayUrl = rawUrl.replace(/\/$/, '');
const session = useSupabaseSession();
const { isDark } = useTheme();

// Données par défaut représentatives de la semaine (Lun à Dim)
const defaultWeeklyData: WeeklyCo2Item[] = [
  { day: 'Lun', actual_co2: 0.2, car_co2: 1.8, co2_saved: 1.6 },
  { day: 'Mar', actual_co2: 0.1, car_co2: 2.1, co2_saved: 2.0 },
  { day: 'Mer', actual_co2: 0.0, car_co2: 1.4, co2_saved: 1.4 },
  { day: 'Jeu', actual_co2: 0.3, car_co2: 2.4, co2_saved: 2.1 },
  { day: 'Ven', actual_co2: 0.1, car_co2: 1.9, co2_saved: 1.8 },
  { day: 'Sam', actual_co2: 0.4, car_co2: 2.8, co2_saved: 2.4 },
  { day: 'Dim', actual_co2: 0.0, car_co2: 0.9, co2_saved: 0.9 },
];

const weeklyData = ref<WeeklyCo2Item[]>(defaultWeeklyData);
const isLoading = ref(false);

const chartCategories = computed(() => ({
  actual_co2: { name: 'CO₂ réel émis', color: isDark.value ? '#34D399' : '#104E35' },
  car_co2: { name: 'Si en voiture', color: '#EF4444' },
}));

const xFormatter = (i: number): string => `${weeklyData.value[i]?.day || ''}`;
const yFormatter = (tick: number): string => `${tick} kg`;

const totalActualCo2 = computed(() => {
  const sum = weeklyData.value.reduce((acc, curr) => acc + (Number(curr.actual_co2) || 0), 0);
  return Number(sum.toFixed(1));
});

const totalCarCo2 = computed(() => {
  const sum = weeklyData.value.reduce((acc, curr) => acc + (Number(curr.car_co2) || 0), 0);
  return Number(sum.toFixed(1));
});

const totalSavedCo2 = computed(() => {
  const diff = totalCarCo2.value - totalActualCo2.value;
  return Math.max(0, Number(diff.toFixed(1)));
});

const reductionPercentage = computed(() => {
  if (totalCarCo2.value <= 0) return 0;
  const pct = Math.round((totalSavedCo2.value / totalCarCo2.value) * 100);
  return Math.min(100, Math.max(0, pct));
});

async function fetchWeeklyData() {
  const token = session.value?.access_token;
  if (!token) return;

  isLoading.value = true;
  try {
    const data = await $fetch<{
      days: { day: string; actual_co2: number; car_co2: number; co2_saved: number }[];
      total_actual_co2: number;
      total_car_co2: number;
      total_co2_saved: number;
    }>(`${gatewayUrl}/api/user/co2-weekly`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (data?.days && data.days.length > 0) {
      const hasTrips = data.days.some((d) => d.car_co2 > 0 || d.actual_co2 > 0);
      if (hasTrips) {
        weeklyData.value = data.days.map((d) => ({
          day: d.day,
          actual_co2: d.actual_co2,
          car_co2: d.car_co2,
          co2_saved: d.co2_saved,
        }));
      }
    }
  } catch (err) {
    console.warn('Erreur récupération weekly CO2, fallback aux données par défaut:', err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchWeeklyData();
});
</script>
