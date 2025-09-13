import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddItemPage from '../page'

// Mock Next.js router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
}))

// Mock auth functions
vi.mock('@/lib/auth', () => ({
  getUserProfile: vi.fn(() => ({
    email: 'test@example.com',
    name: 'Test User',
    role: 'STAFF'
  })),
  showRoleAccessNotification: vi.fn(),
}))

// Mock toast utils
vi.mock('@/lib/toast-utils', () => ({
  toastUtils: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock fetch for categories
global.fetch = vi.fn()

const mockCategories = [
  { id: '1', category_name: 'Electronics' },
  { id: '2', category_name: 'Clothing' },
  { id: '3', category_name: 'Food' },
]

describe('AddItemPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful categories fetch
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        categories: mockCategories,
      }),
    } as Response)
  })

  it('renders the add item form correctly', async () => {
    render(<AddItemPage />)

    expect(screen.getByText('Add New Inventory Item')).toBeInTheDocument()
    expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Barcode')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
    expect(screen.getByLabelText('Low Stock Threshold')).toBeInTheDocument()
    expect(screen.getByLabelText('Unit Price ($)')).toBeInTheDocument()
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
    })
  })

  it('loads categories on mount', async () => {
    render(<AddItemPage />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/inventory-categories')
    })

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument()
      expect(screen.getByText('Clothing')).toBeInTheDocument()
      expect(screen.getByText('Food')).toBeInTheDocument()
    })
  })

  it('allows filling out the form', async () => {
    const user = userEvent.setup()
    render(<AddItemPage />)

    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
    })

    // Fill out form fields
    await user.type(screen.getByLabelText('Item Name'), 'Test Product')
    await user.type(screen.getByLabelText('Barcode'), '1234567890')
    await user.type(screen.getByLabelText('Quantity'), '100')
    await user.type(screen.getByLabelText('Low Stock Threshold'), '10')
    await user.type(screen.getByLabelText('Unit Price ($)'), '15.99')

    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument()
    expect(screen.getByDisplayValue('100')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    expect(screen.getByDisplayValue('15.99')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<AddItemPage />)

    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByText('Add Item')).toBeInTheDocument()
    })

    // Try to submit without filling required fields
    const submitButton = screen.getByText('Add Item')
    await user.click(submitButton)

    // Form should not submit (would need to check validation messages)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('allows selecting a category', async () => {
    const user = userEvent.setup()
    render(<AddItemPage />)

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
    })

    const categorySelect = screen.getByLabelText('Category')
    await user.selectOptions(categorySelect, '1')

    expect(categorySelect).toHaveValue('1')
  })

  it('handles image upload', async () => {
    const user = userEvent.setup()
    render(<AddItemPage />)

    // Create a mock file
    const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' })
    
    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByText('Upload Image')).toBeInTheDocument()
    })

    const fileInput = screen.getByLabelText('Upload Image') as HTMLInputElement
    await user.upload(fileInput, file)

    expect(fileInput.files?.[0]).toBe(file)
  })

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<AddItemPage />)

    const backButton = screen.getByText('Back to Inventory')
    await user.click(backButton)

    expect(mockPush).toHaveBeenCalledWith('/inventory')
  })

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup()
    
    // Mock successful form submission
    vi.mocked(fetch).mockImplementation((url) => {
      if (url === '/api/inventory-categories') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            categories: mockCategories,
          }),
        } as Response)
      }
      
      // Mock item creation - make it take some time
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({ success: true }),
          } as Response)
        }, 100)
      })
    })

    render(<AddItemPage />)

    // Fill out form
    await waitFor(() => {
      expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Item Name'), 'Test Product')
    await user.type(screen.getByLabelText('Barcode'), '1234567890')
    await user.type(screen.getByLabelText('Quantity'), '100')
    await user.type(screen.getByLabelText('Low Stock Threshold'), '10')
    await user.type(screen.getByLabelText('Unit Price ($)'), '15.99')

    // Select category
    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
    })
    
    const categorySelect = screen.getByLabelText('Category')
    await user.selectOptions(categorySelect, '1')

    // Submit form
    const submitButton = screen.getByText('Add Item')
    await user.click(submitButton)

    // Should show loading state
    expect(screen.getByText('Adding Item...')).toBeInTheDocument()
  })

  it('handles categories loading error', async () => {
    // Mock failed categories fetch
    vi.mocked(fetch).mockRejectedValue(new Error('Failed to load categories'))

    render(<AddItemPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load categories')).toBeInTheDocument()
    })
  })

  it('handles form submission error', async () => {
    const user = userEvent.setup()
    
    // Mock failed form submission
    vi.mocked(fetch).mockImplementation((url) => {
      if (url === '/api/inventory-categories') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            categories: mockCategories,
          }),
        } as Response)
      }
      
      // Mock item creation failure
      return Promise.resolve({
        ok: false,
        json: async () => ({ error: 'Failed to create item' }),
      } as Response)
    })

    render(<AddItemPage />)

    // Fill out form
    await waitFor(() => {
      expect(screen.getByLabelText('Item Name')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Item Name'), 'Test Product')
    await user.type(screen.getByLabelText('Barcode'), '1234567890')
    await user.type(screen.getByLabelText('Quantity'), '100')
    await user.type(screen.getByLabelText('Low Stock Threshold'), '10')
    await user.type(screen.getByLabelText('Unit Price ($)'), '15.99')

    // Select category
    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
    })
    
    const categorySelect = screen.getByLabelText('Category')
    await user.selectOptions(categorySelect, '1')

    // Submit form
    const submitButton = screen.getByText('Add Item')
    await user.click(submitButton)

    // Wait for error handling
    await waitFor(() => {
      expect(screen.getByText('Add Item')).toBeInTheDocument() // Should return to normal state
    })
  })

  it('clears image when remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<AddItemPage />)

    // Upload an image first
    const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' })
    
    await waitFor(() => {
      expect(screen.getByText('Upload Image')).toBeInTheDocument()
    })

    const fileInput = screen.getByLabelText('Upload Image')
    await user.upload(fileInput, file)

    // Wait for image preview to appear, then remove it
    await waitFor(() => {
      const removeButton = screen.getByLabelText('Remove image')
      expect(removeButton).toBeInTheDocument()
    })

    const removeButton = screen.getByLabelText('Remove image')
    await user.click(removeButton)

    // Image should be removed
    expect(screen.queryByLabelText('Remove image')).not.toBeInTheDocument()
  })
})
