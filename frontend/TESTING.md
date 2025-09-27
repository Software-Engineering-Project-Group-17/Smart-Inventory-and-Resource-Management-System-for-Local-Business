# Testing Guide

This project uses **Vitest** and **React Testing Library** for testing.

## Setup

Testing dependencies are already installed:
- `vitest` - Fast test runner
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Additional matchers
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM environment for tests

## Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with UI (browser-based test runner)
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

## Test Structure

### Component Tests
Location: `src/app/**//__tests__/`

Example: Testing the SalesPage component
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import SalesPage from '@/app/(site)/sales/page'

describe('SalesPage', () => {
  it('renders correctly', () => {
    render(<SalesPage />)
    expect(screen.getByText('Point of Sale System')).toBeInTheDocument()
  })
})
```

### API Route Tests
Location: `src/app/api/**//__tests__/`

Example: Testing API endpoints
```typescript
import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/sales/route'

describe('/api/sales', () => {
  it('returns inventory data', async () => {
    const request = new NextRequest('http://localhost/api/sales?userEmail=test@example.com')
    const response = await GET(request)
    expect(response.status).toBe(200)
  })
})
```

### Utility Function Tests
Location: `src/lib/__tests__/`

Example: Testing utility functions
```typescript
import { describe, it, expect } from 'vitest'
import { calculateTotal } from '@/lib/utils'

describe('calculateTotal', () => {
  it('calculates correct total', () => {
    const items = [{ price: 10, quantity: 2 }]
    expect(calculateTotal(items)).toBe(20)
  })
})
```

## Testing Best Practices

### 1. Test Structure (AAA Pattern)
```typescript
it('should do something', () => {
  // Arrange - Set up test data and conditions
  const user = userEvent.setup()
  render(<Component />)
  
  // Act - Perform the action being tested
  await user.click(screen.getByRole('button'))
  
  // Assert - Verify the expected outcome
  expect(screen.getByText('Expected result')).toBeInTheDocument()
})
```

### 2. Mocking External Dependencies
```typescript
// Mock API calls
vi.mock('fetch', () => ({
  default: vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mocked' })
  }))
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}))
```

### 3. Testing User Interactions
```typescript
import userEvent from '@testing-library/user-event'

it('handles user input', async () => {
  const user = userEvent.setup()
  render(<SearchComponent />)
  
  const input = screen.getByPlaceholderText('Search...')
  await user.type(input, 'test query')
  
  expect(input).toHaveValue('test query')
})
```

### 4. Testing Async Operations
```typescript
import { waitFor } from '@testing-library/react'

it('loads data asynchronously', async () => {
  render(<AsyncComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded data')).toBeInTheDocument()
  })
})
```

### 5. Testing Error States
```typescript
it('displays error message on failure', async () => {
  // Mock failed API call
  global.fetch = vi.fn().mockRejectedValue(new Error('API Error'))
  
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('Error occurred')).toBeInTheDocument()
  })
})
```

## Common Testing Scenarios

### Testing Forms
```typescript
it('submits form with valid data', async () => {
  const user = userEvent.setup()
  const mockSubmit = vi.fn()
  
  render(<Form onSubmit={mockSubmit} />)
  
  await user.type(screen.getByLabelText('Name'), 'John Doe')
  await user.type(screen.getByLabelText('Email'), 'john@example.com')
  await user.click(screen.getByRole('button', { name: 'Submit' }))
  
  expect(mockSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com'
  })
})
```

### Testing State Changes
```typescript
it('updates state when button is clicked', async () => {
  const user = userEvent.setup()
  render(<Counter />)
  
  const button = screen.getByRole('button', { name: 'Increment' })
  const counter = screen.getByText('Count: 0')
  
  await user.click(button)
  
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### Testing API Integration
```typescript
it('fetches and displays data', async () => {
  const mockData = { items: [{ id: 1, name: 'Test Item' }] }
  
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData)
  })
  
  render(<DataList />)
  
  await waitFor(() => {
    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })
  
  expect(fetch).toHaveBeenCalledWith('/api/items')
})
```

## Configuration Files

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup (src/test/setup.ts)
- Configures testing environment
- Mocks Next.js router and navigation
- Sets up global mocks
- Imports jest-dom matchers

## Tips for Effective Testing

1. **Test behavior, not implementation** - Focus on what the user sees and does
2. **Use descriptive test names** - Make it clear what is being tested
3. **Keep tests isolated** - Each test should be independent
4. **Mock external dependencies** - Focus on testing your code, not third-party libraries
5. **Test edge cases** - Empty states, error conditions, boundary values
6. **Use data-testid sparingly** - Prefer accessible queries (role, label, text)

## Debugging Tests

```bash
# Run specific test file
pnpm test sales.test.tsx

# Run tests matching pattern
pnpm test --grep "should calculate total"

# Debug in VS Code
# Add breakpoints and run in debug mode
```

## Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
open coverage/index.html
```

The coverage report shows:
- Lines covered/missed
- Functions covered/missed
- Branches covered/missed
- Statements covered/missed
