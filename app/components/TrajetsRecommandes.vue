<template>
  <div class="flex flex-col gap-4 w-full">
    <!-- En-tête avec bouton retour vers le formulaire de recherche -->
    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="emit('back')"
        class="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-sm"
        aria-label="Retour à la recherche"
      >
        <ArrowLeft class="w-4 h-4" />
      </button>
      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-bold text-gray-900 leading-tight">
            Trajets disponibles
          </h1>
        </div>
        <span class="text-xs text-gray-500">
          Sélectionnez un itinéraire pour voir le tracé
        </span>
      </div>
    </div>

    <!-- Titre de section -->
    <div class="flex items-center justify-between mt-1">
      <h2 class="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Trajets recommandés
      </h2>
    </div>

    <!-- Liste des cartes de propositions dynamiques OTP -->
    <div class="flex flex-col gap-3">
      <div
        v-for="proposal in proposals"
        :key="proposal.id"
        @click="emit('select', proposal)"
        class="bg-white border border-gray-100/80 rounded-3xl p-4.5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer active:scale-[0.98] flex flex-col gap-3 group"
      >
        <!-- Ligne principale : Icône / Infos / Durée -->
        <div class="flex items-center justify-between gap-3">
          <!-- Côté Gauche : Badge + Textes -->
          <div class="flex items-center gap-3.5 min-w-0">
            <!-- Badge Transit (Bleu) avec vrai nom de ligne TCL -->
            <div
              v-if="proposal.type === 'TRANSIT'"
              class="w-11 h-11 rounded-full bg-[#155dfc] text-white flex items-center justify-center font-black text-base shadow-sm shrink-0"
            >
              {{ proposal.badge || '1' }}
            </div>

            <!-- Badge Marche (Vert clair) -->
            <div
              v-else-if="proposal.type === 'WALK'"
              class="w-11 h-11 rounded-full bg-[#dcfce7] text-[#104e35] flex items-center justify-center shrink-0 shadow-sm"
            >
              <Footprints class="w-5 h-5" />
            </div>

            <!-- Badge Vélo / Trottinette (Vert clair) -->
            <div
              v-else
              class="w-11 h-11 rounded-full bg-[#dcfce7] text-[#104e35] flex items-center justify-center shrink-0 shadow-sm"
            >
              <Bike class="w-5 h-5" />
            </div>

            <!-- Textes descriptifs réels issus d'OTP -->
            <div class="flex flex-col min-w-0">
              <h3 class="font-bold text-gray-900 text-[15px] leading-tight truncate">
                {{ proposal.title }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5 truncate">
                {{ proposal.subtitle }}
              </p>
            </div>
          </div>

          <!-- Côté Droit : Durée & Mention temps réel -->
          <div class="flex flex-col items-end shrink-0">
            <span class="text-lg font-black text-[#104e35]">
              {{ proposal.durationMinutes }} min
            </span>

            <!-- Indicateur Temps Réel pour les Transports -->
            <div v-if="proposal.leavesInMinutes" class="flex items-center gap-1 text-[11px] font-medium">
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0"
                :class="proposal.departureStatus === 'DELAYED' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'"
              ></span>
              <span :class="proposal.departureStatus === 'DELAYED' ? 'text-amber-600 font-semibold' : 'text-emerald-700 font-semibold'">
                {{ proposal.departureStatus === 'DELAYED' ? `+${proposal.delayMinutes}m retard` : `Part dans ${proposal.leavesInMinutes}m` }}
              </span>
            </div>

            <span
              v-else-if="proposal.priceApprox"
              class="text-[11px] text-gray-400 font-medium"
            >
              {{ proposal.priceApprox }}
            </span>
            <span
              v-else-if="proposal.type === 'WALK'"
              class="text-[11px] text-gray-400 font-medium"
            >
              Gratuit
            </span>
          </div>
        </div>

        <!-- Ligne inférieure : Économie CO2 & Badges & Chevron -->
        <div class="flex items-center justify-between pt-1 border-t border-gray-50/80 text-xs">
          <!-- CO2 économisé dynamique -->
          <div class="flex items-center gap-1.5 text-[#104e35] font-semibold text-[11px]">
            <Leaf class="w-3.5 h-3.5 fill-[#104e35] shrink-0" />
            <span>
              {{ proposal.type === 'WALK' ? '0.0 kg CO2' : `${proposal.co2SavedKg} kg CO2 saved` }}
            </span>
          </div>

          <!-- Badge optionnel (ex: ECO-HERO / Temps Réel) + Chevron -->
          <div class="flex items-center gap-2">
            <span
              v-if="proposal.tag"
              class="bg-[#104e35] text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase"
            >
              {{ proposal.tag }}
            </span>
            <ChevronRight class="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ArrowLeft, Footprints, Bike, Leaf, ChevronRight } from 'lucide-vue-next'
import type { ItineraryProposal } from '~/types/itinerary'

const { proposals } = defineProps({
  proposals: {
    type: Array as PropType<ItineraryProposal[]>,
    required: true,
    default: () => []
  }
})
console.log('proposals', proposals)
const emit = defineEmits<{
  (e: 'select', proposal: ItineraryProposal): void
  (e: 'back'): void
}>()
</script>
