export interface LocationInput {
  lat: number | null;
  lon: number | null;
  name: string;
}

export function validateRouteInputs(start: LocationInput | null, end: LocationInput | null): boolean {
  if (!start || !end) return false
  if (start.lat === null || start.lon === null || end.lat === null || end.lon === null) return false
  if (start.lat === 0 && start.lon === 0 && start.name !== 'Ma position actuelle') return false
  if (!start.name.trim() || !end.name.trim()) return false
  return true
}
