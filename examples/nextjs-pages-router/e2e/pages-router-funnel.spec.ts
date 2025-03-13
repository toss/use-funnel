import { expect, test } from '@playwright/test';

const PAGES_ROUTER_LOCAL_URL = 'http://localhost:3101/';

test('can move the steps of the funnel using history.push.', async ({ page }) => {
  await page.goto(PAGES_ROUTER_LOCAL_URL);

  // start
  await expect(page.getByRole('heading', { name: 'start' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'next' })).toBeVisible();

  await page.getByRole('button', { name: 'next' }).click();

  // middle
  await expect(page.getByRole('heading', { name: 'sub start' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'next' })).toBeVisible();

  await page.getByRole('button', { name: 'next' }).click();

  await expect(page.getByRole('heading', { name: 'sub end' })).toBeVisible();

  await page.getByRole('button', { name: 'next' }).click();

  // end
  await expect(page.getByRole('heading', { name: 'end' })).toBeVisible();

  await page.goBack();

  await expect(page.getByRole('heading', { name: 'sub end' })).toBeVisible();
});

test('can move the steps of the funnel using Link.', async ({ page }) => {
  await page.goto(PAGES_ROUTER_LOCAL_URL);

  await page.getByRole('link', { name: 'Go Home' }).click();

  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();

  await page.goBack();

  await expect(page.getByRole('heading', { name: 'start' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'next' })).toBeVisible();

  await page.getByRole('button', { name: 'next' }).click();

  // middle
  await expect(page.getByRole('heading', { name: 'sub start' })).toBeVisible();
});
