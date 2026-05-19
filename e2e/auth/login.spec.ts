import { test, expect } from '@playwright/test'

const TEST_USER = {
  name: 'Login Test User',
  email: 'logintest@example.com',
  password: 'password123',
}

test.describe('Login', () => {
  test.beforeAll(async ({ request }) => {
    await request.post('http://localhost:3000/api/auth/sign-up/email', {
      data: TEST_USER,
      headers: { Origin: 'http://localhost:5173' },
    })
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('happy path: valid credentials land on dashboard', async ({ page }) => {
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill(TEST_USER.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('wrong credentials shows toast error', async ({ page }) => {
    await page.getByLabel('Email').fill(TEST_USER.email)
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid|incorrect|credentials/i)).toBeVisible()
  })

  test('empty form shows validation errors', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })
})

test('unauthenticated navigation to /dashboard redirects to /login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/login')
})
