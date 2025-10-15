import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import SalesPage from '@/app/(site)/sales/page'

// Mock getUserProfile
vi.mock('@/lib/auth', () => ({
  getUserProfile: vi.fn(() => ({
    email: 'test@example.com',
    name: 'Test User'
  }))
}))

// Mock toast utilities
vi.mock('@/lib/toast-utils', () => ({
  toastUtils: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}))

// Mock PDF generation utilities
vi.mock('@/lib/simplePdf', () => ({
  downloadSimplePDF: vi.fn(),
  printSimplePDF: vi.fn(),
  previewSimplePDF: vi.fn()
}))

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mockqrcode'))
  }
}))

// Mock useBarcodeSocket hook
vi.mock('@/hooks/useBarcodeSocket', () => ({
  useBarcodeSocket: vi.fn(() => ({
    isConnected: true,
    lastScannedBarcode: null,
    lastScanEvent: null,
    connectionStatus: 'Connected',
    sendBarcode: vi.fn(),
    reconnect: vi.fn()
  }))
}))

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
    global.fetch = vi.fn().mockImplementation((url: string | URL | Request, options?: any) => {
      const urlString = typeof url === 'string' ? url : url.toString()
      
      if (urlString.includes('/api/sales')) {
        // GET request with search parameter
        if (urlString.includes('search=') || urlString.includes('userEmail=')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockInventoryResponse)
          } as Response)
        }
        // POST request for completing sale
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockSaleResponse)
          } as Response)
        }
      }
      
      // Default response
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      } as Response)
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
        expect.stringMatching(/\/api\/sales\?search=.*Test.*Product.*&type=name&userEmail=/)
      )
    }, { timeout: 3000 })
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
    await waitFor(() => {
      expect(screen.getByText(/Add to Cart/)).toBeInTheDocument()
    })
    
    // Add to cart - find the button that contains "Add to Cart"
    const addButton = screen.getByRole('button', { name: /Add to Cart/i })
    await user.click(addButton)
    
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
    
    // Add to cart
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeInTheDocument()
    })
    const addButton = screen.getByRole('button', { name: /Add to Cart/i })
    await user.click(addButton)
    
    // Wait for cart to update
    await waitFor(() => {
      expect(screen.getByText('Shopping Cart (1 items)')).toBeInTheDocument()
    })
    
    // The complete sale button should be disabled when payment is insufficient
    const completeButton = screen.getByRole('button', { name: /Complete Sale & Generate Invoice/i })
    expect(completeButton).toBeDisabled()
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
    
    // Add to cart
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeInTheDocument()
    })
    const addButton = screen.getByRole('button', { name: /Add to Cart/i })
    await user.click(addButton)
    
    // Wait for cart to update
    await waitFor(() => {
      expect(screen.getByText('Shopping Cart (1 items)')).toBeInTheDocument()
    })
    
    // Add payment amount - find the Customer Payment input by placeholder
    const paymentInput = screen.getByPlaceholderText('0.00')
    await user.clear(paymentInput)
    await user.type(paymentInput, '20')
    
    // Complete sale
    const completeButton = screen.getByRole('button', { name: /Complete Sale & Generate Invoice/i })
    
    // Button should now be enabled
    await waitFor(() => {
      expect(completeButton).not.toBeDisabled()
    })
    
    await user.click(completeButton)
    
    // Should call the API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sales'),
        expect.objectContaining({
          method: 'POST'
        })
      )
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
