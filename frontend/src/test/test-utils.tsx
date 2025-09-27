import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { vi } from 'vitest'

// Mock auth context
const mockUserProfile = {
  email: 'test@example.com',
  name: 'Test User'
}

// Mock getUserProfile function
vi.mock('@/lib/auth', () => ({
  getUserProfile: () => mockUserProfile
}))

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    // Add any providers here if needed
    ...options,
  })
}

export * from '@testing-library/react'
export { customRender as render }
export { mockUserProfile }
