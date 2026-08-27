<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- En-tête avec bouton retour -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="emit('back')"
        class="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-sm"
        aria-label="Retour aux propositions"
      >
        <ArrowLeft class="w-4 h-4" />
      </button>
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-bold text-gray-900">
          Recherche
        </h1>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5F1] text-[#104e35]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
          Direct
        </span>
      </div>
    </div>

    <!-- Capsule Adresses (Départ et Arrivée) -->
    <div class="relative rounded-2xl p-3 bg-white border border-gray-100 flex flex-col gap-2.5 shadow-sm">
      <!-- Départ -->
      <div class="flex items-center gap-2.5 bg-[#F8FAF9] rounded-xl px-3 py-2 text-xs font-medium text-gray-800">
        <Navigation class="w-4 h-4 text-[#104e35] shrink-0" />
        <span class="truncate">{{ startName || 'Ma position actuelle' }}</span>
      </div>

      <!-- Destination -->
      <div class="flex items-center gap-2.5 bg-[#F8FAF9] rounded-xl px-3 py-2 text-xs font-medium text-gray-800">
        <MapPin class="w-4 h-4 text-gray-400 shrink-0" />
        <span class="truncate">{{ endName || 'Destination sélectionnée' }}</span>
      </div>
    </div>

    <!-- Les 2 Cartes KPI (Temps & Économie CO2 réels) -->
    <div class="grid grid-cols-2 gap-3">
      <!-- KPI 1 : Arrivée estimée -->
      <div class="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#EAF5F1] text-[#104e35] flex items-center justify-center shrink-0">
          <Clock class="w-4.5 h-4.5" />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Arrivée</span>
          <span class="text-xs font-bold text-gray-900 truncate">
            {{ itinerary.durationMinutes }} min • {{ itinerary.arrivalTime }}
          </span>
        </div>
      </div>

      <!-- KPI 2 : Économie CO2 -->
      <div class="bg-[#c5eadd] border border-[#a7d9c6] rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-white/70 text-[#104e35] flex items-center justify-center shrink-0">
          <Leaf class="w-4.5 h-4.5 fill-[#104e35]" />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-[10px] uppercase font-bold text-[#104e35]/80 tracking-wider">Économie</span>
          <span class="text-xs font-black text-[#104e35] truncate">
            {{ itinerary.type === 'CAR' ? '0 g (Voiture)' : `${formatCo2(itinerary.co2SavedKg)} CO₂` }}
          </span>
        </div>
      </div>
    </div>

    <!-- Carte Détails du trajet (Timeline étape par étape 100% réelle) -->
    <div class="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold text-gray-400 tracking-wider uppercase">
          Détails du trajet
        </h2>
        <span v-if="itinerary.realTime && itinerary.type === 'TRANSIT'" class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Temps réel
        </span>
      </div>

      <!-- Timeline verticale dynamique -->
      <div class="flex flex-col gap-4 relative">
        <div
          v-for="(leg, index) in itinerary.legs"
          :key="index"
          class="flex items-start gap-3.5 relative"
        >
          <!-- Ligne pointillée de connexion verticale -->
          <div
            v-if="index < itinerary.legs.length - 1"
            class="absolute left-4 top-8 bottom-0 w-0.5 border-l-2 border-dashed border-gray-200 -z-0"
          ></div>

          <!-- Pastille / Icône de l'étape selon le mode réel -->
          <div class="z-10 shrink-0">
            <!-- Mode Vélo / Cyclable -->
            <div
              v-if="leg.mode === 'BICYCLE'"
              class="w-8 h-8 rounded-full bg-[#104e35] text-white flex items-center justify-center shadow-sm"
            >
              <Bike class="w-4 h-4" />
            </div>

            <!-- Mode Marche -->
            <div
              v-else-if="leg.mode === 'WALK'"
              class="w-8 h-8 rounded-full bg-[#EAF5F1] text-[#104e35] flex items-center justify-center border border-[#c5eadd] shadow-sm"
            >
              <Footprints class="w-4 h-4" />
            </div>

            <!-- Mode Voiture -->
            <div
              v-else-if="leg.mode === 'CAR'"
              class="w-8 h-8 rounded-full bg-[#334155] text-white flex items-center justify-center shadow-sm"
            >
              <Car class="w-4 h-4" />
            </div>

            <!-- Mode Transit / Métro / Tram / Bus avec pastille de ligne -->
            <div
              v-else-if="leg.mode === 'SUBWAY' || leg.mode === 'TRANSIT' || leg.mode === 'TRAM' || leg.mode === 'BUS' || leg.mode === 'RAIL'"
              class="w-8 h-8 rounded-full bg-[#155dfc] text-white flex items-center justify-center font-black text-xs shadow-sm"
            >
              {{ leg.line || itinerary.badge || '1' }}
            </div>

            <!-- Mode par défaut -->
            <div
              v-else
              class="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center"
            >
              <Navigation class="w-4 h-4" />
            </div>
          </div>

          <!-- Contenu descriptif réel de l'étape -->
          <div class="flex flex-col grow min-w-0 pt-0.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-gray-900 truncate">
                {{ leg.title }}
              </span>

              <!-- Badge statut d'étape (Départ, En trajet, Arrivée) -->
              <span
                v-if="itinerary.legs.length === 1"
                class="bg-[#104e35] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
              >
                Direct
              </span>
              <span
                v-else-if="index === 0"
                class="bg-[#104e35] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
              >
                Départ
              </span>
              <span
                v-else-if="index === itinerary.legs.length - 1"
                class="text-[10px] font-bold text-gray-400 uppercase tracking-wider"
              >
                Arrivée
              </span>
              <span
                v-else
                class="text-[10px] font-bold text-blue-600 uppercase tracking-wider"
              >
                Correspondance
              </span>
            </div>

            <p class="text-xs text-gray-500 mt-0.5">
              {{ leg.instruction }}
            </p>

            <!-- Détail spécifique étape Transit (Métro / Tram / Bus) avec arrêts réels et temps réel -->
            <div v-if="leg.mode === 'SUBWAY' || leg.mode === 'TRANSIT' || leg.mode === 'BUS' || leg.mode === 'TRAM'" class="mt-2 flex flex-col gap-1.5">
              <div class="flex items-center justify-between text-xs text-gray-600 font-medium">
                <div class="flex items-center gap-1.5">
                  <Train class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>
                    {{ leg.durationMinutes }} min
                    <span v-if="leg.stopsCount && leg.stopsCount > 0"> • {{ leg.stopsCount }} arrêts</span>
                  </span>
                </div>
                <div v-if="leg.departureStatus" class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full" :class="leg.departureStatus === 'DELAYED' ? 'bg-amber-500' : 'bg-emerald-500'"></span>
                  <span :class="leg.departureStatus === 'DELAYED' ? 'text-amber-600 text-[11px]' : 'text-emerald-700 text-[11px]'">
                    {{ leg.departureStatus === 'DELAYED' ? `+${leg.delayMinutes}m` : 'À l\'heure' }}
                  </span>
                </div>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-[#155dfc] h-full rounded-full w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Options Démo Oral (Réservées aux ADMIN) & Boutons d'action -->
    <div class="flex flex-col gap-3 mt-1">
      <!-- Option Switch Démo Oral / Mode Test (Visible uniquement si ADMIN) -->
      <div
        v-if="isAdmin"
        class="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Sparkles class="w-4 h-4" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <p class="text-xs font-bold text-gray-900 leading-tight">Simulation Démo</p>
              <span class="text-[9px] font-black bg-amber-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                ADMIN
              </span>
            </div>
            <p class="text-[11px] text-gray-500 leading-tight">Déplacement automatique pour tests/oral</p>
          </div>
        </div>
        <div
          @click="isSimulationMode = !isSimulationMode"
          class="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer shrink-0"
          :class="isSimulationMode ? 'bg-[#0F5238]' : 'bg-gray-300'"
        >
          <div
            class="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform"
            :class="isSimulationMode ? 'translate-x-5' : 'translate-x-0'"
          />
        </div>
      </div>

      <!-- Bouton Démarrer / Arrêter le Guidage -->
      <button
        v-if="!navStore.isActive"
        type="button"
        @click="handleStartGuidance"
        class="w-full bg-[#0F5238] hover:bg-[#0b3d2a] text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#0F5238]/15 active:scale-[0.98] transition-all cursor-pointer text-sm"
      >
        <Navigation class="w-4 h-4 fill-white" />
        <span>Démarrer le guidage</span>
      </button>

      <button
        v-else
        type="button"
        @click="navStore.stopNavigation"
        class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-red-600/15 active:scale-[0.98] transition-all cursor-pointer text-sm"
      >
        <Square class="w-4 h-4 fill-white" />
        <span>Arrêter le guidage</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PropType } from 'vue'
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Clock,
  Leaf,
  Bike,
  Car,
  Footprints,
  Train,
  Square,
  Sparkles,
} from 'lucide-vue-next'
import type { ItineraryProposal } from '~/types/itinerary'
import { useNavigationStore } from '~/stores/navigation'
import { useUserProfile } from '~/composables/useUserProfile'
import { formatCo2 } from '~/utils/itinerary.helpers'

const props = defineProps({
  itinerary: {
    type: Object as PropType<ItineraryProposal>,
    required: true,
  },
  startName: {
    type: String,
    default: 'Ma position actuelle',
  },
  endName: {
    type: String,
    default: 'Destination sélectionnée',
  },
})

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'finish'): void
  (e: 'start-navigation', options: { simulate: boolean }): void
}>()

const navStore = useNavigationStore()
const { isAdmin } = useUserProfile()
const isSimulationMode = ref(true)

function handleStartGuidance() {
  // Si admin, respecte le choix du switch ; sinon guidage réel sans simulation
  const shouldSimulate = isAdmin.value ? isSimulationMode.value : false
  emit('start-navigation', { simulate: shouldSimulate })
}
</script>
