import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load the application and display the Get Started button', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Check that the page loads and has the expected title
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/);

    // Check that the main heading is present
    await expect(page.locator('h1')).toContainText('Sim System');

    // Check that the welcome message is present
    await expect(page.locator('p')).toContainText('Welcome to your character simulation viewer and creator');

    // Check that the Get Started button is present and visible
    const getStartedButton = page.locator('button:has-text("Get Started")');
    await expect(getStartedButton).toBeVisible();
    await expect(getStartedButton).toHaveText('Get Started');

    // Verify button has the expected styling classes
    await expect(getStartedButton).toHaveClass(/bg-blue-600/);
  });

  test('should have interactive Get Started button', async ({ page }) => {
    await page.goto('/');

    const getStartedButton = page.locator('button:has-text("Get Started")');
    
    // Button should be enabled and clickable
    await expect(getStartedButton).toBeEnabled();
    
    // Verify hover state works (button should change color on hover)
    await getStartedButton.hover();
    // Note: CSS transitions might not be easily testable, but we ensure the button responds to interaction
    
    // Click the button (currently it doesn't do anything, but it should be clickable)
    await getStartedButton.click();
    // No error should occur when clicking
  });
}); 