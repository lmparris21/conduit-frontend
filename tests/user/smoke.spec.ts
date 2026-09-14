import { test } from "../../playwright-utils/fixtures";

test.describe("User smoke", () => {
  test("Authenticated session is active", async ({ pom }) => {
    await pom.homePage.open();
    await pom.homePage.expectAuthenticatedNavVisible();
  });
});
