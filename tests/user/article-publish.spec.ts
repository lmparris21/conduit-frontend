import { test } from "../../playwright-utils/fixtures";

test.describe("Article publish", () => {
  test.beforeEach(async ({ pom }) => {
    await pom.homePage.open();
  });

  test("User can publish an article with two tags and view it in the Global Feed", async ({
    pom,
  }) => {
    const title = `Test Article ${Date.now()}`;
    const description = "Test article description for global feed";
    const body = "Test article body content";
    const tag1 = "automation";
    const tag2 = "testing";

    await pom.homePage.openNewArticleEditor();
    await pom.editorPage.fillArticleForm(title, description, body);
    await pom.editorPage.addTag(tag1);
    await pom.editorPage.addTag(tag2);
    await pom.editorPage.publishArticle();
    await pom.articlePage.expectArticleTitle(title);
    await pom.articlePage.expectArticleBody(body);
    await pom.articlePage.expectTagsOnArticle([tag1, tag2]);
    await pom.articlePage.expectEditArticleLinkVisible();
    await pom.homePage.open();
    await pom.homePage.switchToGlobalFeed();
    await pom.homePage.expectArticleInGlobalFeed(title, description, [
      tag1,
      tag2,
    ]);
  });

  test("A published tag can be removed before publishing and does not appear on the article", async ({
    pom,
  }) => {
    const title = `Remove Tag Test ${Date.now()}`;
    const tag1 = "keeper";
    const tag2 = "removeme";

    await pom.homePage.openNewArticleEditor();
    await pom.editorPage.fillArticleForm(title, "Description", "Body content");
    await pom.editorPage.addTag(tag1);
    await pom.editorPage.addTag(tag2);
    await pom.editorPage.removeTag(tag2);
    await pom.editorPage.publishArticle();
    await pom.articlePage.expectTagsOnArticle([tag1], [tag2]);
  });

  test("User sees validation errors when publishing a completely empty article", async ({
    pom,
  }) => {
    await pom.homePage.openNewArticleEditor();
    await pom.editorPage.publishArticle();
    await pom.editorPage.expectValidationError("title can't be blank");
  });
});
