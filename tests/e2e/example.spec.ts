import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  // Wait for the main heading to ensure page is loaded
  await expect(page.getByRole('heading', { name: /Web3 Tutoring Platform/i })).toBeVisible();
  // Check for TUNA branding in navbar or title
  await expect(page.locator('text=TUNA').first()).toBeVisible();
});

test('can navigate to register page', async ({ page }) => {
  await page.goto('/');
  // Wait for page to load
  await expect(page.getByRole('heading', { name: /Web3 Tutoring Platform/i })).toBeVisible();
  // Click "Get Started" button - it's in the hero section
  await page.getByRole('link', { name: /Get Started/i }).first().click();
  await expect(page).toHaveURL(/.*register/);
});

test('can navigate to login page', async ({ page }) => {
  await page.goto('/');
  // Wait for page to load
  await expect(page.getByRole('heading', { name: /Web3 Tutoring Platform/i })).toBeVisible();
  // Click "Sign In" button in the navbar
  await page.getByRole('link', { name: /Sign In/i }).click();
  await expect(page).toHaveURL(/.*login/);
});

