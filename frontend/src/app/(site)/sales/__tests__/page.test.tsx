import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import SalesPage from '@/app/(site)/sales/page'

// Mock fetch responses
const mockInventoryResponse = {
  success: true,
  inventory: [
    {
      id: 1,
      name: 'Test Product',
      barcode: '123456789',
      price: 10.99,
      stock: 50,
      category: 'Electronics'
    }
  ]
}

const mockSaleResponse = {
  success: true,
  orderId: 1,
  invoiceNumber: 'INV-000001',
  message: 'Sale completed successfully'
}

describe('SalesPage', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.resetAllMocks()
    
    // Mock successful fetch responses by default
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/sales')) {
        if (url.includes('search=')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockInventoryResponse)
          })
        }
        // POST request for completing sale
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSaleResponse)
        })
      }
      
      // Default response
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    })
  })

  it('renders the sales page correctly', () => {
    render(<SalesPage />)
    
    expect(screen.getByText('Invoicing')).toBeInTheDocument()
    expect(screen.getByText('Add Items to Cart')).toBeInTheDocument()
    expect(screen.getByText('Shopping Cart (0 items)')).toBeInTheDocument()
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })

  it('allows searching for products', async () => {
    const user = userEvent.setup()
    render(<SalesPage />)
    
    const searchInput = screen.getByPlaceholderText('Type product name...')
    
    await user.type(searchInput, 'Test Product')
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sales?search=Test%20Product')
      )
    })
  })

  it('displays search results', async () => {
    const user = userEvent.setup()
    render(<SalesPage />)
    
    const searchInput = screen.getByPlaceholderText('Type product name...')
    await user.type(searchInput, 'Test')
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
      expect(screen.getByText('$10.99')).toBeInTheDocument()
      expect(screen.getByText('Stock: 50')).toBeInTheDocument()
    })
  })

  it('allows selecting a product and adding to cart', async () => {
    const user = userEvent.setup()
    render(<SalesPage />)
    
    // Search for product
    const searchInput = screen.getByPlaceholderText('Type product name...')
    await user.type(searchInput, 'Test')
    
    // Wait for results and click on product
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Test Product'))
    
    // Product should be selected and details shown
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
    
    // Add to cart
    await user.click(screen.getByText('Add to Cart'))
    
    // Cart should now have 1 item
    await waitFor(() => {
      expect(screen.getByText('Shopping Cart (1 items)')).toBeInTheDocument()
    })
  })

  it('validates payment amount before completing sale', async () => {
    const user = userEvent.setup()
    render(<SalesPage />)
    
    // Add a product to cart first
    const searchInput = screen.getByPlaceholderText('Type product name...')
    await user.type(searchInput, 'Test')
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Test Product'))
    await user.click(screen.getByText('Add to Cart'))
    
    // Try to complete sale without payment
    const completeButton = screen.getByText('Complete & Print Invoice')
    await user.click(completeButton)
    
    // Should show insufficient payment error
    await waitFor(() => {
      expect(screen.getByText('Insufficient payment amount')).toBeInTheDocument()
    })
  })

  it('completes sale successfully with valid payment', async () => {
    const user = userEvent.setup()
    render(<SalesPage />)
    
    // Add product to cart
    const searchInput = screen.getByPlaceholderText('Type product name...')
    await user.type(searchInput, 'Test')
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Test Product'))
    await user.click(screen.getByText('Add to Cart'))
    
    // Add payment amount
    const paymentInput = screen.getByPlaceholderText('0.00')
    await user.type(paymentInput, '20')
    
    // Complete sale
    const completeButton = screen.getByText('Complete & Print Invoice')
    await user.click(completeButton)
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/Sale completed successfully/)).toBeInTheDocument()
    })
  })

  it('switches between search types', async () => {
    const user = userEvent.setup()
    render(<SalesPage />)
    
    // Default should be search by name
    expect(screen.getByPlaceholderText('Type product name...')).toBeInTheDocument()
    
    // Click barcode search
    await user.click(screen.getByText('Scan Barcode'))
    
    // Should switch to barcode placeholder
    expect(screen.getByPlaceholderText('Scan or enter barcode...')).toBeInTheDocument()
  })
})
