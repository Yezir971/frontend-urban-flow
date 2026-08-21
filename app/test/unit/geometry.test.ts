import { describe, it, expect } from 'vitest'
import polyline from '@mapbox/polyline'
import { mapGeometryToLeafletPoints } from '../../utils/geometry'

describe('mapGeometryToLeafletPoints', () => {
  it('should map GeoJSON coordinates [lon, lat] to Leaflet [lat, lon] points', () => {
    const geoJsonGeometry = {
      coordinates: [
        [4.8322, 45.7578], // Place Bellecour [lon, lat]
        [4.8400, 45.7600]  // Lyon destination [lon, lat]
      ]
    }

    const points = mapGeometryToLeafletPoints(geoJsonGeometry)
    expect(points).toEqual([
      [45.7578, 4.8322],
      [45.7600, 4.8400]
    ])
  })

  it('should handle nested GeoJSON geometry object', () => {
    const data = {
      geometry: {
        coordinates: [
          [4.83, 45.75],
          [4.85, 45.77]
        ]
      }
    }

    const points = mapGeometryToLeafletPoints(data)
    expect(points).toEqual([
      [45.75, 4.83],
      [45.77, 4.85]
    ])
  })

  it('should decode an encoded polyline string', () => {
    const originalPoints: [number, number][] = [[45.7578, 4.8322], [45.7600, 4.8400]]
    const encodedStr = polyline.encode(originalPoints)
    const points = mapGeometryToLeafletPoints(encodedStr)

    expect(points.length).toBe(2)
    expect(points[0][0]).toBeCloseTo(45.7578, 4)
    expect(points[0][1]).toBeCloseTo(4.8322, 4)
  })

  it('should handle backend gateway response with trace field', () => {
    const originalPoints: [number, number][] = [[45.7578, 4.8322], [45.7600, 4.8400]]
    const encodedStr = polyline.encode(originalPoints)
    const gatewayResponse = {
      duree: 300,
      distance: 1200,
      trace: encodedStr
    }

    const points = mapGeometryToLeafletPoints(gatewayResponse)
    expect(points.length).toBe(2)
    expect(points[0][0]).toBeCloseTo(45.7578, 4)
  })

  it('should return empty array for null or empty inputs', () => {
    expect(mapGeometryToLeafletPoints(null)).toEqual([])
    expect(mapGeometryToLeafletPoints(undefined)).toEqual([])
    expect(mapGeometryToLeafletPoints({})).toEqual([])
  })
})
