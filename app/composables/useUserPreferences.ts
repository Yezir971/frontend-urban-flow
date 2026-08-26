import {
  type UserPreferences,
  type WalkingSpeed,
  DEFAULT_USER_PREFERENCES,
  fetchUserPreferences,
  saveUserPreferences,
  getWalkingSpeedCoefficient,
} from '~/utils/preferences.service';

export function useUserPreferences() {
  const preferences = useState<UserPreferences>('user_preferences', () => ({
    ...DEFAULT_USER_PREFERENCES,
  }));
  const isLoading = useState<boolean>('user_preferences_loading', () => false);
  const isLoaded = useState<boolean>('user_preferences_loaded', () => false);

  async function loadPreferences(force = false) {
    if (isLoaded.value && !force) return preferences.value;

    isLoading.value = true;
    try {
      const data = await fetchUserPreferences();
      if (data) {
        preferences.value = { ...DEFAULT_USER_PREFERENCES, ...data };
        isLoaded.value = true;
      }
    } catch (err) {
      console.warn('Impossible de charger les préférences utilisateur depuis le serveur:', err);
    } finally {
      isLoading.value = false;
    }
    return preferences.value;
  }

  async function updatePreferences(newPrefs: UserPreferences) {
    isLoading.value = true;
    try {
      const saved = await saveUserPreferences(newPrefs);
      preferences.value = { ...DEFAULT_USER_PREFERENCES, ...saved };
      isLoaded.value = true;
      return preferences.value;
    } finally {
      isLoading.value = false;
    }
  }

  const speedCoefficient = computed(() =>
    getWalkingSpeedCoefficient(preferences.value.walking_speed),
  );

  return {
    preferences,
    isLoading,
    isLoaded,
    loadPreferences,
    updatePreferences,
    speedCoefficient,
  };
}
