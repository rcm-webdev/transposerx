import { test, expect } from '@playwright/test'

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('happy path: registers and lands on dashboard', async ({ page }) => {
    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill('newuser@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('duplicate email shows toast error', async ({ page, request }) => {
    await request.post('http://localhost:3000/api/auth/sign-up/email', {
      data: { name: 'Seed User', email: 'dupe@example.com', password: 'password123' },
      headers: { Origin: 'http://localhost:5173' },
    })
    await page.getByLabel('Name').fill('New User')
    await page.getByLabel('Email').fill('dupe@example.com')
    await page.getByLabel('Password').fill('password456')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.locator('[data-sonner-toast][data-type="error"]')).toBeVisible()
  })

  test('empty form shows validation errors', async ({ page }) => {
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })
})
