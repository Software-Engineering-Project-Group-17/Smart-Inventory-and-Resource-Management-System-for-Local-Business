import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/sales/route'
import { NextRequest } from 'next/server'

// Mock the neon database
vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => {
    return vi.fn().mockImplementation((query) => {
      // Mock staff query
      if (query.text?.includes('SELECT s.branch_id FROM staff')) {
        return Promise.resolve([{ branch_id: 1 }])
      }
      
      // Mock inventory query
      if (query.text?.includes('SELECT') && query.text?.includes('inventory_item')) {
        return Promise.resolve([
          {
            id: 1,
            name: 'Test Product',
            barcode: '123456789',
            price: '10.99',
            stock: '50',
            category: 'Electronics'
          }
        ])
      }
      
      // Mock order creation
      if (query.text?.includes('INSERT INTO customer_order')) {
        return Promise.resolve([{ id: 1 }])
      }
      
      // Default response
      return Promise.resolve([])
    })
  })
}))

describe('/api/sales', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/sales', () => {
    it('returns error when userEmail is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/sales')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('User email is required')
    })

    it('returns inventory when valid userEmail is provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/sales?userEmail=test@example.com')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.inventory)).toBe(true)
    })

    it('searches inventory by name', async () => {
      const request = new NextRequest('http://localhost:3000/api/sales?userEmail=test@example.com&search=test&type=name')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('searches inventory by barcode', async () => {
      const request = new NextRequest('http://localhost:3000/api/sales?userEmail=test@example.com&search=123456&type=barcode')
      
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('POST /api/sales', () => {
    const validSaleData = {
      items: [
        {
          id: 1,
          name: 'Test Product',
          quantity: 2,
          price: 10.99,
          discountAmount: 0,
          totalPrice: 21.98
        }
      ],
      customerInfo: null,
      paymentAmount: 25.00,
      loyaltyPointsUsed: 0,
      userEmail: 'test@example.com',
      total: 21.98,
      subtotal: 21.98,
      totalDiscount: 0
    }

    it('returns error when items are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify({
          userEmail: 'test@example.com'
        })
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Items are required')
    })

    it('returns error when userEmail is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ id: 1, quantity: 1 }]
        })
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('User email is required')
    })

    it('processes sale successfully with valid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify(validSaleData)
      })
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.orderId).toBeDefined()
      expect(data.invoiceNumber).toBeDefined()
    })
  })
})
