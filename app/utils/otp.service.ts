import type { ItineraryMode, Location } from "~/types/otp"
import { useSupabaseSession } from '#imports'

export async function planTrip(from: Location, to: Location, modes: ItineraryMode[]) {
  const config = useRuntimeConfig()
  const gatewayUrl = config.public.urlBack || 'http://localhost:3002'
  console.log(`Appel de l'API Gateway à l'URL: ${config.public.urlBack}/api/route`)

  // Récupère la session Supabase pour obtenir le token JWT
  const session = useSupabaseSession()
  const token = session.value?.access_token

  if (!token) {
    throw new Error("Authentification requise : Jeton de session manquant.")
  }

  const startParam = `${from.lat},${from.lon}`
  const endParam = `${to.lat},${to.lon}`
  const modeParam = modes[0] || 'WALK'

  // Envoi de la requête GET vers l'API Gateway NestJS avec le token JWT dans les en-têtes
  const res = await fetch(`${gatewayUrl}/api/route?start=${encodeURIComponent(startParam)}&end=${encodeURIComponent(endParam)}&mode=${encodeURIComponent(modeParam)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Erreur API Gateway (${res.status}): ${errText}`)
  }

  // Renvoie { duree: number, distance: number, trace: string }
  return await res.json()
}