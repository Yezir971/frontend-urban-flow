import type { ItineraryProposal, ItineraryLeg } from '~/types/itinerary'
import type { UserPreferences } from '~/utils/preferences.service'

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
 * Facteurs d'émissions officiels (Base Carbone ADEME & Impact CO2 : https://impactco2.fr/doc/api)
 * Exprimés en g CO2e / passager.km
 */
export const EMISSION_FACTORS_G_PER_KM = {
  CAR: 218, // Voiture thermique moyenne solo
  BUS: 110, // Bus urbain thermique/hybride
  TRAM: 3.0, // Tramway électrique
  SUBWAY: 2.5, // Métro électrique
  METRO: 2.5,
  RAIL: 4.5, // Train / RER
  TRANSIT: 60, // Moyenne globale transport en commun
  BICYCLE: 0, // Vélo musculaire
  SCOOTER: 0, // Trottinette
  WALK: 0, // Marche à pied
} as const;

/**
 * Calcule l'économie de CO2 en kg par rapport à un trajet en voiture standard (218g CO2/km)
 * CO2 économisé = CO2 voiture référence - CO2 mode choisi
 */
export function calculateCo2Savings(
  distanceMeters: number,
  mode: string,
  carReferenceDistanceMeters?: number,
): number {
  const totalKm = distanceMeters / 1000;
  const refKm = (carReferenceDistanceMeters && carReferenceDistanceMeters > 0 ? carReferenceDistanceMeters : distanceMeters) / 1000;
  const carEmissionG = refKm * EMISSION_FACTORS_G_PER_KM.CAR;

  const upperMode = (mode || 'WALK').toUpperCase();
  const factor = (EMISSION_FACTORS_G_PER_KM as any)[upperMode] ?? 0;
  const modeEmissionG = totalKm * factor;

  const savedG = Math.max(0, carEmissionG - modeEmissionG);
  return parseFloat((savedG / 1000).toFixed(2));
}

/**
 * Formate une valeur de CO2 (exprimée en kg) de manière optimale :
 * En grammes (g) pour les valeurs < 1 kg (ex: "650 g"), et en kilogrammes (kg) au-delà (ex: "1.4 kg")
 */
export function formatCo2(co2Kg?: number | null): string {
  if (co2Kg == null || isNaN(co2Kg) || co2Kg <= 0) {
    return '0 g';
  }
  if (co2Kg < 1.0) {
    return `${Math.round(co2Kg * 1000)} g`;
  }
  return `${co2Kg.toFixed(1)} kg`;
}

/**
 * Retourne le texte lisible d'économie de CO2 pour une carte de trajet
 */
export function formatCo2SavingsBadge(proposal: { type?: string; co2SavedKg?: number }): string {
  if (proposal.type === 'CAR') {
    return '0 g (Trajet de référence)';
  }
  const formatted = formatCo2(proposal.co2SavedKg);
  return `${formatted} CO₂ évités`;
}

/**
 * Calcule l'équivalent concret du quotidien en kilomètres de voiture thermique évités
 */
export function calculateCarEquivalentKm(co2Kg: number): number {
  if (!co2Kg || co2Kg <= 0) return 0;
  return Math.round((co2Kg * 1000) / EMISSION_FACTORS_G_PER_KM.CAR);
}

/**
 * Filtre les propositions d'itinéraires selon les préférences de transport configurées par l'utilisateur
 */
export function filterProposalsByPreferences(
  proposals: ItineraryProposal[],
  preferences?: UserPreferences,
): ItineraryProposal[] {
  if (!preferences) return proposals

  return proposals.filter((p) => {
    // 1. Proposition Voiture
    if (p.type === 'CAR' || p.legs?.some((l) => l.mode?.toUpperCase() === 'CAR')) {
      return preferences.pref_car
    }

    // 2. Proposition 100% Marche
    if (p.type === 'WALK' && (!p.legs || p.legs.every((l) => l.mode?.toUpperCase() === 'WALK'))) {
      return preferences.pref_walk
    }

    // 3. Proposition Vélo
    if (p.type === 'BICYCLE' || p.legs?.some((l) => l.mode?.toUpperCase() === 'BICYCLE')) {
      return preferences.pref_bike
    }

    // 4. Proposition Transports en commun (Métro, Tramway, Bus)
    if (p.type === 'TRANSIT') {
      const hasMetroOrTram = p.legs?.some((l) =>
        ['SUBWAY', 'METRO', 'TRAM', 'RAIL', 'TRAIN'].includes(l.mode?.toUpperCase() || ''),
      )
      const hasBus = p.legs?.some((l) =>
        ['BUS'].includes(l.mode?.toUpperCase() || ''),
      )

      // Si le trajet emprunte le Métro/Tramway mais que pref_metro est désactivé -> masquer
      if (hasMetroOrTram && !preferences.pref_metro) {
        return false
      }
      // Si le trajet emprunte le Bus mais que pref_bus est désactivé -> masquer
      if (hasBus && !preferences.pref_bus) {
        return false
      }
      // Si les deux transports en commun sont désactivés -> masquer
      if (!preferences.pref_metro && !preferences.pref_bus) {
        return false
      }
    }

    return true
  })
}

