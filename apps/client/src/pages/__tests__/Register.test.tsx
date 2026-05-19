import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signUp } from '@/lib/auth'
import { toast } from 'sonner'
import Register from '../Register'

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
    ...render(<Register />, { wrapper: MemoryRouter }),
  }
}

describe('Register', () => {
  it('renders name, email, password fields and submit button', () => {
    setup()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation error for name under 2 characters', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('Name'), 'A')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument()
  })

  it('shows validation error for invalid email format', async () => {
    const { user } = setup()
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    Object.defineProperty(emailInput, 'value', { writable: true, value: 'not-an-email' })
    fireEvent.change(emailInput)
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument()
  })

  it('shows validation error for password under 8 characters', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument()
  })

  it('calls signUp.email with correct values on valid submit', async () => {
    vi.mocked(signUp.email).mockResolvedValue({ data: null, error: null } as any)
    const { user } = setup()
    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() =>
      expect(signUp.email).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
      })
    )
  })

  it('calls toast.error when sign-up returns an error', async () => {
    vi.mocked(signUp.email).mockResolvedValue({
      data: null,
      error: { message: 'Email already in use' },
    } as any)
    const { user } = setup()
    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Email already in use')
    )
  })

  it('navigates to /dashboard on successful registration', async () => {
    vi.mocked(signUp.email).mockResolvedValue({ data: {}, error: null } as any)
    const { user } = setup()
    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    )
  })

  it('renders skeleton fields while isSubmitting is true', async () => {
    let resolve: (value: any) => void
    vi.mocked(signUp.email).mockReturnValue(new Promise(r => { resolve = r }))
    const { user } = setup()
    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => expect(screen.queryByLabelText('Name')).not.toBeInTheDocument())
    resolve!({ data: null, error: null })
  })
})
