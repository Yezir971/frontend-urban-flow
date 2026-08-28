<template>
  <Teleport to="body">
    <Transition name="slide-down">
      <div
        v-if="navStore.isActive"
        class="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-white/95 dark:bg-[#15221E]/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-gray-100 dark:border-emerald-900/40 flex flex-col gap-3 transition-colors duration-200"
        style="z-index: 99999;"
      >
        <!-- Alerte de recalcul d'itinéraire en cas de déviation -->
        <div
          v-if="navStore.isRerouting"
          class="bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-2xl flex items-center gap-2 animate-pulse shadow-sm"
        >
          <RefreshCw class="w-4 h-4 animate-spin" />
          <span>Déviation détectée : Recalcul en cours...</span>
        </div>

        <!-- Instruction Turn-by-Turn en cours -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Icône du mode de l'étape courante -->
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-md transition-colors"
              :class="[
                navStore.currentLeg?.mode === 'SUBWAY' || navStore.currentLeg?.mode === 'TRANSIT' || navStore.currentLeg?.mode === 'TRAM' || navStore.currentLeg?.mode === 'BUS'
                  ? 'bg-[#155dfc]'
                  : navStore.currentLeg?.mode === 'BICYCLE'
                    ? 'bg-[#104e35] dark:bg-[#1D6045]'
                    : navStore.currentLeg?.mode === 'CAR'
                      ? 'bg-[#334155]'
                      : 'bg-[#104e35] dark:bg-[#1D6045]'
              ]"
            >
              <Train v-if="navStore.currentLeg?.mode === 'SUBWAY' || navStore.currentLeg?.mode === 'TRAM' || navStore.currentLeg?.mode === 'TRANSIT'" class="w-5 h-5" />
              <Bus v-else-if="navStore.currentLeg?.mode === 'BUS'" class="w-5 h-5" />
              <Bike v-else-if="navStore.currentLeg?.mode === 'BICYCLE'" class="w-5 h-5" />
              <Car v-else-if="navStore.currentLeg?.mode === 'CAR'" class="w-5 h-5" />
              <Footprints v-else class="w-5 h-5" />
            </div>

            <div class="flex flex-col min-w-0">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#0F5238] dark:text-[#34D399] flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Guidage en direct
              </span>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white leading-snug truncate">
                {{ navStore.currentLeg?.title || 'En route...' }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {{ navStore.currentLeg?.instruction }}
              </p>
            </div>
          </div>

          <!-- Actions de fin ou d'arrêt -->
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Bouton Arrivé / Terminer -->
            <button
              v-if="navStore.remainingPercent >= 80"
              type="button"
              @click="handleFinish"
              class="px-2.5 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0F5238] dark:text-[#34D399] hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-95 transition-all cursor-pointer font-bold text-xs flex items-center gap-1 shadow-xs"
              title="Terminer le trajet et enregistrer"
            >
              <Check class="w-4 h-4 text-emerald-700 dark:text-[#34D399]" />
              <span>Arrivé</span>
            </button>

            <!-- Bouton Arrêter le guidage -->
            <button
              type="button"
              @click="handleStop"
              class="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Arrêter le guidage"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Barre de progression -->
        <div class="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            class="bg-[#0F5238] dark:bg-[#34D399] h-full rounded-full transition-all duration-300"
            :style="{ width: `${navStore.remainingPercent}%` }"
          ></div>
        </div>

        <!-- KPI Durée & Distance restantes + Contrôles Démo Test (ADMIN) -->
        <div class="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-emerald-950/40">
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-[#0F5238] dark:text-[#34D399] text-sm">
              {{ navStore.remainingDurationMins }} min
            </span>
            <span class="text-gray-400 dark:text-gray-600">•</span>
            <span class="text-gray-600 dark:text-gray-300 font-medium">
              {{ formatDistance(navStore.remainingDistanceMeters) }}
            </span>
          </div>

          <!-- Outils Démo / Test : Pause, Vitesse, Test Déviation (Réservés au rôle ADMIN) -->
          <div v-if="isAdmin && navStore.isSimulating" class="flex items-center gap-1 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 p-1 rounded-xl">
            <button
              type="button"
              @click="navStore.togglePause"
              class="p-1 rounded-lg hover:bg-white dark:hover:bg-[#1A2D25] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
              :title="navStore.isPaused ? 'Reprendre' : 'Pause'"
            >
              <Play v-if="navStore.isPaused" class="w-3.5 h-3.5 text-emerald-600 dark:text-[#34D399] fill-emerald-600 dark:fill-[#34D399]" />
              <Pause v-else class="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              @click="cycleSpeed"
              class="px-1.5 py-0.5 rounded-lg text-[10px] font-bold text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-[#1A2D25] transition-colors cursor-pointer"
              title="Vitesse de simulation"
            >
              {{ navStore.simulationSpeed }}x
            </button>

            <!-- Bouton spécial Test : Simuler une déviation pour tester le recalcul automatique -->
            <button
              type="button"
              @click="simulateDeviation"
              class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#0F5238] dark:bg-[#1D6045] text-white hover:bg-[#0b3d2a] dark:hover:bg-[#154D36] transition-all cursor-pointer"
              title="Dévier du tracé pour tester le recalcul automatique"
            >
              Tester Déviation
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Train,
  Bus,
  Bike,
  Car,
  Footprints,
  X,
  Play,
  Pause,
  RefreshCw,
  Check,
} from 'lucide-vue-next'
import { useNavigationStore } from '~/stores/navigation'
import { useUserProfile } from '~/composables/useUserProfile'
import { formatDistance } from '~/utils/itinerary.helpers'

const navStore = useNavigationStore()
const { isAdmin } = useUserProfile()
const toast = useToast()

const emit = defineEmits<{
  (e: 'stop'): void
  (e: 'deviate', coords: [number, number]): void
}>()

function handleFinish() {
  navStore.stopNavigation()
  emit('stop')
}

function handleStop() {
  navStore.stopNavigation()
  emit('stop')
  toast.add({
    title: 'Guidage arrêté',
    description: 'Vous êtes revenu au mode consultation du trajet.',
    color: 'neutral',
    icon: 'i-lucide-square',
  })
}

function cycleSpeed() {
  const speeds = [1, 2, 4]
  const currentIndex = speeds.indexOf(navStore.simulationSpeed)
  const nextSpeed = speeds[(currentIndex + 1) % speeds.length] || 1
  navStore.setSpeed(nextSpeed)
}

function simulateDeviation() {
  if (!navStore.currentPosition) return
  // Déviation artificielle de ~150m vers le Nord-Ouest
  const [lat, lon] = navStore.currentPosition
  const deviatedCoords: [number, number] = [lat + 0.0018, lon - 0.0018]
  navStore.triggerRerouting(deviatedCoords)
  emit('deviate', deviatedCoords)
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
