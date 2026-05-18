

export interface Location {
    lon: number,
    lat: number
}

export type ItineraryMode = 'TRANSIT' | 'WALK' | 'BICYCLE' | 'CAR';


export async function planTrip(from : Location, to : Location, modes: ItineraryMode[]) {
  const transportModesString = modes.map(m => `{mode: ${m}}`).join(', ')
  const query = `
  {
    plan(
      from: { lat: ${from.lat}, lon: ${from.lon} }
      to: { lat: ${to.lat}, lon: ${to.lon} }
      numItineraries: 3
      transportModes: [${transportModesString}]
    ) {
      itineraries {
        duration
        legs {
          mode
          duration
          distance
          from { name lat lon }
          to { name lat lon }
          legGeometry { points }
          route {
            shortName
            longName
          }
        }
      }
    }
  }
  ` 
  const config = useRuntimeConfig()

  const res = await fetch(`${config.public.urlOtp}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })

  const data = await res.json()
  return data
}