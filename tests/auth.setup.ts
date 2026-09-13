import { test as setup } from "@playwright/test";

const userFile = "playwright-utils/.auth/user.json";

setup("authenticate as user", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByPlaceholder("Email").fill(process.env.USER_EMAIL!);
  await page.getByPlaceholder("Password").fill(process.env.USER_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/");
  await page.context().storageState({ path: userFile });
});
