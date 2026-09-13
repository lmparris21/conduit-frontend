import { test, expect } from "@playwright/test";

test.describe("Guest smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Home page loads", async ({ page }) => {
    await expect(page).toHaveURL("/");
  });
});
