import { type Page, expect } from "@playwright/test";

export class ArticlePage {
  constructor(private page: Page) {}

  async postComment(text: string) {
    await this.page.getByPlaceholder("Write a comment...").fill(text);
    const postResponse = this.page.waitForResponse(
      (resp) =>
        resp.url().includes("/comments") &&
        resp.request().method() === "POST" &&
        resp.ok(),
    );
    await this.page.getByRole("button", { name: "Post Comment" }).click();
    await postResponse;
    await expect(
      this.page.getByTestId("comment-card").filter({ hasText: text }),
    ).toBeVisible();
  }

  async deleteComment(text: string) {
    const deleteResponse = this.page.waitForResponse(
      (resp) =>
        resp.url().includes("/comments/") &&
        resp.request().method() === "DELETE",
    );
    await this.page
      .getByTestId("comment-card")
      .filter({ hasText: text })
      .getByTestId("comment-delete-button")
      .click();
    await deleteResponse;
  }

  async expectArticleTitle(title: string) {
    await expect(
      this.page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
  }

  async expectArticleBody(body: string) {
    await expect(this.page.getByTestId("article-body")).toContainText(body);
  }

  async expectTagsOnArticle(presentTags: string[], absentTags: string[] = []) {
    const tagsContainer = this.page.getByTestId("article-tags");
    for (const tag of presentTags) {
      await expect(tagsContainer).toContainText(tag);
    }
    for (const tag of absentTags) {
      await expect(tagsContainer).not.toContainText(tag);
    }
  }

  async expectEditArticleLinkVisible() {
    await expect(
      this.page.getByRole("link", { name: "Edit Article" }).first(),
    ).toBeVisible();
  }

  async expectCommentNotVisible(text: string) {
    await expect(
      this.page.getByTestId("comment-card").filter({ hasText: text }),
    ).not.toBeVisible();
  }
}
