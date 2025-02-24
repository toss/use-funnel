import { expect, test } from '@playwright/test';

const PAGES_ROUTER_LOCAL_URL = 'http://localhost:3101/';

test('can move the steps of the funnel using history.push.', async ({ page }) => {
  await page.goto(PAGES_ROUTER_LOCAL_URL);

  await expect(page.getByText('start')).toBeVisible();

  await expect(page.getByRole('button', { name: 'next' })).toBeVisible();

  await page.getByRole('button', { name: 'next' }).click();

  await expect(page.getByText('end')).toBeVisible();

  await page.goBack();

  await expect(page.getByText('start')).toBeVisible();
});

test('can move the steps of the funnel using Link.', async ({ page }) => {
  await page.goto(PAGES_ROUTER_LOCAL_URL);

  await page.getByRole('link', { name: 'Go Home' }).click();

  await expect(page.getByText('Home')).toBeVisible();
});
