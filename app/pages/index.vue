<template>
  <div class="max-w-5xl mx-auto flex flex-col gap-6">
    <!-- Header Home : Bonjour, <nom> + Avatar dynamique -->
    <HeaderHome :profile="profile" :is-loading="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import HeaderHome from '~/components/header/HeaderHome.vue';
import { useUserProfile } from '~/composables/useUserProfile';

definePageMeta({
  middleware: 'auth',
});

const { profile, isLoading, loadProfile } = useUserProfile();

onMounted(() => {
  loadProfile();
});
</script>