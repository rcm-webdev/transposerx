import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signIn } from '@/lib/auth'
import { toast } from 'sonner'
import Login from '../Login'

const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => ({
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  useSession: vi.fn(() => ({ data: null, isPending: false })),
  signOut: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function setup() {
  return {
    user: userEvent.setup(),
    ...render(<Login />, { wrapper: MemoryRouter }),
  }
}

describe('Login', () => {
  it('renders email, password fields and submit button', () => {
    setup()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error for empty email on submit', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
  })

  it('shows validation error for invalid email format', async () => {
    const { user } = setup()
    // jsdom sanitizes type="email" inputs: element.value returns "" for invalid emails.
    // Override the value property to bypass this, then fire a synthetic change event so
    // react-hook-form reads the invalid value from event.target.value.
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    Object.defineProperty(emailInput, 'value', { writable: true, value: 'not-an-email' })
    fireEvent.change(emailInput)
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument()
  })

  it('shows validation error for password under 8 characters', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument()
  })

  it('calls signIn.email with correct values on valid submit', async () => {
    vi.mocked(signIn.email).mockResolvedValue({ data: null, error: null } as any)
    const { user } = setup()
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() =>
      expect(signIn.email).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      })
    )
  })

  it('calls toast.error when sign-in returns an error', async () => {
    vi.mocked(signIn.email).mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    } as any)
    const { user } = setup()
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    )
  })

  it('navigates to /dashboard on successful sign-in', async () => {
    vi.mocked(signIn.email).mockResolvedValue({ data: {}, error: null } as any)
    const { user } = setup()
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    )
  })
})
