import { test, expect } from "@playwright/test";

test.describe("Article publish", () => {
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
    await page.getByPlaceholder("Article Title").fill(title);
    await page.getByPlaceholder("What's this article about?").fill(description);
    await page.getByPlaceholder("Write your article (in markdown)").fill(body);
    await page.getByPlaceholder("Enter tags").fill(tag1);
    await page.getByPlaceholder("Enter tags").press("Enter");
    await page.getByPlaceholder("Enter tags").fill(tag2);
    await page.getByPlaceholder("Enter tags").press("Enter");
    await page.getByRole("button", { name: "Publish Article" }).click();

    await expect(page).toHaveURL(/\/article\//);
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
    await page.getByText("Global Feed").click();

    const articlePreview = page
      .getByTestId("article-preview")
      .filter({ hasText: title });
    await expect(articlePreview).toContainText(description);
    await expect(articlePreview).toContainText(tag1);
    await expect(articlePreview).toContainText(tag2);
  });

  test("A published tag can be removed before publishing and does not appear on the article", async ({
    page,
  }) => {
    const title = `Remove Tag Test ${Date.now()}`;
    const tag1 = "keeper";
    const tag2 = "removeme";

    await page.getByRole("link", { name: "New Article" }).click();
    await page.getByPlaceholder("Article Title").fill(title);
    await page
      .getByPlaceholder("What's this article about?")
      .fill("Description");
    await page
      .getByPlaceholder("Write your article (in markdown)")
      .fill("Body content");
    await page.getByPlaceholder("Enter tags").fill(tag1);
    await page.getByPlaceholder("Enter tags").press("Enter");
    await page.getByPlaceholder("Enter tags").fill(tag2);
    await page.getByPlaceholder("Enter tags").press("Enter");
    await page
      .getByTestId("tag-pill")
      .filter({ hasText: tag2 })
      .getByTestId("tag-remove-button")
      .click();
    await page.getByRole("button", { name: "Publish Article" }).click();

    await expect(page).toHaveURL(/\/article\//);
    await expect(page.getByTestId("article-tags")).toContainText(tag1);
    await expect(page.getByTestId("article-tags")).not.toContainText(tag2);
  });

  test("User sees validation errors when publishing a completely empty article", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "New Article" }).click();
    await page.getByRole("button", { name: "Publish Article" }).click();

    await expect(page).toHaveURL(/\/editor/);
    await expect(page.getByTestId("error-messages")).toContainText(
      "title can't be blank",
    );
  });
});
