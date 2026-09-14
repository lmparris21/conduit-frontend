import { type Page, expect } from "@playwright/test";

export class HomePage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto("/");
  }

  async openNewArticleEditor() {
    await this.page.getByRole("link", { name: "New Article" }).click();
    await expect(this.page).toHaveURL(/\/editor/);
  }

  async switchToGlobalFeed() {
    await this.page.getByText("Global Feed", { exact: true }).click();
    await expect(
      this.page.getByTestId("article-preview").first(),
    ).toBeVisible();
  }

  async openFirstArticleInGlobalFeed(): Promise<string> {
    await this.page.getByText("Global Feed", { exact: true }).click();
    const firstArticlePreview = this.page
      .getByTestId("article-preview")
      .first();
    await expect(
      firstArticlePreview.getByRole("heading", { level: 1 }),
    ).toBeVisible();
    const titleValue = await firstArticlePreview
      .getByRole("heading", { level: 1 })
      .textContent();
    await firstArticlePreview.getByText("Read more...").click();
    await expect(this.page).toHaveURL(/\/article\//);
    return titleValue!.trim();
  }

  async expectAuthenticatedNavVisible() {
    await expect(
      this.page
        .getByRole("navigation")
        .getByRole("link", { name: "New Article" }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("navigation").getByRole("link", { name: "Settings" }),
    ).toBeVisible();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL("/");
  }

  async expectArticleInGlobalFeed(
    title: string,
    description: string,
    tags: string[],
  ) {
    const articlePreview = this.page
      .getByTestId("article-preview")
      .filter({ hasText: title });
    await expect(articlePreview).toContainText(description);
    for (const tag of tags) {
      await expect(articlePreview).toContainText(tag);
    }
  }
}
