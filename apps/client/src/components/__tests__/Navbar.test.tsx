import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { Navbar } from '../Navbar'

vi.mock('@/lib/auth', () => ({
  signOut: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => vi.fn() }
})

describe('Navbar brand', () => {
  it('renders TransposerX as a link to /dashboard', () => {
    render(<Navbar />, { wrapper: MemoryRouter })
    const link = screen.getByRole('link', { name: /transposerx/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders Eye Clinic University subheadline inside the brand link', () => {
    render(<Navbar />, { wrapper: MemoryRouter })
    const link = screen.getByRole('link', { name: /transposerx/i })
    expect(link).toHaveTextContent('Eye Clinic University')
  })
})
