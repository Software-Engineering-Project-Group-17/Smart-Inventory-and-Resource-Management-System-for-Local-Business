import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SimpleInventoryFilters } from '../SimpleInventoryFilters'
import { Category } from '@/lib/api/inventory'

const mockCategories: Category[] = [
  { categoryId: 1, categoryName: 'Electronics' },
  { categoryId: 2, categoryName: 'Clothing' },
  { categoryId: 3, categoryName: 'Food' },
  { categoryId: 4, categoryName: 'Books' },
]

const defaultProps = {
  searchTerm: '',
  selectedCategory: '',
  showLowStockOnly: false,
  categories: mockCategories,
  onSearchChange: vi.fn(),
  onCategoryChange: vi.fn(),
  onLowStockToggle: vi.fn(),
}

describe('SimpleInventoryFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all filter elements correctly', () => {
    render(<SimpleInventoryFilters {...defaultProps} />)

    expect(screen.getByPlaceholderText('Search inventory items...')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument()
    expect(screen.getByLabelText('Show only low stock items')).toBeInTheDocument()
  })

  it('displays search input with correct value', () => {
    const propsWithSearch = {
      ...defaultProps,
      searchTerm: 'test search',
    }

    render(<SimpleInventoryFilters {...propsWithSearch} />)

    const searchInput = screen.getByPlaceholderText('Search inventory items...')
    expect(searchInput).toHaveValue('test search')
  })

  it('calls onSearchChange when search input changes', async () => {
    const user = userEvent.setup()
    render(<SimpleInventoryFilters {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search inventory items...')
    await user.type(searchInput, 'new search')

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('new search')
  })

  it('displays all categories in dropdown', () => {
    render(<SimpleInventoryFilters {...defaultProps} />)

    const categorySelect = screen.getByDisplayValue('All Categories')
    expect(categorySelect).toBeInTheDocument()

    // Check that all categories are in the select options
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(5) // 4 categories + "All Categories" option

    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('Clothing')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Books')).toBeInTheDocument()
  })

  it('displays selected category correctly', () => {
    const propsWithSelectedCategory = {
      ...defaultProps,
      selectedCategory: 'Electronics',
    }

    render(<SimpleInventoryFilters {...propsWithSelectedCategory} />)

    const categorySelect = screen.getByDisplayValue('Electronics')
    expect(categorySelect).toBeInTheDocument()
  })

  it('calls onCategoryChange when category selection changes', async () => {
    const user = userEvent.setup()
    render(<SimpleInventoryFilters {...defaultProps} />)

    const categorySelect = screen.getByDisplayValue('All Categories')
    await user.selectOptions(categorySelect, 'Electronics')

    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('Electronics')
  })

  it('displays low stock toggle with correct state', () => {
    render(<SimpleInventoryFilters {...defaultProps} />)

    const lowStockToggle = screen.getByLabelText('Show only low stock items')
    expect(lowStockToggle).not.toBeChecked()
  })

  it('displays low stock toggle as checked when showLowStockOnly is true', () => {
    const propsWithLowStock = {
      ...defaultProps,
      showLowStockOnly: true,
    }

    render(<SimpleInventoryFilters {...propsWithLowStock} />)

    const lowStockToggle = screen.getByLabelText('Show only low stock items')
    expect(lowStockToggle).toBeChecked()
  })

  it('calls onLowStockToggle when checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(<SimpleInventoryFilters {...defaultProps} />)

    const lowStockToggle = screen.getByLabelText('Show only low stock items')
    await user.click(lowStockToggle)

    expect(defaultProps.onLowStockToggle).toHaveBeenCalledWith(true)
  })

  it('shows clear filters button when filters are active', () => {
    const propsWithActiveFilters = {
      ...defaultProps,
      searchTerm: 'test',
    }

    render(<SimpleInventoryFilters {...propsWithActiveFilters} />)

    expect(screen.getByText('Clear Filters')).toBeInTheDocument()
  })

  it('shows clear filters button when category is selected', () => {
    const propsWithSelectedCategory = {
      ...defaultProps,
      selectedCategory: 'Electronics',
    }

    render(<SimpleInventoryFilters {...propsWithSelectedCategory} />)

    expect(screen.getByText('Clear Filters')).toBeInTheDocument()
  })

  it('shows clear filters button when low stock filter is active', () => {
    const propsWithLowStock = {
      ...defaultProps,
      showLowStockOnly: true,
    }

    render(<SimpleInventoryFilters {...propsWithLowStock} />)

    expect(screen.getByText('Clear Filters')).toBeInTheDocument()
  })

  it('does not show clear filters button when no filters are active', () => {
    render(<SimpleInventoryFilters {...defaultProps} />)

    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument()
  })

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup()
    const propsWithAllFilters = {
      ...defaultProps,
      searchTerm: 'test search',
      selectedCategory: 'Electronics',
      showLowStockOnly: true,
    }

    render(<SimpleInventoryFilters {...propsWithAllFilters} />)

    const clearButton = screen.getByText('Clear Filters')
    await user.click(clearButton)

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('')
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('')
    expect(defaultProps.onLowStockToggle).toHaveBeenCalledWith(false)
  })

  it('handles empty categories array gracefully', () => {
    const propsWithNoCategories = {
      ...defaultProps,
      categories: [],
    }

    render(<SimpleInventoryFilters {...propsWithNoCategories} />)

    const categorySelect = screen.getByDisplayValue('All Categories')
    expect(categorySelect).toBeInTheDocument()

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1) // Only "All Categories" option
  })

  it('displays search icon in search input', () => {
    render(<SimpleInventoryFilters {...defaultProps} />)

    const searchIcon = document.querySelector('.lucide-search')
    expect(searchIcon).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<SimpleInventoryFilters {...defaultProps} />)

    // Check for main container styling
    const container = document.querySelector('.bg-white.rounded-lg.shadow')
    expect(container).toBeInTheDocument()

    // Check for responsive grid layout
    const filterContainer = document.querySelector('.flex.flex-col.lg\\:flex-row')
    expect(filterContainer).toBeInTheDocument()
  })

  it('maintains accessibility with proper labels', () => {
    render(<SimpleInventoryFilters {...defaultProps} />)

    // Check that form elements have proper labels/placeholders
    expect(screen.getByPlaceholderText('Search inventory items...')).toBeInTheDocument()
    expect(screen.getByLabelText('Show only low stock items')).toBeInTheDocument()
    
    // Category select should be accessible
    const categorySelect = screen.getByDisplayValue('All Categories')
    expect(categorySelect).toHaveAttribute('name')
  })

  it('handles rapid filter changes correctly', async () => {
    const user = userEvent.setup()
    render(<SimpleInventoryFilters {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search inventory items...')
    
    // Simulate rapid typing
    await user.type(searchInput, 'ab')
    
    // Should call onSearchChange for each character
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('a')
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('ab')
  })
})
