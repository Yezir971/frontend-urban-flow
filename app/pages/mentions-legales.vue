<template>
  <div class="min-h-screen bg-[#F7F9F8] text-gray-800 pb-16">
    <!-- En-tête avec bouton retour -->
    <header class="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3.5 flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-3 max-w-4xl mx-auto w-full">
        <button
          type="button"
          @click="router.back()"
          class="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
          aria-label="Retour"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <h1 class="text-base font-bold text-gray-900 leading-tight">
            Mentions Légales
          </h1>
          <p class="text-xs text-gray-500">Urban Flow — Informations Réglementaires</p>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-3xl mx-auto px-4 py-6">
      <div class="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
        
        <div class="border-b border-gray-100 pb-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E1F6EB] text-[#0F5238]">
            <Scale class="w-3.5 h-3.5" />
            Conforme Loi LCEN & Droit Français
          </span>
          <h2 class="text-xl md:text-2xl font-black text-gray-900 mt-2">
            Mentions Légales
          </h2>
          <p class="text-xs text-gray-400 mt-1">Dernière mise à jour : 27 août 2026</p>
        </div>

        <!-- 1. Présentation du site -->
        <section class="flex flex-col gap-3">
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238]"></span>
            1. Présentation et Édition du Site
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), il est précisé aux utilisateurs du site et de l'application 
            <a href="https://urban-flow-lyon.fr" target="_blank" rel="noopener" class="text-[#0F5238] font-bold underline ml-1">https://urban-flow-lyon.fr</a> l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
          </p>

          <div class="bg-[#F8FAF9] rounded-2xl p-4 border border-gray-100 flex flex-col gap-2.5 text-xs text-gray-700">
            <div>
              <strong class="font-semibold text-gray-900">Éditeur du site :</strong>
              <span> Collectivité territoriale de Lyon — Projet Urban Flow</span>
            </div>
            <div>
              <strong class="font-semibold text-gray-900">Adresse de contact :</strong>
              <span> 6 rue du titre, 69001 Lyon, France</span>
            </div>
            <div>
              <strong class="font-semibold text-gray-900">Responsable de publication :</strong>
              <span> Hénette Claire — <a href="mailto:claire-henette@titre.fr" class="text-[#0F5238] font-medium underline">claire-henette@titre.fr</a></span>
            </div>
            <div>
              <strong class="font-semibold text-gray-900">Conception & Développement Web :</strong>
              <span> James Ahmedaly — <a href="mailto:contact@urban-flow-lyon.fr" class="text-[#0F5238] font-medium underline">contact@urban-flow-lyon.fr</a></span>
            </div>
          </div>
        </section>

        <!-- 2. Hébergement -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238]"></span>
            2. Hébergement de l'Infrastructure
          </h3>
          <div class="bg-[#E1F6EB]/50 border border-[#c5eadd] rounded-2xl p-4 text-xs text-gray-700 leading-relaxed flex flex-col gap-1">
            <p><strong class="font-bold text-[#0F5238]">Hébergeur :</strong> OVHcloud France</p>
            <p><strong>Siège social :</strong> 2 rue Kellermann, 59100 Roubaix, France</p>
            <p><strong>Site internet :</strong> <a href="https://www.ovhcloud.com" target="_blank" rel="noopener" class="underline text-[#0F5238]">www.ovhcloud.com</a></p>
          </div>
        </section>

        <!-- 3. Propriété intellectuelle -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238]"></span>
            3. Propriété Intellectuelle et Droits d'Auteur
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            L'ensemble des éléments constituant l'application Urban Flow (structure générale, logiciels, textes, images animées ou non, graphismes, logos, icônes, sons et bases de données) est la propriété exclusive de ses créateurs ou fait l'objet d'une autorisation d'utilisation.
          </p>
          <p class="text-sm text-gray-600 leading-relaxed">
            Toute reproduction, représentation, modification, publication ou adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable, conformément aux articles L.335-2 et suivants du Code de la propriété intellectuelle.
          </p>
        </section>

        <!-- 4. Limitation de responsabilité -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238]"></span>
            4. Limitation de Responsabilité
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            Les informations et calculs d'itinéraires diffusés sur Urban Flow sont fournis à titre indicatif à partir des réseaux de transport en commun et de flux Open Data métropolitains.
          </p>
          <p class="text-sm text-gray-600 leading-relaxed">
            L'éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site, d'une inexactitude ponctuelle dans les horaires réels ou d'une interruption temporaire du service pour maintenance.
          </p>
        </section>

        <!-- 5. Données personnelles & RGPD -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238]"></span>
            5. Données Personnelles et Cookies
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            Pour en savoir plus sur la collecte de vos données, l'utilisation de la géolocalisation et l'exercice de vos droits Informatique et Libertés (accès, rectification, suppression), veuillez consulter notre page dédiée :
          </p>
          <NuxtLink
            to="/confidentialite"
            class="inline-flex items-center gap-2 text-xs font-bold text-[#0F5238] bg-[#E1F6EB] hover:bg-[#c5eadd] px-4 py-2.5 rounded-2xl w-fit transition-colors"
          >
            <span>Consulter la Politique de Confidentialité</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </section>

        <!-- 6. Droit applicable et attribution de juridiction -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238]"></span>
            6. Droit Applicable et Juridiction
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            Tout litige en relation avec l'utilisation du site <a href="https://urban-flow-lyon.fr" target="_blank" rel="noopener" class="text-[#0F5238] font-semibold underline">https://urban-flow-lyon.fr</a> est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents de Lyon.
          </p>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft, Scale, ArrowRight } from 'lucide-vue-next'

const router = useRouter()

definePageMeta({
  layout: 'juridique'
})
</script>