/**
 * Mappe les propositions d'itinéraires réelles renvoyées par le backend OpenTripPlanner
 * en appliquant le coefficient de vitesse de marche (slow: 1.3, normal: 1.0, fast: 0.8)
 */
export function buildMultimodalProposals(
  rawResult: any,
  startName: string = 'Départ',
  endName: string = 'Arrivée',
  walkSpeedCoef: number = 1.0,
): ItineraryProposal[] {
  // 1. Si le backend renvoie déjà les propositions dynamiques d'OTP
  if (rawResult?.proposals && Array.isArray(rawResult.proposals) && rawResult.proposals.length > 0) {
    return rawResult.proposals.map((p: any) => {
      let accumulatedDuration = 0

      const legs: ItineraryLeg[] = (p.legs || []).map((leg: any, idx: number) => {
        const isSingleLeg = p.legs.length === 1
        const rawLegDur = isSingleLeg
          ? (p.durationMinutes || Math.max(1, Math.round((p.duree || p.duration || 600) / 60)))
          : (leg.durationMinutes || Math.max(1, Math.round((leg.duration || 180) / 60)))

        const isWalk = leg.mode?.toUpperCase() === 'WALK'
        const isBike = leg.mode?.toUpperCase() === 'BICYCLE'
        const isCar = leg.mode?.toUpperCase() === 'CAR'

        // Application du coefficient de vitesse pour la marche
        const legDurMins = isWalk ? Math.max(1, Math.round(rawLegDur * walkSpeedCoef)) : rawLegDur
        accumulatedDuration += legDurMins

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

        let singleTitle = `Trajet direct (${legDurMins} min)`
        if (isWalk) singleTitle = `Marche (${legDurMins} min)`
        else if (isBike) singleTitle = `Trajet Vélo (${legDurMins} min)`
        else if (isCar) singleTitle = `Trajet Voiture (${legDurMins} min)`

        return {
          mode: leg.mode || 'WALK',
          title: isSingleLeg ? singleTitle : (leg.title || defaultTitle),
          instruction: leg.instruction || (idx === 0 ? `Depuis ${startName}` : `Vers ${endName}`),
          durationMinutes: legDurMins,
          distanceMeters: isSingleLeg
            ? (p.distanceMeters || Math.round(p.distance || 0))
            : (leg.distanceMeters || Math.round(leg.distance || 400)),
          line: leg.line,
          headsign: leg.headsign,
          stopsCount: leg.stopsCount,
          status: isSingleLeg ? 'IN_PROGRESS' : (idx === 0 ? 'COMPLETED' : (idx === 1 ? 'IN_PROGRESS' : 'UPCOMING')),
          legGeometry: leg.legGeometry
        }
      })

      const proposalDurationMins = accumulatedDuration > 0
        ? accumulatedDuration
        : (p.durationMinutes || Math.max(1, Math.round((p.duree || p.duration || 600) / 60)))
      const proposalDistanceMeters = p.distanceMeters || Math.round(p.distance || 0)

      return {
        ...p,
        durationMinutes: proposalDurationMins,
        distanceMeters: proposalDistanceMeters,
        arrivalTime: calculateArrivalTime(proposalDurationMins),
        legs
      }
    })
  }

  // 2. Si le backend renvoie un seul itinéraire brut (OTP REST fallback)
  const baseDistance = rawResult?.distance || 1000
  const baseDurationSeconds = rawResult?.duree || rawResult?.duration || 600
  const rawMinutes = Math.max(1, Math.round(baseDurationSeconds / 60))
  const baseMinutes = Math.max(1, Math.round(rawMinutes * walkSpeedCoef))
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
