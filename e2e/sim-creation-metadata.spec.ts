import { test, expect } from '@playwright/test';

test.describe('Sim Creation with Multiple Metadata Fields', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('Sim System');
  });

  test('should display metadata input fields with add/remove functionality', async ({ page }) => {
    // Check that metadata section is present
    await expect(page.locator('text=Metadata (Optional)')).toBeVisible();
    
    // Check that initial metadata field is present
    await expect(page.locator('[data-testid="metadata-key-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="metadata-value-0"]')).toBeVisible();
    
    // Check that "Add Metadata Field" button is present
    const addButton = page.locator('[data-testid="add-metadata-field"]');
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveText('Add Metadata Field');
    
    // Add a second metadata field
    await addButton.click();
    await expect(page.locator('[data-testid="metadata-key-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="metadata-value-1"]')).toBeVisible();
    
    // Check that remove button appears for multiple fields
    await expect(page.locator('[data-testid="remove-metadata-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="remove-metadata-1"]')).toBeVisible();
  });

  test('should create sim with multiple metadata fields', async ({ page }) => {
    const logContent = 'Test sim with metadata fields';
    const metadata = [
      { key: 'character_name', value: 'Alice Johnson' },
      { key: 'occupation', value: 'Software Engineer' },
      { key: 'location', value: 'San Francisco, CA' }
    ];
    
    // Fill in log content
    await page.locator('#sim-log').fill(logContent);
    
    // Add additional metadata fields
    for (let i = 1; i < metadata.length; i++) {
      await page.locator('[data-testid="add-metadata-field"]').click();
    }
    
    // Fill in metadata fields
    for (let i = 0; i < metadata.length; i++) {
      await page.locator(`[data-testid="metadata-key-${i}"]`).fill(metadata[i].key);
      await page.locator(`[data-testid="metadata-value-${i}"]`).fill(metadata[i].value);
    }
    
    // Create the sim
    const createButton = page.locator('button:has-text("Create Sim")');
    await expect(createButton).toBeEnabled();
    await createButton.click();
    
    // Wait for creation to complete
    await expect(createButton).toHaveText('Create Sim');
    
    // Verify the sim appears in the list with metadata count
    await expect(page.locator('h2:has-text("Your Sims (1)")')).toBeVisible();
    
    // Check that metadata count is displayed
    const metadataCountIndicator = page.locator('[data-testid="metadata-count"]');
    await expect(metadataCountIndicator).toBeVisible();
    await expect(metadataCountIndicator).toHaveText('3 metadata fields');
    
    // Verify the sim content is displayed
    const simItem = page.locator('.border.border-gray-200.rounded-lg');
    await expect(simItem).toBeVisible();
    await expect(simItem).toContainText(logContent);
  });

  test('should enforce metadata key length limit via HTML maxlength', async ({ page }) => {
    // Verify that the HTML maxlength attribute prevents entering too many characters
    const keyInput = page.locator('[data-testid="metadata-key-0"]');
    await expect(keyInput).toHaveAttribute('maxlength', '100');
    
    // Try to type more than 100 characters - should be truncated
    const longKey = 'A'.repeat(150);
    await keyInput.fill(longKey);
    
    // Should only contain 100 characters
    await expect(keyInput).toHaveValue('A'.repeat(100));
  });

  test('should enforce metadata value length limit via HTML maxlength', async ({ page }) => {
    // Verify that the HTML maxlength attribute prevents entering too many characters
    const valueInput = page.locator('[data-testid="metadata-value-0"]');
    await expect(valueInput).toHaveAttribute('maxlength', '10000');
    
    // Try to type more than 10000 characters - should be truncated
    const longValue = 'B'.repeat(15000);
    await valueInput.fill(longValue);
    
    // Should only contain 10000 characters
    await expect(valueInput).toHaveValue('B'.repeat(10000));
  });

  test('should show character counters for metadata fields', async ({ page }) => {
    // Check initial character counters
    await expect(page.locator('text=0/100').first()).toBeVisible(); // Key counter
    await expect(page.locator('text=0/10,000').nth(1)).toBeVisible(); // Value counter (first one is for log)
    
    // Type in metadata fields and check counters update
    const testKey = 'test_key';
    const testValue = 'test value with more characters';
    
    await page.locator('[data-testid="metadata-key-0"]').fill(testKey);
    await page.locator('[data-testid="metadata-value-0"]').fill(testValue);
    
    // Check that counters update
    await expect(page.locator(`text=${testKey.length}/100`)).toBeVisible();
    await expect(page.locator(`text=${testValue.length}/10,000`)).toBeVisible();
  });

  test('should ignore empty metadata fields when creating sim', async ({ page }) => {
    const logContent = 'Test sim with mixed metadata fields';
    
    // Fill in log content
    await page.locator('#sim-log').fill(logContent);
    
    // Add multiple metadata fields but only fill some
    await page.locator('[data-testid="add-metadata-field"]').click();
    await page.locator('[data-testid="add-metadata-field"]').click();
    
    // Fill only some fields
    await page.locator('[data-testid="metadata-key-0"]').fill('filled_key');
    await page.locator('[data-testid="metadata-value-0"]').fill('filled_value');
    // Leave fields 1 and 2 empty
    
    // Create the sim
    const createButton = page.locator('button:has-text("Create Sim")');
    await expect(createButton).toBeEnabled();
    await createButton.click();
    
    // Wait for creation to complete
    await expect(createButton).toHaveText('Create Sim');
    
    // Should only count the filled metadata field
    const metadataCountIndicator = page.locator('[data-testid="metadata-count"]');
    await expect(metadataCountIndicator).toBeVisible();
    await expect(metadataCountIndicator).toHaveText('1 metadata field');
  });

  test('should remove metadata fields correctly', async ({ page }) => {
    // Add multiple metadata fields
    await page.locator('[data-testid="add-metadata-field"]').click();
    await page.locator('[data-testid="add-metadata-field"]').click();
    
    // Verify three fields exist
    await expect(page.locator('[data-testid="metadata-key-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="metadata-key-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="metadata-key-2"]')).toBeVisible();
    
    // Remove the middle field
    await page.locator('[data-testid="remove-metadata-1"]').click();
    
    // Verify only two fields remain
    await expect(page.locator('[data-testid="metadata-key-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="metadata-key-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="metadata-key-2"]')).not.toBeVisible();
  });

  test('should reset metadata fields after successful sim creation', async ({ page }) => {
    const logContent = 'Test sim field reset';
    
    // Fill in log and metadata
    await page.locator('#sim-log').fill(logContent);
    await page.locator('[data-testid="add-metadata-field"]').click();
    
    await page.locator('[data-testid="metadata-key-0"]').fill('test_key_1');
    await page.locator('[data-testid="metadata-value-0"]').fill('test_value_1');
    await page.locator('[data-testid="metadata-key-1"]').fill('test_key_2');
    await page.locator('[data-testid="metadata-value-1"]').fill('test_value_2');
    
    // Create the sim
    await page.locator('button:has-text("Create Sim")').click();
    
    // Wait for creation to complete
    await expect(page.locator('button:has-text("Create Sim")')).toHaveText('Create Sim');
    
    // Verify fields are reset - should only have one empty field
    await expect(page.locator('[data-testid="metadata-key-0"]')).toHaveValue('');
    await expect(page.locator('[data-testid="metadata-value-0"]')).toHaveValue('');
    await expect(page.locator('[data-testid="metadata-key-1"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="metadata-value-1"]')).not.toBeVisible();
  });

  test('should create multiple sims with different metadata configurations', async ({ page }) => {
    // Create first sim with 2 metadata fields
    await page.locator('#sim-log').fill('First sim with metadata');
    await page.locator('[data-testid="add-metadata-field"]').click();
    await page.locator('[data-testid="metadata-key-0"]').fill('key1');
    await page.locator('[data-testid="metadata-value-0"]').fill('value1');
    await page.locator('[data-testid="metadata-key-1"]').fill('key2');
    await page.locator('[data-testid="metadata-value-1"]').fill('value2');
    await page.locator('button:has-text("Create Sim")').click();
    await expect(page.locator('button:has-text("Create Sim")')).toHaveText('Create Sim');
    
    // Create second sim with no metadata
    await page.locator('#sim-log').fill('Second sim without metadata');
    await page.locator('button:has-text("Create Sim")').click();
    await expect(page.locator('button:has-text("Create Sim")')).toHaveText('Create Sim');
    
    // Create third sim with 1 metadata field
    await page.locator('#sim-log').fill('Third sim with one metadata');
    await page.locator('[data-testid="metadata-key-0"]').fill('single_key');
    await page.locator('[data-testid="metadata-value-0"]').fill('single_value');
    await page.locator('button:has-text("Create Sim")').click();
    await expect(page.locator('button:has-text("Create Sim")')).toHaveText('Create Sim');
    
    // Verify sim count
    await expect(page.locator('h2:has-text("Your Sims (3)")')).toBeVisible();
    
    // Verify metadata counts are displayed correctly
    const metadataCountIndicators = page.locator('[data-testid="metadata-count"]');
    await expect(metadataCountIndicators).toHaveCount(2); // Only sims with metadata show the indicator
    
    // Check the counts - should be 2 and 1 metadata fields
    await expect(metadataCountIndicators.first()).toHaveText('2 metadata fields');
    await expect(metadataCountIndicators.last()).toHaveText('1 metadata field');
  });
}); 