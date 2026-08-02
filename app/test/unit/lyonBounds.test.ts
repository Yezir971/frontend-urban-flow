import { describe, it, expect } from 'vitest'
import { isWithinLyonBounds } from '../../utils/lyonBounds'

describe('isWithinLyonBounds', () => {
  it('should return true for a location inside Lyon (e.g. Place Bellecour)', () => {
    expect(isWithinLyonBounds(45.7578, 4.8322)).toBe(true)
  })

  it('should return true for exactly the corners of the bounding box', () => {
    expect(isWithinLyonBounds(45.70, 4.77)).toBe(true)
    expect(isWithinLyonBounds(45.82, 4.90)).toBe(true)
  })

  it('should return false for Paris coordinates', () => {
    expect(isWithinLyonBounds(48.8566, 2.3522)).toBe(false)
  })

  it('should return false for coordinates outside the bounding box boundaries', () => {
    expect(isWithinLyonBounds(45.69, 4.83)).toBe(false) // too far south
    expect(isWithinLyonBounds(45.83, 4.83)).toBe(false) // too far north
    expect(isWithinLyonBounds(45.76, 4.76)).toBe(false) // too far west
    expect(isWithinLyonBounds(45.76, 4.91)).toBe(false) // too far east
  })
})
