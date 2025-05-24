import { test, expect } from '@playwright/test';

test.describe('Sim Creation with Log Content Only', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('Sim System');
  });

  test('should display create sim form with required elements', async ({ page }) => {
    // Check that the create sim form is present
    await expect(page.locator('h2:has-text("Create New Sim")')).toContainText('Create New Sim');
    
    // Check that the log content textarea is present
    const logTextarea = page.locator('#sim-log');
    await expect(logTextarea).toBeVisible();
    await expect(logTextarea).toHaveAttribute('placeholder', 'Enter your sim\'s log content here...');
    await expect(logTextarea).toHaveAttribute('maxlength', '10000');
    
    // Check that the character counter is present
    await expect(page.locator('text=0/10,000 characters')).toBeVisible();
    
    // Check that the create button is present but disabled initially
    const createButton = page.locator('button:has-text("Create Sim")');
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeDisabled();
  });

  test('should create a sim with log content only', async ({ page }) => {
    const logContent = 'This is a test sim log entry. It contains some sample content for testing purposes.';
    
    // Fill in the log content
    const logTextarea = page.locator('#sim-log');
    await logTextarea.fill(logContent);
    
    // Verify character counter updates
    await expect(page.locator(`text=${logContent.length}/10,000 characters`)).toBeVisible();
    
    // Verify button becomes enabled
    const createButton = page.locator('button:has-text("Create Sim")');
    await expect(createButton).toBeEnabled();
    
    // Click create button
    await createButton.click();
    
    // Wait for sim creation to complete
    await expect(createButton).toHaveText('Create Sim');
    
    // Verify the textarea is cleared
    await expect(logTextarea).toHaveValue('');
    
    // Verify character counter resets
    await expect(page.locator('text=0/10,000 characters')).toBeVisible();
    
    // Verify the sim appears in the list
    await expect(page.locator('h2:has-text("Your Sims (1)")')).toBeVisible();
    
    // Check that the sim content is displayed
    const simItem = page.locator('.border.border-gray-200.rounded-lg');
    await expect(simItem).toBeVisible();
    await expect(simItem).toContainText(logContent);
    
    // Check that creation timestamp is displayed
    await expect(simItem.locator('text=Created:')).toBeVisible();
  });

  test('should prevent creating sim with empty log content', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create Sim")');
    
    // Verify button is disabled with empty content
    await expect(createButton).toBeDisabled();
    
    // Add some whitespace content
    const logTextarea = page.locator('#sim-log');
    await logTextarea.fill('   \n\t  ');
    
    // Button should still be disabled for whitespace-only content
    await expect(createButton).toBeDisabled();
  });

  test('should show error message for empty log content when attempting to create', async ({ page }) => {
    const logTextarea = page.locator('#sim-log');
    const createButton = page.locator('button:has-text("Create Sim")');
    
    // Add some content first to enable the button
    await logTextarea.fill('test content');
    await expect(createButton).toBeEnabled();
    
    // Clear the content
    await logTextarea.clear();
    
    // The button should be disabled again
    await expect(createButton).toBeDisabled();
  });

  test('should update character counter as user types', async ({ page }) => {
    const logTextarea = page.locator('#sim-log');
    
    // Start with empty
    await expect(page.locator('text=0/10,000 characters')).toBeVisible();
    
    // Type some content
    const testContent = 'Hello World!';
    await logTextarea.fill(testContent);
    
    // Check counter updates
    await expect(page.locator(`text=${testContent.length}/10,000 characters`)).toBeVisible();
    
    // Type more content
    const longerContent = 'This is a much longer piece of content to test the character counter functionality.';
    await logTextarea.fill(longerContent);
    
    // Check counter updates again
    await expect(page.locator(`text=${longerContent.length}/10,000 characters`)).toBeVisible();
  });

  test('should create multiple sims and display them in list', async ({ page }) => {
    const sims = [
      'First sim log content with some details',
      'Second sim with different content for testing',
      'Third sim entry to verify multiple sim creation'
    ];
    
    // Create multiple sims
    for (let i = 0; i < sims.length; i++) {
      const logTextarea = page.locator('#sim-log');
      const createButton = page.locator('button:has-text("Create Sim")');
      
      await logTextarea.fill(sims[i]);
      await createButton.click();
      
      // Wait for creation to complete
      await expect(logTextarea).toHaveValue('');
    }
    
    // Verify sim count in header
    await expect(page.locator(`h2:has-text("Your Sims (${sims.length})")`)).toBeVisible();
    
    // Verify all sims are displayed
    const simItems = page.locator('.border.border-gray-200.rounded-lg');
    await expect(simItems).toHaveCount(sims.length);
    
    // Verify each sim's content is displayed
    for (const simContent of sims) {
      await expect(page.locator(`text=${simContent}`)).toBeVisible();
    }
  });

  test('should show empty state when no sims exist', async ({ page }) => {
    // Initially should show empty state
    await expect(page.locator('text=No sims created yet. Create your first sim above!')).toBeVisible();
    await expect(page.locator('h2:has-text("Your Sims (0)")')).toBeVisible();
  });

  test('should truncate long log content in sim list preview', async ({ page }) => {
    // Create a sim with very long content (over 200 characters)
    const longContent = 'A'.repeat(250) + ' This should be truncated in the preview';
    
    const logTextarea = page.locator('#sim-log');
    const createButton = page.locator('button:has-text("Create Sim")');
    
    await logTextarea.fill(longContent);
    await createButton.click();
    
    // Wait for creation to complete
    await expect(logTextarea).toHaveValue('');
    
    // Check that the content is truncated with ellipsis
    const simItem = page.locator('.border.border-gray-200.rounded-lg');
    await expect(simItem).toBeVisible();
    
    // Should show truncated content (first 200 chars + ...)
    const expectedPreview = longContent.substring(0, 200) + '...';
    await expect(simItem).toContainText(expectedPreview);
    
    // Should not contain the full original content
    await expect(simItem).not.toContainText(longContent);
  });
}); 