import { test, expect } from "@playwright/test";

test.describe("User smoke", () => {
  test("Authenticated session is active", async ({ page }) => {
    await page.goto("/");
    // TODO: replace with a real authenticated-only assertion
    // (e.g. expect(page.getByRole('link', { name: 'Settings' })).toBeVisible())
  });
});
