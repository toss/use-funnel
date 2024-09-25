import { test, expect } from '@playwright/test';

const APP_ROUTER_LOCAL_URL = 'http://localhost:3100/';

test('can move the steps of the funnel using history.push.', async ({ page }) => {
  await page.goto(APP_ROUTER_LOCAL_URL);

  await expect(page.getByText('start')).toBeVisible();

  await expect(page.getByRole('button', { name: 'next' })).toBeVisible();

  await page.getByRole('button', { name: 'next' }).click();

  await expect(page.getByText('end')).toBeVisible();
});
