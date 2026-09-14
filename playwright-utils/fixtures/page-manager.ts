import type { Page } from "@playwright/test";
import { HomePage } from "../pages/home-page";
import { EditorPage } from "../pages/editor-page";
import { ArticlePage } from "../pages/article-page";

export class PageManager {
  readonly homePage: HomePage;
  readonly editorPage: EditorPage;
  readonly articlePage: ArticlePage;

  constructor(page: Page) {
    this.homePage = new HomePage(page);
    this.editorPage = new EditorPage(page);
    this.articlePage = new ArticlePage(page);
  }
}
