<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'

definePageMeta({
  layout: 'juridique',
});

useSeoMeta({
  title: 'Politique de Confidentialité & RGPD',
  ogTitle: 'Politique de Confidentialité & Données Personnelles · Urban Flow',
  description: 'Consultez la politique de confidentialité d\'Urban Flow. Traitement local et temps réel de la géolocalisation, conformité RGPD et protection de vos données.',
  ogDescription: 'Consultez la politique de confidentialité d\'Urban Flow. Traitement local et temps réel de la géolocalisation, conformité RGPD et protection de vos données.',
  ogUrl: 'https://urban-flow-lyon.fr/confidentialite',
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
            Politique de Confidentialité
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400">Conformité RGPD & Données personnelles</p>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-3xl mx-auto px-4 py-6">
      <div class="bg-white dark:bg-[#15221E] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-emerald-900/30 shadow-sm flex flex-col gap-6">
        
        <div class="border-b border-gray-100 dark:border-emerald-950/40 pb-4">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E1F6EB] dark:bg-[#1B4D3E] text-[#0F5238] dark:text-[#34D399]">
            <ShieldCheck class="w-3.5 h-3.5" />
            Conforme RGPD (UE 2016/679)
          </span>
          <h2 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-2">
            Protection des Données Personnelles
          </h2>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Dernière mise à jour : 28 août 2026</p>
        </div>

        <!-- 1. Responsable du traitement -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            1. Responsable du Traitement
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Le traitement des données personnelles collectées au sein de l'application <strong>Urban Flow</strong> est opéré sous la responsabilité de l'équipe d'édition d'Urban Flow.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Contact Délégué à la Protection des Données (DPO) :
            <a href="mailto:contact@urban-flow-lyon.fr" class="text-[#0F5238] dark:text-[#34D399] font-bold underline ml-1">contact@urban-flow-lyon.fr</a>
          </p>
        </section>

        <!-- 2. Données collectées -->
        <section class="flex flex-col gap-3">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            2. Données Collectées et Finalités
          </h3>
          <div class="overflow-x-auto rounded-2xl border border-gray-100 dark:border-emerald-950/40">
            <table class="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead class="bg-[#F8FAF9] dark:bg-[#111C18] text-gray-800 dark:text-gray-200 font-bold border-b border-gray-100 dark:border-emerald-950/40">
                <tr>
                  <th class="p-3">Catégorie</th>
                  <th class="p-3">Données</th>
                  <th class="p-3">Finalité</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-emerald-950/40">
                <tr>
                  <td class="p-3 font-semibold text-gray-900 dark:text-white">Compte</td>
                  <td class="p-3">Email, mot de passe chiffré, nom d'utilisateur, avatar</td>
                  <td class="p-3">Gestion de l'accès et sécurisation du compte</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-gray-900 dark:text-white">Géolocalisation</td>
                  <td class="p-3">Latitude, longitude (avec accord)</td>
                  <td class="p-3">Calcul du trajet au départ de la position et guidage direct</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-gray-900 dark:text-white">Préférences</td>
                  <td class="p-3">Vitesse de marche, modes favoris/exclus</td>
                  <td class="p-3">Personnalisation des recommandations</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold text-gray-900 dark:text-white">Éco-Statistiques</td>
                  <td class="p-3">CO2 économisé, kilomètres, points éco</td>
                  <td class="p-3">Valorisation des déplacements bas-carbone</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 3. Géolocalisation -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            3. Respect de la Vie Privée & Géolocalisation
          </h3>
          <div class="bg-[#E1F6EB]/50 dark:bg-[#1B4D3E]/30 border border-[#c5eadd] dark:border-emerald-800/40 rounded-2xl p-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed flex flex-col gap-1">
            <p class="font-bold text-[#0F5238] dark:text-[#34D399]">Traitement exclusivement local et en direct</p>
            <p>La position GPS de votre terminal est traitée uniquement en temps réel pour animer votre point sur la carte et recentrer le trajet.</p>
            <p><strong>Aucun historique de vos déplacements physiques n'est revendu, loué ou transmis à des tiers publicitaires.</strong></p>
          </div>
        </section>

        <!-- 4. Cookies et stockage local -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            4. Cookies et Stockage Local
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Urban Flow utilise le stockage local (<code>localStorage</code>) exclusivement pour des nécessités techniques d'authentification (jeton de session sécurisé JWT) et de mémorisation de vos préférences.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
            L'application n'utilise aucun cookie tiers ni aucun outil de pistage publicitaire.
          </p>
        </section>

        <!-- 5. Vos droits RGPD -->
        <section class="flex flex-col gap-2">
          <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0F5238] dark:bg-[#34D399]"></span>
            5. Vos Droits (Accès, Rectification, Suppression)
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Conformément aux articles 15 à 22 du RGPD, vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression totale de vos données personnelles.
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Pour exercer vos droits ou demander la suppression de votre compte, contactez-nous à :
            <a href="mailto:contact@urban-flow-lyon.fr" class="text-[#0F5238] dark:text-[#34D399] font-bold underline ml-1">contact@urban-flow-lyon.fr</a>.
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500">
            Vous conservez le droit d'introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener" class="underline">www.cnil.fr</a>).
          </p>
        </section>

      </div>
    </main>
  </div>
</template>
