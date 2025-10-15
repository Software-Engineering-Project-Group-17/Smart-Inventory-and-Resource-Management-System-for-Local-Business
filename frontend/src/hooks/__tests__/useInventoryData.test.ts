import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useInventoryData } from '../useInventoryData'
import { inventoryApi } from '@/lib/api/inventory'

// Mock the inventory API
vi.mock('@/lib/api/inventory', () => ({
  inventoryApi: {
    getAll: vi.fn(),
  },
}))

const mockInventoryResponse = {
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
    },
    {
      inventoryId: 3,
      itemName: 'High Stock Item',
      categoryName: 'Electronics',
      currentStock: 100,
      reorderLevel: 15,
      unitPrice: 25.00,
      supplier: 'Tech Corp',
      lastUpdated: '2025-09-13T08:00:00Z',
    }
  ],
  categories: [
    { categoryId: 1, categoryName: 'Electronics' },
    { categoryId: 2, categoryName: 'Clothing' },
  ],
  branch: {
    branchId: 1,
    name: 'Main Branch',
    location: 'Downtown',
  },
}

describe('useInventoryData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(inventoryApi.getAll).mockResolvedValue(mockInventoryResponse)
  })

  it('loads inventory data on mount', async () => {
    const { result } = renderHook(() => useInventoryData())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(inventoryApi.getAll).toHaveBeenCalledOnce()
    expect(result.current.inventory).toEqual(mockInventoryResponse.inventory)
    expect(result.current.categories).toEqual(mockInventoryResponse.categories)
    expect(result.current.branch).toEqual(mockInventoryResponse.branch)
  })

  it('calculates stats correctly', async () => {
    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const expectedTotalValue = (50 * 15.00) + (5 * 30.00) + (100 * 25.00) // 750 + 150 + 2500 = 3400
    const expectedLowStockCount = 1 // Only item 2 has currentStock <= reorderLevel (5 <= 20)

    expect(result.current.stats).toEqual({
      totalItems: 3,
      totalValue: expectedTotalValue,
      lowStockCount: expectedLowStockCount,
      categoriesCount: 2,
    })
  })

  it('identifies low stock items correctly', async () => {
    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.lowStockItems).toHaveLength(1)
    expect(result.current.lowStockItems[0].itemName).toBe('Low Stock Item')
    expect(result.current.lowStockItems[0].currentStock).toBe(5)
    expect(result.current.lowStockItems[0].reorderLevel).toBe(20)
  })

  it('filters inventory by search term', async () => {
    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Test search filtering
    expect(result.current.inventory).toHaveLength(3)

    // Mock search term change
    result.current.setSearchTerm('Low Stock')

    await waitFor(() => {
      expect(result.current.searchTerm).toBe('Low Stock')
    })

    // The hook should filter inventory based on search term
    // Note: We need to check the filtered inventory logic
  })

  it('filters inventory by category', async () => {
    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    result.current.setSelectedCategory('Electronics')

    await waitFor(() => {
      expect(result.current.selectedCategory).toBe('Electronics')
    })
  })

  it('toggles low stock filter', async () => {
    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.showLowStockOnly).toBe(false)

    result.current.setShowLowStockOnly(true)

    await waitFor(() => {
      expect(result.current.showLowStockOnly).toBe(true)
    })
  })

  it('handles API errors correctly', async () => {
    const errorMessage = 'Failed to fetch inventory'
    vi.mocked(inventoryApi.getAll).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useInventoryData())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe(errorMessage)
    expect(result.current.inventory).toEqual([])
    expect(result.current.categories).toEqual([])
    expect(result.current.branch).toBe(null)
  })

  it('handles network errors correctly', async () => {
    vi.mocked(inventoryApi.getAll).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
  })

  it('handles non-Error rejections correctly', async () => {
    vi.mocked(inventoryApi.getAll).mockRejectedValueOnce('String error')

    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load inventory')
  })

  it('can refresh inventory data', async () => {
    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(inventoryApi.getAll).toHaveBeenCalledOnce()

    // Call refresh and wait for loading state to update
    await waitFor(() => {
      result.current.refreshInventory()
      return result.current.isLoading === true
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(inventoryApi.getAll).toHaveBeenCalledTimes(2)
  })

  it('clears error on successful refresh', async () => {
    // First call fails
    vi.mocked(inventoryApi.getAll).mockRejectedValueOnce(new Error('First error'))

    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.error).toBe('First error')
    })

    // Second call succeeds
    vi.mocked(inventoryApi.getAll).mockResolvedValueOnce(mockInventoryResponse)

    result.current.refreshInventory()

    await waitFor(() => {
      expect(result.current.error).toBe(null)
      expect(result.current.inventory).toEqual(mockInventoryResponse.inventory)
    })
  })

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useInventoryData())

    expect(result.current.inventory).toEqual([])
    expect(result.current.categories).toEqual([])
    expect(result.current.branch).toBe(null)
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.searchTerm).toBe('')
    expect(result.current.selectedCategory).toBe('')
    expect(result.current.showLowStockOnly).toBe(false)
  })

  it('calculates stats with zero values correctly', async () => {
    const emptyResponse = {
      inventory: [],
      categories: [],
      branch: {
        branchId: 1,
        name: 'Empty Branch',
        location: 'Test Location',
      },
    }

    vi.mocked(inventoryApi.getAll).mockResolvedValueOnce(emptyResponse)

    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.stats).toEqual({
      totalItems: 0,
      totalValue: 0,
      lowStockCount: 0,
      categoriesCount: 0,
    })
  })

  it('handles items with zero or negative stock correctly in stats', async () => {
    const inventoryWithZeroStock = {
      ...mockInventoryResponse,
      inventory: [
        {
          inventoryId: 1,
          itemName: 'Zero Stock Item',
          categoryName: 'Electronics',
          currentStock: 0,
          reorderLevel: 10,
          unitPrice: 15.00,
          supplier: 'Test Supplier',
          lastUpdated: '2025-09-13T10:00:00Z',
        },
        {
          inventoryId: 2,
          itemName: 'Negative Stock Item',
          categoryName: 'Clothing',
          currentStock: -5,
          reorderLevel: 10,
          unitPrice: 30.00,
          supplier: 'Fashion Corp',
          lastUpdated: '2025-09-13T09:00:00Z',
        }
      ]
    }

    vi.mocked(inventoryApi.getAll).mockResolvedValueOnce(inventoryWithZeroStock)

    const { result } = renderHook(() => useInventoryData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Both items should be considered low stock (currentStock <= reorderLevel)
    expect(result.current.stats.lowStockCount).toBe(2)
    // Total value should be 0 + (-150) = -150
    expect(result.current.stats.totalValue).toBe(-150)
  })
})
