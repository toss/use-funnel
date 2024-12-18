import { test, expect } from '@playwright/test';

const APP_ROUTER_LOCAL_URL = 'http://localhost:3100/';

test('can move the steps of the funnel using history.push.', async ({ page }) => {
  await page.goto(APP_ROUTER_LOCAL_URL);

  await expect(page.getByText('start')).toBeVisible();

  await expect(page.getByRole('button', { name: 'next' })).toBeVisible();

  await page.getByRole('button', { name: 'next' }).click();

  await expect(page.getByText('end')).toBeVisible();

  await page.goBack();

  await expect(page.getByText('start')).toBeVisible();

  await page.getByRole('button', { name: 'navigate to overlay funnel' }).click();

  await expect(page.getByText(/Select Your School/)).toBeVisible();
  await page.getByRole('button', { name: /school next/ }).click();
  await expect(page.getByText(/overlay next/)).toBeVisible();
  await expect(page.getByText(/school next/)).toBeVisible();

  await page.click('input[type="date"]');
  await page.fill('input[type="date"]', '2024-01-01');
  await page.getByRole('button', { name: 'overlay next' }).click();
  await expect(page.getByText(/school: A/)).toBeVisible();
  await expect(page.getByText(/startDate: 2024-01-01/)).toBeVisible();
});
