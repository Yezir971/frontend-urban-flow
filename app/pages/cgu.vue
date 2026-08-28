<script setup lang="ts">
import { FileText } from 'lucide-vue-next';

definePageMeta({
  title: 'Conditions Générales d\'Utilisation - Urban Flow',
  layout: 'juridique',
});
</script>

<template>
  <div class="min-h-screen bg-[#F7F9F8] dark:bg-[#0B1311] text-gray-800 dark:text-gray-100 pb-16 transition-colors duration-200">
    <!-- En-tête avec bouton retour -->
    <header class="sticky top-0 z-20 bg-white/90 dark:bg-[#15221E]/90 backdrop-blur-md border-b border-gray-100 dark:border-emerald-950/40 px-4 py-3.5 flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-3 max-w-4xl mx-auto w-full">
        <UiButtonReturn />
        <div>
          <h1 class="text-base font-bold text-gray-900 dark:text-white leading-tight">
            Conditions Générales d'Utilisation
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400">Urban Flow — Éco-mobilité Lyon</p>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-3xl mx-auto px-4 py-6">
      <div class="bg-white dark:bg-[#15221E] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-emerald-900/30 shadow-sm flex flex-col gap-6">
        
        <div class="border-b border-gray-100 dark:border-emerald-950/40 pb-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E1F6EB] dark:bg-[#1B4D3E] text-[#0F5238] dark:text-[#34D399]">
            <FileText class="w-3.5 h-3.5" />
            Document officiel
          </span>
          <h2 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-2">
            Conditions Générales d'Utilisation (CGU)
          </h2>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Dernière mise à jour : 28 août 2026</p>
        </div>

        <!-- Article 1 -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            Article 1 — Objet et Présentation du Service
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Les présentes Conditions Générales d'Utilisation (ci-après les « <strong>CGU</strong> ») régissent l'accès et l'utilisation de la plateforme et application progressive (PWA) <strong>Urban Flow</strong> (ci-après l'« <strong>Application</strong> »), éditée en France (Lyon / Paris).
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Urban Flow est une solution d'éco-mobilité multimodale facilitant la planification, la personnalisation et le guidage d'itinéraires au sein de la Métropole de Lyon (métro, bus, tramway, vélos en libre-service, marche, voiture), tout en valorisant l'impact écologique des usagers (calcul du CO2 économisé et points éco-citoyens).
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            L'utilisation de l'Application implique l'acceptation expresse et sans réserve des présentes CGU.
          </p>
        </section>

        <!-- Article 2 -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            Article 2 — Hébergement et Infrastructure
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            L'ensemble des services d'Urban Flow (application frontend, API backend NestJS et base de données Supabase) est hébergé en France et dans l'Union Européenne sur les infrastructures sécurisées d'<strong>OVHcloud</strong> (2 rue Kellermann, 59100 Roubaix, France).
          </p>
        </section>

        <!-- Article 3 -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            Article 3 — Accès au Service et Inscription
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            L'accès à l'Application est gratuit pour tout Utilisateur disposant d'un terminal connecté à Internet. L'accès à certaines fonctionnalités (sauvegarde des préférences, profil personnalisé, cumul d'éco-points) requiert la création d'un compte utilisateur sécurisé via email et mot de passe ou lien d'authentification (OTP).
          </p>
        </section>

        <!-- Article 4 -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            Article 4 — Géolocalisation
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            L'accès à la position GPS de l'appareil est soumis à l'autorisation explicite de l'Utilisateur. Les données GPS sont traitées <strong>exclusivement en temps réel</strong> afin de centrer la carte et d'assurer le guidage pas-à-pas. Aucun historique de vos coordonnées de déplacement physique n'est conservé ni revendu.
          </p>
        </section>

        <!-- Article 5 -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            Article 5 — Limitation de Responsabilité (Transports en commun)
          </h3>
          <div class="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/40 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex flex-col gap-1.5">
            <p><strong>Données Open Data indicatives :</strong> Les informations de transport (horaires, temps réel, perturbations, correspondances et tracés) proviennent des flux Open Data des réseaux métropolitains lyonnais (TCL, SYTRAL, Grand Lyon) et du calculateur OpenTripPlanner.</p>
            <p>L'Application fournit ces renseignements à titre indicatif et ne saurait être tenue pour responsable en cas de retards, pannes, grèves, modifications d'itinéraires ou incidents survenant sur le réseau réel de transport.</p>
            <p><strong>Sécurité :</strong> L'Utilisateur est seul responsable de sa sécurité et du respect du Code de la route lors de ses déplacements.</p>
          </div>
        </section>

        <!-- Article 6 -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            Article 6 — Contact et Support
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Pour toute demande d'assistance ou question relative aux présentes CGU, vous pouvez nous écrire à l'adresse suivante :
            <a href="mailto:contact@urban-flow-lyon.fr" class="text-[#0F5238] dark:text-[#34D399] font-bold underline ml-1">contact@urban-flow-lyon.fr</a>.
          </p>
        </section>

      </div>
    </main>
  </div>
</template>
