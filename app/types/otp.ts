export interface Location {
    lon: number,
    lat: number
}

export type ItineraryMode = 'TRANSIT' | 'WALK' | 'BICYCLE' | 'CAR';