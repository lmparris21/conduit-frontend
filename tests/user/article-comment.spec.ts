import { test } from "../../playwright-utils/fixtures";

test.describe("Article comments", () => {
  test.beforeEach(async ({ pom }) => {
    await pom.homePage.open();
  });

  test("User can post a comment on an article and then delete it", async ({
    pom,
  }) => {
    const commentText = `Automated test comment ${Date.now()}`;
    const articleTitle = await pom.homePage.openFirstArticleInGlobalFeed();
    await pom.articlePage.expectArticleTitle(articleTitle);
    await pom.articlePage.postComment(commentText);
    await pom.articlePage.deleteComment(commentText);
    await pom.articlePage.expectCommentNotVisible(commentText);
  });
});
