export interface UserTrip {
  id: string;
  user_id: string;
  start_point: string;
  end_point: string;
  start_name: string;
  end_name: string;
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  distance_km: number;
  distance_meters: number;
  co2_saved_kg: number;
  duration_minutes: number;
  timestamp: string;
  completed_at: string;
  mode: string;
  line_name?: string | null;
  points_earned?: number;
  trace?: string | null;
}
