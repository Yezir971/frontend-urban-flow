import { describe, it, expect } from 'vitest'
import { validateRouteInputs } from '../../utils/validation'

describe('validateRouteInputs', () => {
  const validLocation = { lat: 45.76, lon: 4.83, name: 'Lyon' }

  it('should return false if either start or end is null', () => {
    expect(validateRouteInputs(null, validLocation)).toBe(false)
    expect(validateRouteInputs(validLocation, null)).toBe(false)
    expect(validateRouteInputs(null, null)).toBe(false)
  })

  it('should return false if coordinates are null', () => {
    expect(validateRouteInputs({ lat: null, lon: 4.83, name: 'Lyon' }, validLocation)).toBe(false)
    expect(validateRouteInputs(validLocation, { lat: 45.76, lon: null, name: 'Lyon' })).toBe(false)
  })

  it('should return false if name is empty or whitespace', () => {
    expect(validateRouteInputs({ lat: 45.76, lon: 4.83, name: ' ' }, validLocation)).toBe(false)
  })

  it('should return true for valid locations', () => {
    expect(validateRouteInputs(validLocation, { lat: 45.75, lon: 4.85, name: 'Villeurbanne' })).toBe(true)
  })
})
