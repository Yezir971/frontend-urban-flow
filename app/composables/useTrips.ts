import { ref } from 'vue';
import type { UserTrip } from '~/types/trip';

export function useTrips() {
  const config = useRuntimeConfig();
  const rawUrl = (config.public?.urlBack as string | undefined) || '';
  const gatewayUrl = rawUrl.replace(/\/$/, '');

  const session = useSupabaseSession();
  const recentTrips = useState<UserTrip[]>('user_recent_trips_list', () => []);
  const allTrips = useState<UserTrip[]>('user_all_trips_list', () => []);
  const isLoading = useState<boolean>('user_trips_loading', () => false);
  const error = ref<string | null>(null);

  async function fetchRecentTrips(limit = 5): Promise<UserTrip[]> {
    isLoading.value = true;
    error.value = null;

    const token = session.value?.access_token;
    if (!token) {
      isLoading.value = false;
      return recentTrips.value;
    }

    try {
      const data = await $fetch<UserTrip[]>(`${gatewayUrl}/api/user/trips`, {
        query: { limit },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (limit <= 5) {
        recentTrips.value = data || [];
      } else {
        allTrips.value = data || [];
      }
      return data || [];
    } catch (err: any) {
      console.warn('Erreur récupération trajets récents:', err);
      error.value = err?.message || 'Erreur lors du chargement des trajets';
      return recentTrips.value;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    recentTrips,
    allTrips,
    isLoading,
    error,
    fetchRecentTrips,
  };
}
