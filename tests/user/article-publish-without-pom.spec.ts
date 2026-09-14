import { test, expect } from "@playwright/test";

test.describe("Article publish (without POM)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("User can publish an article with two tags and view it in the Global Feed", async ({
    page,
  }) => {
    const title = `Test Article ${Date.now()}`;
    const description = "Test article description for global feed";
    const body = "Test article body content";
    const tag1 = "automation";
    const tag2 = "testing";

    await page.getByRole("link", { name: "New Article" }).click();
    await expect(page).toHaveURL(/\/editor/);
    await page.getByPlaceholder("Article Title").fill(title);
    await page.getByPlaceholder("What's this article about?").fill(description);
    await page.getByPlaceholder("Write your article (in markdown)").fill(body);
    await page.getByPlaceholder("Enter tags").fill(tag1);
    await page.getByPlaceholder("Enter tags").press("Enter");
    await page.getByPlaceholder("Enter tags").fill(tag2);
    await page.getByPlaceholder("Enter tags").press("Enter");
    await page.getByRole("button", { name: "Publish Article" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    await expect(page.getByTestId("article-body")).toContainText(body);
    await expect(page.getByTestId("article-tags")).toContainText(tag1);
    await expect(page.getByTestId("article-tags")).toContainText(tag2);
    await expect(
      page.getByRole("link", { name: "Edit Article" }).first(),
    ).toBeVisible();
    await page.goto("/");
    await page.getByText("Global Feed", { exact: true }).click();
    const articlePreview = page
      .getByTestId("article-preview")
      .filter({ hasText: title });
    await expect(articlePreview).toContainText(description);
    await expect(articlePreview).toContainText(tag1);
    await expect(articlePreview).toContainText(tag2);
  });
});
