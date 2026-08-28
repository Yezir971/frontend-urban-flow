<template>
  <div class="min-h-screen bg-[#F4F5F6] dark:bg-[#0B1311] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
    
    <!-- Header -->
    <AuthHeader />

    <!-- Main Card -->
    <div class="w-full max-w-md bg-white dark:bg-[#15221E] rounded-[2.5rem] shadow-sm p-6 sm:p-8 mt-8 self-center border border-gray-100/50 dark:border-emerald-900/30 transition-colors duration-200">
      
      <!-- Switch Tab Capsule -->
      <div class="bg-[#F3F4F6] dark:bg-[#111C18] p-1.5 rounded-full flex mb-6">
        <button 
          @click="isSignUp = false"
          type="button"
          :class="[
            'flex-1 py-2.5 text-center text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none cursor-pointer',
            !isSignUp ? 'bg-white dark:bg-[#1C2F28] text-[#0F5238] dark:text-[#34D399] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          ]"
        >
          Connexion
        </button>
        <button 
          @click="isSignUp = true"
          type="button"
          :class="[
            'flex-1 py-2.5 text-center text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none cursor-pointer',
            isSignUp ? 'bg-white dark:bg-[#1C2F28] text-[#0F5238] dark:text-[#34D399] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          ]"
        >
          Inscription
        </button>
      </div>

      <!-- Google Button -->
      <AuthGoogleButton @click="handleGoogleLogin" />

      <!-- Divider -->
      <div class="relative flex items-center mb-6">
        <div class="grow border-t border-gray-200 dark:border-gray-800"></div>
        <span class="shrink mx-4 text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">Ou email</span>
        <div class="grow border-t border-gray-200 dark:border-gray-800"></div>
      </div>

      <!-- Forms -->
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        
        <!-- Name (Sign Up only) -->
        <AuthInputField 
          v-if="isSignUp"
          v-model="name"
          label="Nom complet"
          placeholder="Jean Dupont"
          icon="user"
        />

        <!-- Email -->
        <AuthInputField 
          v-model="email"
          label="Adresse e-mail"
          placeholder="nom@exemple.com"
          icon="mail"
          type="email"
        />

        <!-- Password -->
        <AuthInputField 
          v-model="password"
          label="Mot de passe"
          :placeholder="isSignUp ? 'Créez un mot de passe' : 'Saisissez votre mot de passe'"
          icon="lock"
          :show-password-toggle="true"
          :show-password-state="showPassword"
          @toggle-password="showPassword = !showPassword"
        />

        <!-- Password Security Checklist (Sign Up only) -->
        <AuthPasswordChecklist 
          v-if="isSignUp"
          :is-length-valid="isLengthValid"
          :is-special-valid="isSpecialValid"
          :is-digit-valid="isDigitValid"
        />

        <!-- Submit Button -->
        <Button 
          :type="'submit'"
          :text="isSignUp ? 'Créer un compte' : 'Connexion'"
          class="bg-[#0F5238] dark:bg-[#1D6045] text-white rounded-full hover:bg-[#0c422d] dark:hover:bg-[#154D36] transition-all duration-200 mt-3 py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F5238] focus:ring-offset-2 cursor-pointer"
        />

      </form>

      <!-- Forgotten password (Log In only) / Toggle to register -->
      <div v-if="!isSignUp" class="text-center mt-5">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline cursor-pointer transition-all duration-150">
          Mot de passe oublié ?
        </span>
      </div>

    </div>

    <!-- Green Banner -->
    <AuthGreenBanner />

    <!-- Footer -->
    <AuthFooter />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import Button from '~/components/ui/button.vue';

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();

const isSignUp = ref(false);
const showPassword = ref(false);

const name = ref('');
const email = ref('');
const password = ref('');

// Auto-redirect if user gets authenticated
watchEffect(() => {
  if (user.value) {
    navigateTo('/');
  }
});

// Real-time password validations
const isLengthValid = computed(() => {
  if (password.value === '') return null;
  return password.value.length >= 8;
});

const isSpecialValid = computed(() => {
  if (password.value === '') return null;
  return /[!@#$]/.test(password.value);
});

const isDigitValid = computed(() => {
  if (password.value === '') return null;
  return /\d/.test(password.value);
});

const isFormValid = computed(() => {
  if (!isSignUp.value) return true;
  return isLengthValid.value === true && isSpecialValid.value === true && isDigitValid.value === true;
});

async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/confirm`,
    },
  });
  if (error) {
    toast.add({
      title: 'Erreur de connexion',
      description: error.message,
      color: 'error',
      icon: 'i-lucide-triangle-alert',
    });
  }
}

async function handleSubmit() {
  if (isSignUp.value) {
    if (!isFormValid.value) {
      toast.add({
        title: 'Formulaire non valide',
        description: 'Veuillez respecter toutes les contraintes de sécurité pour le mot de passe.',
        color: 'warning',
        icon: 'i-lucide-triangle-alert',
      });
      return;
    }
    
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: name.value,
        },
      },
    });
    
    if (error) {
      toast.add({
        title: "Erreur d'inscription",
        description: error.message,
        color: 'error',
        icon: 'i-lucide-triangle-alert',
      });
    } else if (data.user && !data.session) {
      toast.add({
        title: 'Inscription réussie',
        description: 'Veuillez vérifier votre boîte mail pour confirmer votre compte.',
        color: 'success',
        icon: 'i-lucide-circle-check',
        duration: 0,
      });
      isSignUp.value = false;
    } else {
      await navigateTo('/');
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    
    if (error) {
      toast.add({
        title: 'Erreur de connexion',
        description: error.message,
        color: 'error',
        icon: 'i-lucide-triangle-alert',
      });
    } else {
      await navigateTo('/');
    }
  }
}
</script>