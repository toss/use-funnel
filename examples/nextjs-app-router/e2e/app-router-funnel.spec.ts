import { expect, test } from '@playwright/test';

const APP_ROUTER_LOCAL_URL = 'http://localhost:3100/';

test('can move the steps of the funnel using history.push.', async ({ page }) => {
  await page.goto(APP_ROUTER_LOCAL_URL);

  await page.getByRole('link', { name: 'Go to Funnel' }).click();

  await expect(page.getByText('MAIN - START')).toBeVisible();
  await expect(page.getByText('Sub Start')).toBeVisible();

  await expect(page.getByRole('button', { name: 'next' })).toBeVisible();

  await page.getByRole('button', { name: 'next' }).click();

  await expect(page.getByText('Sub End')).toBeVisible();

  await page.getByRole('button', { name: 'next' }).click();

  await expect(page.getByText('MAIN - END')).toBeVisible();

  await page.goBack();

  await expect(page.getByText('Sub End')).toBeVisible();
});

test('can move the steps of the funnel using Link.', async ({ page }) => {
  await page.goto(APP_ROUTER_LOCAL_URL);

  await page.getByRole('link', { name: 'Go to Funnel' }).click();

  await expect(page.getByText('MAIN - START')).toBeVisible();
  await expect(page.getByText('Sub Start')).toBeVisible();

  await page.getByRole('link', { name: 'Home' }).click();

  await expect(page.getByRole('link', { name: 'Go to Funnel' })).toBeVisible();
});
