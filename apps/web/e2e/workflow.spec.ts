import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('SoloMedia Core Workflows', () => {

    // Test 1: Verify Audience Page Charts
    test('Audience Page - Charts Render', async ({ page }) => {
        await page.goto(`${BASE_URL}/audience`);
        // Wait for charts to render (recharts use responsive container classes)
        await expect(page.locator('.recharts-responsive-container').first()).toBeVisible({ timeout: 10000 });
        console.log('✅ Audience page charts rendered successfully');
    });

    // Test 2: Verify Automation Rules Toggle
    test('Automation Page - Interface Interaction', async ({ page }) => {
        await page.goto(`${BASE_URL}/automation`);
        await expect(page.getByText('自动化工作流')).toBeVisible();

        // Wait for API data to populate
        await page.waitForTimeout(2000);

        // Find the first switch
        const switchEl = page.locator('button[role="switch"]').first();
        await expect(switchEl).toBeVisible();

        const initialState = await switchEl.getAttribute('aria-checked');
        console.log(`Initial Switch State: ${initialState}`);

        // Click to toggle
        await switchEl.click();
        await page.waitForTimeout(1000); // Wait for API response/Toast

        const newState = await switchEl.getAttribute('aria-checked');
        console.log(`New Switch State: ${newState}`);

        expect(newState).not.toBe(initialState);
        console.log('✅ Automation rule toggle worked');
    });

    // Test 3: Verify Schedule Publish Flow
    test('Content Creation - Schedule Dialog', async ({ page }) => {
        await page.goto(`${BASE_URL}/content/create`);

        // Fill required title
        await page.getByPlaceholder('输入标题或选题...').fill('Playwright Test Post');

        // Click Schedule Button (Look by icon or text)
        // The button has text "定时发布"
        await page.getByRole('button', { name: '定时发布' }).click();

        // Expect Dialog to open
        await expect(page.getByText('选择发布时间')).toBeVisible();
        console.log('✅ Schedule dialog opened successfully');
    });

});
