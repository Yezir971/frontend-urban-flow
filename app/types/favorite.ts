export interface UserFavorite {
  id: string;
  user_id: string;
  name: string;
  address: string;
  start_address?: string | null;
  start_coordinates?: {
    lat: number;
    lng: number;
  } | null;
  icon: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  created_at?: string;
}

export interface CreateFavoritePayload {
  name: string;
  address: string;
  start_address?: string | null;
  start_coordinates?: {
    lat: number;
    lng: number;
  } | null;
  icon?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
