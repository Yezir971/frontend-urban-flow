export interface ItineraryLeg {
  mode: 'WALK' | 'SUBWAY' | 'TRAM' | 'BUS' | 'BICYCLE' | 'CAR' | string;
  title: string;
  instruction: string;
  durationMinutes: number;
  distanceMeters: number;
  line?: string;
  headsign?: string;
  stopsCount?: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  realTime?: boolean;
  delayMinutes?: number;
  departureTimeFormatted?: string;
  departureStatus?: 'ON_TIME' | 'DELAYED' | 'EARLY';
  legGeometry?: {
    points: string;
  };
}

export interface ItineraryProposal {
  id: string;
  type: 'TRANSIT' | 'WALK' | 'BICYCLE' | 'SCOOTER';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor?: string;
  durationMinutes: number;
  distanceMeters: number;
  co2SavedKg: number;
  priceApprox?: string;
  tag?: string;
  leavesInMinutes?: number;
  realTime?: boolean;
  delayMinutes?: number;
  departureStatus?: 'ON_TIME' | 'DELAYED' | 'EARLY';
  arrivalTime?: string;
  trace: string;
  legs: ItineraryLeg[];
}

export interface ItineraryResponse {
  proposals: ItineraryProposal[];
  selectedItinerary?: ItineraryProposal;
  duree: number;
  distance: number;
  trace: string;
  legs?: ItineraryLeg[];
}
