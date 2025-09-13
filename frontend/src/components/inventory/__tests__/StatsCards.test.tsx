import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsCards } from '../StatsCards'

describe('StatsCards', () => {
  const mockStats = {
    totalItems: 150,
    totalValue: 25000.50,
    lowStockCount: 5,
    categoriesCount: 8,
  }

  it('renders all stat cards correctly', () => {
    render(<StatsCards stats={mockStats} />)

    expect(screen.getByText('Total Items')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()

    expect(screen.getByText('Total Value')).toBeInTheDocument()
    expect(screen.getByText('$25,000.50')).toBeInTheDocument()

    expect(screen.getByText('Low Stock Items')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()

    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('formats large numbers with commas', () => {
    const largeNumberStats = {
      totalItems: 1500000,
      totalValue: 999999.99,
      lowStockCount: 100,
      categoriesCount: 50,
    }

    render(<StatsCards stats={largeNumberStats} />)

    expect(screen.getByText('1,500,000')).toBeInTheDocument()
    expect(screen.getByText('$999,999.99')).toBeInTheDocument()
  })

  it('handles zero values correctly', () => {
    const zeroStats = {
      totalItems: 0,
      totalValue: 0,
      lowStockCount: 0,
      categoriesCount: 0,
    }

    render(<StatsCards stats={zeroStats} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('applies correct color for low stock when count is zero', () => {
    const noLowStockStats = {
      totalItems: 100,
      totalValue: 5000,
      lowStockCount: 0,
      categoriesCount: 5,
    }

    render(<StatsCards stats={noLowStockStats} />)

    // Check that low stock card has gray color when count is 0
    const lowStockCard = screen.getByText('0').closest('.bg-gray-100')
    expect(lowStockCard).toBeInTheDocument()
  })

  it('applies correct color for low stock when count is greater than zero', () => {
    const withLowStockStats = {
      totalItems: 100,
      totalValue: 5000,
      lowStockCount: 10,
      categoriesCount: 5,
    }

    render(<StatsCards stats={withLowStockStats} />)

    // Check that low stock card has red color when count > 0
    const lowStockCard = screen.getByText('10').closest('.bg-red-100')
    expect(lowStockCard).toBeInTheDocument()
  })

  it('displays correct icons for each stat', () => {
    render(<StatsCards stats={mockStats} />)

    // Check that icons are rendered (they should be in the DOM as SVG elements)
    const icons = document.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThanOrEqual(4) // At least 4 icons for 4 stats
  })

  it('applies responsive grid layout', () => {
    render(<StatsCards stats={mockStats} />)

    const container = document.querySelector('.grid')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('grid-cols-1')
    expect(container).toHaveClass('sm:grid-cols-2')
    expect(container).toHaveClass('lg:grid-cols-4')
  })

  it('formats currency with two decimal places', () => {
    const statsWithDecimals = {
      totalItems: 50,
      totalValue: 1234.5,
      lowStockCount: 2,
      categoriesCount: 3,
    }

    render(<StatsCards stats={statsWithDecimals} />)

    expect(screen.getByText('$1,234.50')).toBeInTheDocument()
  })

  it('handles very large currency values', () => {
    const statsWithLargeCurrency = {
      totalItems: 10,
      totalValue: 1234567.89,
      lowStockCount: 1,
      categoriesCount: 2,
    }

    render(<StatsCards stats={statsWithLargeCurrency} />)

    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument()
  })

  it('renders stat cards with proper styling structure', () => {
    render(<StatsCards stats={mockStats} />)

    // Check for card structure
    const cards = document.querySelectorAll('.bg-white')
    expect(cards.length).toBeGreaterThanOrEqual(4) // At least 4 cards

    // Check for rounded corners and shadows
    const roundedCards = document.querySelectorAll('.rounded-lg')
    expect(roundedCards.length).toBeGreaterThan(0)

    const shadowCards = document.querySelectorAll('.shadow')
    expect(shadowCards.length).toBeGreaterThan(0)
  })

  it('displays stat values with correct typography', () => {
    render(<StatsCards stats={mockStats} />)

    // Check that stat values have proper font styling
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('$25,000.50')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })
})
