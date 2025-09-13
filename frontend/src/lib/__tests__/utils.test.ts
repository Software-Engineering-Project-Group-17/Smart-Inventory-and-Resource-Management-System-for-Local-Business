import { describe, it, expect } from 'vitest'

// Example utility functions to test
export const calculateTotal = (items: Array<{price: number, quantity: number, discount?: number}>) => {
  return items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity
    const discount = item.discount || 0
    return total + (itemTotal - discount)
  }, 0)
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

describe('Utility Functions', () => {
  describe('calculateTotal', () => {
    it('calculates total for items without discount', () => {
      const items = [
        { price: 10, quantity: 2 },
        { price: 5, quantity: 3 }
      ]
      
      expect(calculateTotal(items)).toBe(35)
    })

    it('calculates total for items with discount', () => {
      const items = [
        { price: 10, quantity: 2, discount: 5 },
        { price: 5, quantity: 3, discount: 2 }
      ]
      
      expect(calculateTotal(items)).toBe(28)
    })

    it('returns 0 for empty array', () => {
      expect(calculateTotal([])).toBe(0)
    })
  })

  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(123.45)).toBe('$123.45')
    })

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-50.99)).toBe('-$50.99')
    })
  })

  describe('validateEmail', () => {
    it('returns true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('returns false for invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })
})
