import { describe, it, expect } from 'vitest'

export const add = (a: number, b: number): number => {
  return a + b
}


describe('Suite de tests : Math Utils', () => {
  
  it('doit retourner 5 pour l\'addition de 2 et 3', () => {
    // Action
    const resultat = add(2, 3)
    
    // Assertion
    expect(resultat).toBe(5)
  })

  it('doit fonctionner avec des nombres négatifs', () => {
    expect(add(-1, -1)).toBe(-2)
    expect(add(-1, 5)).toBe(4)
  })

  it('doit retourner un nombre (type checking)', () => {
    expect(typeof add(1, 1)).toBe('number')
  })
  
})