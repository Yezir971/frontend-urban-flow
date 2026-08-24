import type { ItineraryProposal, ItineraryLeg } from '~/types/itinerary'

/**
 * Formate une durée en minutes en texte lisible (ex: "22 min", "1h 15min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMins = Math.round(minutes % 60)
  return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`
}

/**
 * Formate une distance en mètres en format lisible (ex: "450 m", "1.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Calcule l'heure d'arrivée estimée au format HH:MM
 */
export function calculateArrivalTime(durationMinutes: number, fromDate: Date = new Date()): string {
  const arrival = new Date(fromDate.getTime() + durationMinutes * 60000)
  const hours = arrival.getHours().toString().padStart(2, '0')
  const minutes = arrival.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Calcule l'économie de CO2 en kg par rapport à un trajet en voiture standard (120g CO2/km)
 */
export function calculateCo2Savings(distanceMeters: number, mode: string): number {
  const distanceKm = distanceMeters / 1000
  const carEmissionKg = distanceKm * 0.12

  switch (mode.toUpperCase()) {
    case 'WALK':
      return parseFloat(carEmissionKg.toFixed(2))
    case 'BICYCLE':
    case 'SCOOTER':
      return parseFloat((carEmissionKg * 0.95).toFixed(2))
    case 'TRANSIT':
    case 'SUBWAY':
    case 'TRAM':
    case 'BUS':
      return parseFloat((carEmissionKg * 0.75).toFixed(2))
    case 'CAR':
      return 0.0
    default:
      return 0.0
  }
}

/**
 * Mappe les propositions d'itinéraires réelles renvoyées par le backend OpenTripPlanner
 */
export function buildMultimodalProposals(
  rawResult: any,
  startName: string = 'Départ',
  endName: string = 'Arrivée'
): ItineraryProposal[] {
  // 1. Si le backend renvoie déjà les propositions dynamiques d'OTP
  if (rawResult?.proposals && Array.isArray(rawResult.proposals) && rawResult.proposals.length > 0) {
    return rawResult.proposals.map((p: any) => {
      const proposalDurationMins = p.durationMinutes || Math.max(1, Math.round((p.duree || p.duration || 600) / 60))
      const proposalDistanceMeters = p.distanceMeters || Math.round(p.distance || 0)

      const legs: ItineraryLeg[] = (p.legs || []).map((leg: any, idx: number) => {
        const isSingleLeg = p.legs.length === 1
        const legDurMins = isSingleLeg
          ? proposalDurationMins
          : (leg.durationMinutes || Math.max(1, Math.round((leg.duration || 180) / 60)))

        const isWalk = leg.mode?.toUpperCase() === 'WALK'
        const isBike = leg.mode?.toUpperCase() === 'BICYCLE'
        const isCar = leg.mode?.toUpperCase() === 'CAR'

        let defaultTitle = `Étape ${idx + 1}`
        if (isWalk) {
          defaultTitle = `Marche (${legDurMins} min)`
        } else if (isBike) {
          defaultTitle = `Trajet Vélo (${legDurMins} min)`
        } else if (isCar) {
          defaultTitle = `Trajet Voiture (${legDurMins} min)`
        } else if (leg.line) {
          defaultTitle = `${leg.mode} ${leg.line}`
        }

        let singleTitle = `Trajet direct (${proposalDurationMins} min)`
        if (isWalk) singleTitle = `Marche (${proposalDurationMins} min)`
        else if (isBike) singleTitle = `Trajet Vélo (${proposalDurationMins} min)`
        else if (isCar) singleTitle = `Trajet Voiture (${proposalDurationMins} min)`

        return {
          mode: leg.mode || 'WALK',
          title: isSingleLeg ? singleTitle : (leg.title || defaultTitle),
          instruction: leg.instruction || (idx === 0 ? `Depuis ${startName}` : `Vers ${endName}`),
          durationMinutes: legDurMins,
          distanceMeters: isSingleLeg ? proposalDistanceMeters : (leg.distanceMeters || Math.round(leg.distance || 400)),
          line: leg.line,
          headsign: leg.headsign,
          stopsCount: leg.stopsCount,
          status: isSingleLeg ? 'IN_PROGRESS' : (idx === 0 ? 'COMPLETED' : (idx === 1 ? 'IN_PROGRESS' : 'UPCOMING')),
          legGeometry: leg.legGeometry
        }
      })

      return {
        ...p,
        durationMinutes: proposalDurationMins,
        distanceMeters: proposalDistanceMeters,
        arrivalTime: p.arrivalTime || calculateArrivalTime(proposalDurationMins),
        legs
      }
    })
  }

  // 2. Si le backend renvoie un seul itinéraire brut (OTP REST fallback)
  const baseDistance = rawResult?.distance || 1000
  const baseDurationSeconds = rawResult?.duree || rawResult?.duration || 600
  const baseMinutes = Math.max(1, Math.round(baseDurationSeconds / 60))
  const baseTrace = rawResult?.trace || ''

  const singleProposal: ItineraryProposal = {
    id: 'otp-route',
    type: 'TRANSIT',
    title: 'Itinéraire direct',
    subtitle: `${formatDistance(baseDistance)} • ${startName} → ${endName}`,
    badge: 'DIRECT',
    durationMinutes: baseMinutes,
    distanceMeters: baseDistance,
    co2SavedKg: calculateCo2Savings(baseDistance, 'TRANSIT'),
    arrivalTime: calculateArrivalTime(baseMinutes),
    trace: baseTrace,
    legs: [
      {
        mode: 'WALK',
        title: `Marche (${baseMinutes} min)`,
        instruction: `Depuis ${startName} vers ${endName}`,
        durationMinutes: baseMinutes,
        distanceMeters: baseDistance,
        status: 'IN_PROGRESS'
      }
    ]
  }

  return [singleProposal]
}
