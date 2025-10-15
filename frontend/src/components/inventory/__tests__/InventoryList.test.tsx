import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InventoryTable } from '../InventoryList'
import { InventoryItem } from '@/lib/api/inventory'

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  getUserProfile: vi.fn(() => ({ email: 'test@example.com', name: 'Test User' })),
  hasAnyRole: vi.fn(() => false), // Default to false (no edit permissions)
}))

// Mock toast utils
vi.mock('@/lib/toast-utils', () => ({
  toastUtils: {
    formSuccess: vi.fn(),
    error: vi.fn(),
    networkError: vi.fn(),
  },
}))

const mockInventoryItems: InventoryItem[] = [
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
  },
  {
    inventoryId: 3,
    itemName: 'Out of Stock Item',
    categoryName: 'Food',
    currentStock: 0,
    reorderLevel: 15,
    unitPrice: 8.00,
    supplier: 'Food Supplies Inc',
    lastUpdated: '2025-09-12T15:00:00Z',
  }
]

describe('InventoryTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays loading state correctly', () => {
    render(<InventoryTable inventory={[]} isLoading={true} />)

    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('No inventory items found')).not.toBeInTheDocument()
  })

  it('displays empty state when no inventory items', () => {
    render(<InventoryTable inventory={[]} isLoading={false} />)

    expect(screen.getByText('No inventory items found')).toBeInTheDocument()
    expect(screen.getByText('No items match your current search criteria or filters.')).toBeInTheDocument()
  })

  it('renders inventory table with items correctly', () => {
    render(<InventoryTable inventory={mockInventoryItems} isLoading={false} />)

    // Check table headers (actual headers from component)
    expect(screen.getByText('Item Details')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Stock')).toBeInTheDocument()
    expect(screen.getByText('Unit Price')).toBeInTheDocument()
    expect(screen.getByText('Low Stock Threshold')).toBeInTheDocument()
    expect(screen.getByText('Total Value')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()

    // Check inventory item data
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    // Category badges appear in the table
    const electronicsElements = screen.getAllByText('Electronics')
    expect(electronicsElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('$15.00')).toBeInTheDocument()
    expect(screen.getByText('$750.00')).toBeInTheDocument() // 50 * 15.00

    expect(screen.getByText('Low Stock Item')).toBeInTheDocument()
    const clothingElements = screen.getAllByText('Clothing')
    expect(clothingElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('$30.00')).toBeInTheDocument()
    expect(screen.getByText('$150.00')).toBeInTheDocument() // 5 * 30.00

    expect(screen.getByText('Out of Stock Item')).toBeInTheDocument()
    const foodElements = screen.getAllByText('Food')
    expect(foodElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('$8.00')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument() // 0 * 8.00
  })

  it('displays correct status badges for different stock levels', () => {
    render(<InventoryTable inventory={mockInventoryItems} isLoading={false} />)

    // Low stock items should show warning badge (currentStock <= reorderLevel)
    // Multiple items can have "Low Stock" badge
    const lowStockBadges = screen.getAllByText('Low Stock')
    expect(lowStockBadges.length).toBeGreaterThanOrEqual(1)

    // Normal stock item should show in stock badge
    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })

  it('displays reorder levels correctly', () => {
    render(<InventoryTable inventory={mockInventoryItems} isLoading={false} />)

    // The component shows reorder levels in the "Low Stock Threshold" column
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('calculates total values correctly', () => {
    render(<InventoryTable inventory={mockInventoryItems} isLoading={false} />)

    expect(screen.getByText('$750.00')).toBeInTheDocument() // 50 * 15.00
    expect(screen.getByText('$150.00')).toBeInTheDocument() // 5 * 30.00
    expect(screen.getByText('$0.00')).toBeInTheDocument() // 0 * 8.00
  })

  it('formats currency correctly', () => {
    render(<InventoryTable inventory={mockInventoryItems} isLoading={false} />)

    expect(screen.getByText('$15.00')).toBeInTheDocument()
    expect(screen.getByText('$30.00')).toBeInTheDocument()
    expect(screen.getByText('$8.00')).toBeInTheDocument()
  })

  it('renders responsive table structure', () => {
    render(<InventoryTable inventory={mockInventoryItems} isLoading={false} />)

    // Check table structure
    expect(document.querySelector('table')).toBeInTheDocument()
    expect(document.querySelector('thead')).toBeInTheDocument()
    expect(document.querySelector('tbody')).toBeInTheDocument()
    expect(document.querySelector('.overflow-x-auto')).toBeInTheDocument()
  })

  it('handles empty item names gracefully', () => {
    const itemWithEmptyName = {
      ...mockInventoryItems[0],
      itemName: '',
    }
    
    render(<InventoryTable inventory={[itemWithEmptyName]} isLoading={false} />)

    const electronicsElements = screen.getAllByText('Electronics')
    expect(electronicsElements.length).toBeGreaterThanOrEqual(1)
  })

  it('handles zero quantity correctly', () => {
    const itemWithZeroQuantity = {
      ...mockInventoryItems[0],
      currentStock: 0,
    }
    
    render(<InventoryTable inventory={[itemWithZeroQuantity]} isLoading={false} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Low Stock')).toBeInTheDocument() // 0 <= reorderLevel
  })

  it('shows low stock when current stock is at reorder level', () => {
    const itemAtReorderLevel = {
      ...mockInventoryItems[0],
      currentStock: 10, // Same as reorderLevel
    }
    
    render(<InventoryTable inventory={[itemAtReorderLevel]} isLoading={false} />)

    // "10" appears in both Stock column and Low Stock Threshold column
    const tenElements = screen.getAllByText('10')
    expect(tenElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Low Stock')).toBeInTheDocument()
  })

  it('shows in stock when current stock is above reorder level', () => {
    const itemAboveReorderLevel = {
      ...mockInventoryItems[0],
      currentStock: 100, // Above reorderLevel of 10
    }
    
    render(<InventoryTable inventory={[itemAboveReorderLevel]} isLoading={false} />)

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })
})
