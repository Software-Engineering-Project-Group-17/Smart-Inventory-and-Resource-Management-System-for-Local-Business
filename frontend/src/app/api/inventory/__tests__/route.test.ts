import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../route'

// Mock the requireAuth module
vi.mock('@/lib/requireAuth', () => ({
  requireAuth: vi.fn(() => Promise.resolve({
    isAuthenticated: true,
    user: {
      uid: 'test-uid',
      email: 'test@example.com',
      role: 'STAFF',
      branchId: 1,
    },
  })),
  createAuthResponse: vi.fn(() => null),
}))

// Mock the database connection
vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => {
    // Return a function that acts as a tagged template
    const sqlFunction = (strings: TemplateStringsArray | string[], ...values: any[]) => {
      const queryString = Array.isArray(strings) ? strings.join('?') : strings;
      
      // Mock staff query
      if (queryString.includes('SELECT s.branch_id FROM staff') || 
          queryString.includes('SELECT s.branch_id')) {
        return Promise.resolve([{ branch_id: 1 }])
      }
      
      // Mock user query for OWNER role
      if (queryString.includes('FROM staff s') && queryString.includes('JOIN app_user')) {
        return Promise.resolve([{ branch_id: 1 }])
      }
      
      // Mock inventory query
      if (queryString.includes('FROM inventory_item') || queryString.includes('SELECT')) {
        return Promise.resolve([
          {
            inventory_id: 1,
            inventory_name: 'Test Product',
            barcode: '123456789',
            unit_price: '10.99',
            quantity: '50',
            category_name: 'Electronics',
            low_stock_threshold: '10',
            branch_id: 1,
            image_url: null,
          }
        ])
      }
      
      return Promise.resolve([])
    }
    
    return sqlFunction
  }),
}))

// Mock AWS SDK
vi.mock('aws-sdk', () => ({
  default: {
    S3: vi.fn(() => ({})),
  },
}))

// Mock the notification service
vi.mock('@/lib/notification-service', () => ({
  NotificationService: vi.fn(),
}))

describe('/api/inventory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock environment variables
    process.env.DATABASE_URL = 'test-db-url'
    process.env.AWS_ACCESS_KEY_ID = 'test-key'
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'
    process.env.AWS_REGION = 'us-east-1'
    process.env.AWS_S3_BUCKET = 'test-bucket'
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
    process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com'
    process.env.FIREBASE_PRIVATE_KEY = 'test-key'
  })

  describe('GET /api/inventory', () => {
    it('returns inventory for authenticated user', async () => {
      const url = new URL('http://localhost:3000/api/inventory?userEmail=test@example.com')
      const request = new NextRequest(url)
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.inventory)).toBe(true)
    })

    it('handles requests with stats query parameter', async () => {
      const url = new URL('http://localhost:3000/api/inventory?userEmail=test@example.com&stats=true')
      const request = new NextRequest(url)
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
