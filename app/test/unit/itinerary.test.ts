import { describe, it, expect } from 'vitest'
import {
  formatDuration,
  formatDistance,
  calculateArrivalTime,
  calculateCo2Savings,
  buildMultimodalProposals
} from '../../utils/itinerary.helpers'

describe('itinerary.helpers', () => {
  describe('formatDuration', () => {
    it('should format minutes under 1 hour', () => {
      expect(formatDuration(15)).toBe('15 min')
      expect(formatDuration(22)).toBe('22 min')
      expect(formatDuration(8.4)).toBe('8 min')
    })

    it('should format durations over 1 hour', () => {
      expect(formatDuration(60)).toBe('1h')
      expect(formatDuration(75)).toBe('1h 15min')
      expect(formatDuration(130)).toBe('2h 10min')
    })
  })

  describe('formatDistance', () => {
    it('should format meters under 1000m', () => {
      expect(formatDistance(450)).toBe('450 m')
      expect(formatDistance(999)).toBe('999 m')
    })

    it('should format kilometers for 1000m and above', () => {
      expect(formatDistance(1200)).toBe('1.2 km')
      expect(formatDistance(3500)).toBe('3.5 km')
    })
  })

  describe('calculateArrivalTime', () => {
    it('should calculate future arrival time formatted as HH:MM', () => {
      const fixedDate = new Date('2026-08-24T14:12:00')
      const arrival = calculateArrivalTime(12, fixedDate)
      expect(arrival).toBe('14:24')
    })
  })

  describe('calculateCo2Savings', () => {
    it('should calculate CO2 savings compared to a car', () => {
      const savingsWalk = calculateCo2Savings(2000, 'WALK')
      expect(savingsWalk).toBe(0.24)

      const savingsTransit = calculateCo2Savings(2000, 'TRANSIT')
      expect(savingsTransit).toBe(0.18)

      const savingsBike = calculateCo2Savings(2000, 'BICYCLE')
      expect(savingsBike).toBe(0.23)
    })
  })

  describe('buildMultimodalProposals', () => {
    it('should pass-through and format real proposals from backend OTP', () => {
      const rawBackendResult = {
        proposals: [
          {
            id: 'transit-otp',
            type: 'TRANSIT',
            title: 'Métro Ligne A',
            subtitle: 'Direction Vaulx-en-Velin La Soie',
            badge: 'A',
            durationMinutes: 14,
            distanceMeters: 3200,
            co2SavedKg: 0.29,
            trace: 'abc_polyline',
            legs: [
              {
                mode: 'WALK',
                title: 'Marche (3 min)',
                instruction: 'Vers Perrache',
                durationMinutes: 3,
                distanceMeters: 200,
                status: 'COMPLETED'
              },
              {
                mode: 'SUBWAY',
                title: 'Métro Ligne A',
                instruction: 'Direction Vaulx-en-Velin La Soie',
                durationMinutes: 8,
                distanceMeters: 2800,
                stopsCount: 5,
                line: 'A',
                status: 'IN_PROGRESS'
              }
            ]
          }
        ]
      }

      const proposals = buildMultimodalProposals(rawBackendResult, 'Perrache', 'Charpennes')
      expect(proposals.length).toBe(1)
      expect(proposals[0].title).toBe('Métro Ligne A')
      expect(proposals[0].badge).toBe('A')
      expect(proposals[0].legs.length).toBe(2)
      expect(proposals[0].legs[1].stopsCount).toBe(5)
    })
  })
})
