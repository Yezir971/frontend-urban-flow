export const LYON_BOUNDS = {
  southWest: { lat: 45.70, lng: 4.77 },
  northEast: { lat: 45.82, lng: 4.90 }
}

export const isWithinLyonBounds = (lat: number, lng: number): boolean => {
  return lat >= LYON_BOUNDS.southWest.lat &&
         lat <= LYON_BOUNDS.northEast.lat &&
         lng >= LYON_BOUNDS.southWest.lng &&
         lng <= LYON_BOUNDS.northEast.lng;
}
