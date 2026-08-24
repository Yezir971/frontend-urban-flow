import polyline from '@mapbox/polyline'

export type LeafletPoint = [number, number]

/**
 * Maps backend geometry response (GeoJSON [lon, lat], Polyline string, Gateway object, or multi-leg itinerary) 
 * into an array of Leaflet [lat, lon] points suitable for L.polyline.
 */
export function mapGeometryToLeafletPoints(data: any): LeafletPoint[] {
  if (!data) return []

  // Case 1: Encoded polyline string
  if (typeof data === 'string') {
    try {
      return polyline.decode(data) as LeafletPoint[]
    } catch {
      return []
    }
  }

  // Case 2: Multi-leg itineraries structure (OTP / Multimodal Gateway)
  const legs = data?.legs || data?.data?.plan?.itineraries?.[0]?.legs || data?.plan?.itineraries?.[0]?.legs
  if (Array.isArray(legs) && legs.length > 0) {
    const points: LeafletPoint[] = []
    legs.forEach((leg: any) => {
      if (leg.legGeometry?.points) {
        try {
          const decoded = polyline.decode(leg.legGeometry.points) as LeafletPoint[]
          points.push(...decoded)
        } catch {}
      } else if (leg.geometry) {
        points.push(...mapGeometryToLeafletPoints(leg.geometry))
      }
    })
    if (points.length > 0) return points
  }

  // Case 3: Object with 'trace' polyline string (API Gateway response)
  if (typeof data.trace === 'string' && data.trace.length > 0) {
    try {
      const decoded = polyline.decode(data.trace) as LeafletPoint[]
      if (decoded.length > 0) return decoded
    } catch {
      // Fallback
    }
  }

  // Case 4: GeoJSON style object { coordinates: [[lon, lat], ...] }
  if (data.coordinates && Array.isArray(data.coordinates)) {
    return data.coordinates
      .filter((c: any) => Array.isArray(c) && c.length >= 2)
      .map((c: any) => [c[1], c[0]] as LeafletPoint)
  }

  // Case 5: GeoJSON geometry property { geometry: { coordinates: ... } }
  if (data.geometry && data.geometry.coordinates && Array.isArray(data.geometry.coordinates)) {
    return mapGeometryToLeafletPoints(data.geometry)
  }

  return []
}
