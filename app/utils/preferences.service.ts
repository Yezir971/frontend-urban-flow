import { useSupabaseClient, useSupabaseSession, useRuntimeConfig } from '#imports';

export type WalkingSpeed = 'slow' | 'normal' | 'fast';

export interface UserPreferences {
  user_id?: string;
  walking_speed: WalkingSpeed;
  pref_metro: boolean;
  pref_bus: boolean;
  pref_bike: boolean;
  pref_car: boolean;
  pref_walk: boolean;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  walking_speed: 'normal',
  pref_metro: true,
  pref_bus: true,
  pref_bike: true,
  pref_car: true,
  pref_walk: true,
};

function getBackendUrl(): string {
  const config = useRuntimeConfig();
  const rawUrl = (config.public?.urlBack as string | undefined) || '';
  return rawUrl.replace(/\/$/, '');
}

async function getAuthToken(): Promise<string> {
  const supabase = useSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (token) {
    return token;
  }

  const session = useSupabaseSession();
  if (session.value?.access_token) {
    return session.value.access_token;
  }

  throw new Error('Authentification requise : Jeton de session manquant.');
}

/**
 * Récupère les préférences de l'utilisateur connecté via le backend NestJS
 */
export async function fetchUserPreferences(): Promise<UserPreferences> {
  const gatewayUrl = getBackendUrl();
  const token = await getAuthToken();

  const res = await fetch(`${gatewayUrl}/api/user/preferences`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erreur récupération préférences (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Met à jour les préférences de l'utilisateur connecté via le backend NestJS
 */
export async function saveUserPreferences(
  preferences: UserPreferences,
): Promise<UserPreferences> {
  const gatewayUrl = getBackendUrl();
  const token = await getAuthToken();

  const res = await fetch(`${gatewayUrl}/api/user/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      walking_speed: preferences.walking_speed,
      pref_metro: preferences.pref_metro,
      pref_bus: preferences.pref_bus,
      pref_bike: preferences.pref_bike,
      pref_car: preferences.pref_car,
      pref_walk: preferences.pref_walk,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erreur sauvegarde préférences (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Retourne le coefficient de vitesse de marche
 * slow: 1.3 (+30% de temps)
 * normal: 1.0 (temps standard)
 * fast: 0.8 (-20% de temps)
 */
export function getWalkingSpeedCoefficient(speed: WalkingSpeed): number {
  switch (speed) {
    case 'slow':
      return 1.3;
    case 'fast':
      return 0.8;
    case 'normal':
    default:
      return 1.0;
  }
}
