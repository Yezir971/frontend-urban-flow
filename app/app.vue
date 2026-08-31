<script setup>
import { onMounted } from 'vue';
import { useGeoStore } from '~/stores/geo';
import { useTheme } from '~/composables/useTheme';

const geo = useGeoStore();
const { initTheme } = useTheme();

// Données structurées JSON-LD Schema.org pour le référencement naturel (Rich Snippets)
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebApplication',
            '@id': 'https://urban-flow-lyon.fr/#webapp',
            'name': 'Urban Flow Lyon',
            'url': 'https://urban-flow-lyon.fr',
            'applicationCategory': 'TravelApplication',
            'operatingSystem': 'All (Web, iOS, Android, PWA)',
            'browserRequirements': 'Requires JavaScript. Requires HTML5.',
            'description': "Plateforme d'éco-mobilité et calculateur d'itinéraires multimodaux à Lyon : métro, bus, tramway, Vélo'v et marche avec calcul d'économie de CO₂.",
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'EUR'
            },
            'author': {
              '@type': 'Organization',
              'name': 'Urban Flow',
              'url': 'https://urban-flow-lyon.fr'
            }
          },
          {
            '@type': 'Organization',
            '@id': 'https://urban-flow-lyon.fr/#organization',
            'name': 'Urban Flow',
            'url': 'https://urban-flow-lyon.fr',
            'logo': 'https://urban-flow-lyon.fr/img/logo.svg',
            'sameAs': [
              'https://github.com/UrbanFlowLyon',
              'https://urban-flow-lyon.fr'
            ]
          }
        ]
      })
    }
  ]
});

onMounted(() => {
  initTheme();
});
</script>

<template>
  <VitePwaManifest />
  <div class="bg-surface dark:bg-[#0B1311] min-h-screen text-[#191C1C] dark:text-[#E6EDE9] transition-colors duration-200">
    <UApp>
      <NuxtLayout>
        <NuxtPage :lat="geo.lat" :lng="geo.lng" />
      </NuxtLayout>
    </UApp>
  </div>
</template>
