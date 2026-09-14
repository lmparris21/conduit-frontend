import { test, expect } from "../../playwright-utils/fixtures";

test.describe("Guest smoke", () => {
  test.beforeEach(async ({ pom }) => {
    await pom.homePage.open();
  });

  test("Home page loads", async ({ pom }) => {
    await pom.homePage.expectLoaded();
  });

  test("Home page displays tagline", async ({ page }) => {
    await expect(
      page.getByText("A place to share your knowledge."),
    ).toBeVisible();
  });
});
