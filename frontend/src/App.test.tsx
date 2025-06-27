import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock axios to prevent real API calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  }
}))

// Mock react-router-dom to avoid routing complexity
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }: { element: React.ReactNode }) => <div data-testid="route">{element}</div>,
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}))

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
    expect(container.firstChild).toBeTruthy()
  })
  
  it('contains router elements', () => {
    const { getByTestId } = render(<App />)
    expect(getByTestId('router')).toBeTruthy()
  })
}) 