import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from '../page'

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  withAuth: (Component: any) => Component,
}))

// Mock showRoleAccessNotification and hasAnyRole
vi.mock('@/lib/auth', () => ({
  showRoleAccessNotification: vi.fn(),
  hasAnyRole: vi.fn(() => true), // Mock to return true by default
}))

// Mock inventory data hook
const mockInventoryData = {
  inventory: [
    {
      inventoryId: 1,
      itemName: 'Test Product 1',
      categoryName: 'Electronics', 
      currentStock: 50,
      reorderLevel: 10,
      unitPrice: 15.00,
      supplier: 'Test Supplier',
      lastUpdated: '2025-09-13T10:00:00Z',
    },
    {
      inventoryId: 2,
      itemName: 'Low Stock Item',
      categoryName: 'Clothing',
      currentStock: 5,
      reorderLevel: 20,
      unitPrice: 30.00,
      supplier: 'Fashion Corp',
      lastUpdated: '2025-09-13T09:00:00Z',
    }
  ],
  categories: [
    { categoryId: 1, categoryName: 'Electronics' },
    { categoryId: 2, categoryName: 'Clothing' }
  ],
  branch: {
    branchId: 1,
    name: 'Main Branch',
    location: 'Downtown'
  },
  stats: {
    totalItems: 2,
    totalValue: 900.00,
    lowStockCount: 1,
    categoriesCount: 2
  },
  lowStockItems: [
    {
      inventoryId: 2,
      itemName: 'Low Stock Item',
      categoryName: 'Clothing',
      currentStock: 5,
      reorderLevel: 20,
      unitPrice: 30.00,
      supplier: 'Fashion Corp',
      lastUpdated: '2025-09-13T09:00:00Z',
    }
  ],
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedCategory: '',
  showLowStockOnly: false,
  setSearchTerm: vi.fn(),
  setSelectedCategory: vi.fn(),
  setShowLowStockOnly: vi.fn(),
  refreshInventory: vi.fn(),
}

// Create a mutable mock that we can update per test
let currentMockData = { ...mockInventoryData }

vi.mock('@/hooks/useInventoryData', () => ({
  useInventoryData: () => currentMockData,
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('InventoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock data to default before each test
    currentMockData = { ...mockInventoryData }
  })

  it('renders the inventory page correctly', () => {
    render(<InventoryPage />)

    expect(screen.getByText('Inventory Management')).toBeInTheDocument()
    expect(screen.getByText('Main Branch')).toBeInTheDocument()
    expect(screen.getByText('Downtown')).toBeInTheDocument()
    expect(screen.getByText('Add Category')).toBeInTheDocument()
    expect(screen.getByText('Add Item')).toBeInTheDocument()
    expect(screen.getByText('Restock Request')).toBeInTheDocument()
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })

  it('displays stats cards with correct data', () => {
    render(<InventoryPage />)

    expect(screen.getByText('Total Items')).toBeInTheDocument()
    // Use getAllByText since "2" appears twice (Total Items: 2, Categories: 2)
    const twoElements = screen.getAllByText('2')
    expect(twoElements.length).toBeGreaterThanOrEqual(1)
    
    // Use getAllByText since "Total Value" appears in both stats card and table header
    const totalValueElements = screen.getAllByText('Total Value')
    expect(totalValueElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('$900.00')).toBeInTheDocument()
    expect(screen.getByText('Low Stock Items')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('displays low stock alert when there are low stock items', () => {
    render(<InventoryPage />)

    expect(screen.getByText('Low Stock Alert')).toBeInTheDocument()
    expect(screen.getByText(/You have 1 items with low stock/)).toBeInTheDocument()
    expect(screen.getByText('View low stock items')).toBeInTheDocument()
  })

  it('allows filtering by low stock items', async () => {
    const user = userEvent.setup()
    render(<InventoryPage />)

    const viewLowStockButton = screen.getByText('View low stock items')
    await user.click(viewLowStockButton)

    expect(mockInventoryData.setShowLowStockOnly).toHaveBeenCalledWith(true)
  })

  it('calls refresh inventory when refresh button is clicked', async () => {
    const user = userEvent.setup()
    render(<InventoryPage />)

    const refreshButton = screen.getByText('Refresh')
    await user.click(refreshButton)

    expect(mockInventoryData.refreshInventory).toHaveBeenCalled()
  })

  it('displays inventory table with items', () => {
    render(<InventoryPage />)

    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('Low Stock Item')).toBeInTheDocument()
    // Use getAllByText since "Electronics" and "Clothing" appear in both filter dropdown and table
    const electronicsElements = screen.getAllByText('Electronics')
    expect(electronicsElements.length).toBeGreaterThanOrEqual(1)
    const clothingElements = screen.getAllByText('Clothing')
    expect(clothingElements.length).toBeGreaterThanOrEqual(1)
  })

  it('handles loading state correctly', () => {
    // Update the mock data for this test
    currentMockData = {
      ...mockInventoryData,
      isLoading: true,
    }

    render(<InventoryPage />)

    // Should show loading animation
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('handles error state correctly', () => {
    // Update the mock data for this test
    currentMockData = {
      ...mockInventoryData,
      error: 'Failed to load inventory data',
    }

    render(<InventoryPage />)

    expect(screen.getByText('Error Loading Inventory')).toBeInTheDocument()
    expect(screen.getByText('Failed to load inventory data')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('can retry loading inventory after error', async () => {
    const user = userEvent.setup()
    
    // Update the mock data for this test
    currentMockData = {
      ...mockInventoryData,
      error: 'Failed to load inventory data',
    }

    render(<InventoryPage />)

    const tryAgainButton = screen.getByText('Try Again')
    await user.click(tryAgainButton)

    expect(currentMockData.refreshInventory).toHaveBeenCalled()
  })

  it('has correct navigation links', () => {
    render(<InventoryPage />)

    const addCategoryLink = screen.getByText('Add Category').closest('a')
    const addItemLink = screen.getByText('Add Item').closest('a')
    const restockRequestLink = screen.getByText('Restock Request').closest('a')

    expect(addCategoryLink).toHaveAttribute('href', '/inventory/addCategory')
    expect(addItemLink).toHaveAttribute('href', '/inventory/addItem')
    expect(restockRequestLink).toHaveAttribute('href', '/inventory/restock-requests')
  })

  it('does not show low stock alert when showLowStockOnly is true', () => {
    // Update the mock data for this test
    currentMockData = {
      ...mockInventoryData,
      showLowStockOnly: true,
    }

    render(<InventoryPage />)

    expect(screen.queryByText('Low Stock Alert')).not.toBeInTheDocument()
  })

  it('does not show low stock alert when there are no low stock items', () => {
    // Update the mock data for this test
    currentMockData = {
      ...mockInventoryData,
      lowStockItems: [],
      stats: {
        ...mockInventoryData.stats,
        lowStockCount: 0,
      }
    }

    render(<InventoryPage />)

    expect(screen.queryByText('Low Stock Alert')).not.toBeInTheDocument()
  })
})
