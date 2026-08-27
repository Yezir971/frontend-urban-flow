import { useSupabaseSession, useRuntimeConfig } from '#imports';

export interface CompletedTripPayload {
  start_name: string;
  end_name: string;
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  mode:
    | 'TRANSIT'
    | 'SUBWAY'
    | 'TRAM'
    | 'BUS'
    | 'BICYCLE'
    | 'SCOOTER'
    | 'WALK'
    | 'CAR';
  line_name?: string | null;
  duration_minutes: number;
  distance_meters: number;
  co2_saved_kg: number;
  points_earned?: number;
  trace?: string | null;
}

export interface UserTrip {
  id: string;
  user_id: string;
  start_name: string;
  end_name: string;
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  mode: string;
  line_name?: string | null;
  duration_minutes: number;
  distance_meters: number;
  co2_saved_kg: number;
  points_earned: number;
  trace?: string | null;
  completed_at: string;
}

export async function recordCompletedTrip(
  payload: CompletedTripPayload,
): Promise<UserTrip> {
  const config = useRuntimeConfig();
  const rawUrl = (config.public?.urlBack as string | undefined) || '';
  const gatewayUrl = rawUrl.replace(/\/$/, '');

  const session = useSupabaseSession();
  const token = session.value?.access_token;

  if (!token) {
    throw new Error('Authentification requise : Jeton de session manquant.');
  }

  const res = await fetch(`${gatewayUrl}/api/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Erreur enregistrement trajet (${res.status}): ${errText}`,
    );
  }

  return await res.json();
}

export async function fetchRecentTrips(limit = 5): Promise<UserTrip[]> {
  const config = useRuntimeConfig();
  const rawUrl = (config.public?.urlBack as string | undefined) || '';
  const gatewayUrl = rawUrl.replace(/\/$/, '');

  const session = useSupabaseSession();
  const token = session.value?.access_token;

  if (!token) {
    return [];
  }

  const res = await fetch(`${gatewayUrl}/api/trips/recent?limit=${limit}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Erreur récupération trajets récents (${res.status})`);
  }

  return await res.json();
}
