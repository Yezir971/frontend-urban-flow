
const OTP_URL = import.meta.env.NUXT_URL_OTP

export interface Location {
    lon: number,
    lat: number
}

export type ItineraryMode = 'TRANSIT' | 'WALK' | 'BICYCLE' | 'CAR';


export async function planTrip(from : Location, to : Location, modes: ItineraryMode[]) {
    const query = `
    {
      plan(
        from: { lat: ${from.lat}, lon: ${from.lon} }
        to: { lat: ${to.lat}, lon: ${to.lon} }
        numItineraries: 3
        transportModes: [${modes.map(m => `{mode: ${m}}`).join(', ')}]
      ) {
        itineraries {
          duration
          legs {
            mode
            distance
            startTime
            endTime
            from { name lat lon }
            to { name lat lon }
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
  console.log(data)
  return data
}