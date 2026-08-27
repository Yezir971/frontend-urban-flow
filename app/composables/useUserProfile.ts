import { type UserProfile, fetchUserProfile } from '~/utils/profile.service';

export function useUserProfile() {
  const profile = useState<UserProfile | null>('user_profile_data', () => null);
  const isLoading = useState<boolean>('user_profile_loading', () => false);

  async function loadProfile(force = false) {
    if (profile.value && !force) return profile.value;
    isLoading.value = true;
    try {
      const data = await fetchUserProfile();
      profile.value = data;
    } catch (err) {
      console.warn('Impossible de charger le profil:', err);
    } finally {
      isLoading.value = false;
    }
    return profile.value;
  }

  function setProfile(newProfile: UserProfile) {
    profile.value = newProfile;
  }

  const isAdmin = computed(() => {
    return profile.value?.role?.toUpperCase() === 'ADMIN';
  });

  return {
    profile,
    isLoading,
    isAdmin,
    loadProfile,
    setProfile,
  };
}
