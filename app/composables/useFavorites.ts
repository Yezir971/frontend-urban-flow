import { ref } from 'vue';
import type { UserFavorite, CreateFavoritePayload } from '~/types/favorite';

export function useFavorites() {
  const config = useRuntimeConfig();
  const rawUrl = (config.public?.urlBack as string | undefined) || '';
  const gatewayUrl = rawUrl.replace(/\/$/, '');

  const session = useSupabaseSession();
  const favorites = useState<UserFavorite[]>('user_favorites_list', () => []);
  const isLoading = useState<boolean>('user_favorites_loading', () => false);
  const error = ref<string | null>(null);

  async function fetchFavorites(): Promise<UserFavorite[]> {
    isLoading.value = true;
    error.value = null;

    const token = session.value?.access_token;
    if (!token) {
      // Si pas encore connecté / invité, retourner la liste actuelle
      isLoading.value = false;
      return favorites.value;
    }

    try {
      const data = await $fetch<UserFavorite[]>(`${gatewayUrl}/api/user/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      favorites.value = data || [];
      return favorites.value;
    } catch (err: any) {
      console.warn('Erreur récupération favoris:', err);
      error.value = err?.message || 'Erreur chargement favoris';
      return favorites.value;
    } finally {
      isLoading.value = false;
    }
  }

  async function addFavorite(payload: CreateFavoritePayload): Promise<UserFavorite> {
    isLoading.value = true;
    error.value = null;

    const token = session.value?.access_token;
    if (!token) {
      // Création locale si hors-ligne
      const localFav: UserFavorite = {
        id: `local-${Date.now()}`,
        user_id: 'local',
        name: payload.name,
        address: payload.address,
        start_address: payload.start_address || null,
        icon: payload.icon || 'home',
        coordinates: payload.coordinates,
        created_at: new Date().toISOString(),
      };
      favorites.value.unshift(localFav);
      isLoading.value = false;
      return localFav;
    }

    try {
      const newFav = await $fetch<UserFavorite>(`${gatewayUrl}/api/user/favorites`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      favorites.value.unshift(newFav);
      return newFav;
    } catch (err: any) {
      console.error('Erreur ajout favori:', err);
      error.value = err?.message || "Erreur lors de l'ajout du favori";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteFavorite(id: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    const token = session.value?.access_token;
    if (!token || id.startsWith('local-')) {
      favorites.value = favorites.value.filter((f) => f.id !== id);
      isLoading.value = false;
      return true;
    }

    try {
      await $fetch(`${gatewayUrl}/api/user/favorites/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      favorites.value = favorites.value.filter((f) => f.id !== id);
      return true;
    } catch (err: any) {
      console.error('Erreur suppression favori:', err);
      error.value = err?.message || 'Erreur lors de la suppression du favori';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    favorites,
    isLoading,
    error,
    fetchFavorites,
    addFavorite,
    deleteFavorite,
  };
}
