import { type Page, expect } from "@playwright/test";

export class EditorPage {
  constructor(private page: Page) {}

  async fillArticleForm(title: string, description: string, body: string) {
    await this.page.getByPlaceholder("Article Title").fill(title);
    await this.page
      .getByPlaceholder("What's this article about?")
      .fill(description);
    await this.page
      .getByPlaceholder("Write your article (in markdown)")
      .fill(body);
  }

  async addTag(tag: string) {
    await this.page.getByPlaceholder("Enter tags").fill(tag);
    await this.page.getByPlaceholder("Enter tags").press("Enter");
  }

  async removeTag(tag: string) {
    await this.page
      .getByTestId("tag-pill")
      .filter({ hasText: tag })
      .getByTestId("tag-remove-button")
      .click();
  }

  async publishArticle() {
    await this.page.getByRole("button", { name: "Publish Article" }).click();
  }

  async expectValidationError(message: string) {
    await expect(this.page).toHaveURL(/\/editor/);
    await expect(this.page.getByTestId("error-messages")).toContainText(
      message,
    );
  }
}
