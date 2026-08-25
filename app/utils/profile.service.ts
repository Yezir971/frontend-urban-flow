import { useSupabaseSession, useRuntimeConfig } from '#imports';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  total_co2_saved_kg?: number;
  total_distance_km?: number;
  eco_points?: number;
  level?: number;
  level_label?: string;
  role?: string;
  created_at?: string;
}

function getBackendUrl(): string {
  const config = useRuntimeConfig();
  const rawUrl = config.public?.urlBack as string | undefined;

  if (rawUrl && !rawUrl.includes('empty')) {
    return rawUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://api.urban-flow-lyon.fr';
  }

  return 'http://localhost:3002';
}

function getAuthToken(): string {
  const session = useSupabaseSession();
  const token = session.value?.access_token;

  if (!token) {
    throw new Error('Authentification requise : Jeton de session manquant.');
  }

  return token;
}

/**
 * Récupère le profil complet de l'utilisateur connecté via le backend NestJS
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const gatewayUrl = getBackendUrl();
  const token = getAuthToken();

  const res = await fetch(`${gatewayUrl}/api/profile/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erreur récupération profil (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Met à jour le nom complet de l'utilisateur via le backend NestJS
 */
export async function updateUserProfile(username: string): Promise<UserProfile> {
  const gatewayUrl = getBackendUrl();
  const token = getAuthToken();

  const res = await fetch(`${gatewayUrl}/api/profile/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ username: username.trim() }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erreur mise à jour profil (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Téléverse une nouvelle photo de profil dans le bucket Supabase via le backend NestJS
 */
export async function uploadUserAvatar(file: File): Promise<UserProfile> {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error('Format non supporté. Veuillez sélectionner une image PNG, JPEG ou WebP.');
  }

  const maxBytes = 5 * 1024 * 1024; // 5Mo
  if (file.size > maxBytes) {
    throw new Error('Image trop volumineuse. La taille maximale autorisée est de 5 Mo.');
  }

  const gatewayUrl = getBackendUrl();
  const token = getAuthToken();

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${gatewayUrl}/api/profile/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erreur téléversement avatar (${res.status}): ${errText}`);
  }

  return await res.json();
}
