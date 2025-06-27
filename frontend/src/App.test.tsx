import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // Just verify the app renders without throwing an error
    expect(document.body).toBeTruthy()
  })
  
  it('contains main navigation elements', () => {
    render(<App />)
    // Check if basic structure exists
    const mainElement = document.querySelector('main')
    expect(mainElement).toBeTruthy()
  })
}) 