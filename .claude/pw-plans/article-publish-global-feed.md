# Coverage Plan: Publish an article and view it in the Global Feed

**Actor:** Standard authenticated user (tests land in the `user` Playwright project — `tests/user/`, which uses `playwright-utils/.auth/user.json` storageState and depends on `auth-setup`).
**Feature area:** Article authoring (Editor) → published article page → Home feeds (Your Feed / Global Feed).
**Primary goal:** A logged-in user creates and publishes an article with tags, is taken to the published article page, and can then find that article in the Global Feed.
**Suggested file:** `tests/user/article-publish.spec.ts` (**new**). A separate `tests/guest/editor-access.spec.ts` (**new**) holds the unauthenticated-access negative case.
**Existing related tests:** none — the only specs today are placeholder smoke tests (`tests/guest/smoke.spec.ts` "Home page loads", `tests/user/smoke.spec.ts` "Authenticated session is active"). This flow is greenfield.

## Assumptions

- The `user` storageState is valid at run time (auth.setup logs in with `USER_EMAIL`/`USER_PASSWORD` from `.env.test.local`). Tests start from `page.goto("/")` and navigate via the UI, per project convention.
- Article titles must be unique-ish only in practice; to avoid collisions across runs, each test generates a unique title (e.g. a timestamp suffix). Persisted articles are left on the shared Bondar API (no teardown) — acceptable for this practice target.
- "Global Feed" reliably contains a just-published article on page 1 (newest first). If the live feed paginates the new article off page 1, the feed assertion may need a tag-filter narrowing (noted as an open question).
- Field mapping (from source): title input `placeholder="Article Title"`, description `placeholder="What's this article about?"`, body `placeholder="Write your article (in markdown)"`, tags `placeholder="Enter tags"` (commit each tag with Enter — there is no add button), publish button `Publish Article`. Success navigates to `/article/:slug`.
- There is **no client-side validation**; the Publish button is never disabled by form state. Empty/invalid submits rely on the backend returning 422 and `ListErrors` rendering `<ul class="error-messages">` items like `title can't be blank`.

## Test cases

### Happy path

1. **User can publish an article with two tags and view it in the Global Feed** — the canonical parent scenario, end to end. _(P0)_

   - Pre: authenticated (user storageState); a unique title generated for this run.
   - Steps:
     - From home, click the header **New Article** link → lands on the editor.
     - Fill title, description ("about"), and body.
     - Type the first tag, press Enter; type the second tag, press Enter (two tag pills appear).
     - Click **Publish Article**.
     - Navigate to **Home**, then click the **Global Feed** tab.
   - Expect:
     - After publish, URL is `/article/<slug>` and the article page shows the title (`h1`), the body text, both tags, and the author meta.
     - On Home, the Global Feed list contains a preview whose title matches, and that preview shows the description and both tags.

2. **User can publish an article with no tags** — tags are optional; success path still reaches the article page. _(P1)_

   - Pre: authenticated; unique title.
   - Steps: New Article → fill title/description/body only → Publish.
   - Expect: redirected to `/article/<slug>`; title and body render; no tag pills in the article's tag list.

3. **Author sees Edit and Delete controls on their own published article** — ownership-conditioned UI on the success page. _(P1)_
   - Pre: authenticated; publish a fresh article (reuse case 1's create steps).
   - Steps: land on the published article page.
   - Expect: "Edit Article" and "Delete Article" controls are visible (not the Favorite/Follow buttons that non-authors see).

### Edge cases

4. **Entering the same tag twice yields a single tag pill** — client dedup in `addTag()` is silent. _(P2)_

   - Steps: in the editor, add a tag, press Enter, type the identical tag again, press Enter.
   - Expect: exactly one pill for that tag; after publish, the article shows that tag once.

5. **A tag typed but not committed with Enter is still saved on Publish** — `submitForm()` calls `addTag()` for the uncommitted field value. _(P1)_

   - Steps: fill title/description/body; type a tag into the tags input but do NOT press Enter; click Publish.
   - Expect: the published article page lists that tag.

6. **A published tag can be removed before publishing and does not appear on the article** — `removeTag` filters it out. _(P2)_

   - Steps: add two tags (Enter each), click the remove (x) icon on one pill, then Publish.
   - Expect: only the remaining tag appears on the published article page.

7. **Title with leading/trailing whitespace or unicode/special characters publishes and displays correctly** — input-boundary rendering. _(P2, ?)_
   - Steps: publish with a title containing unicode + trailing spaces.
   - Expect: article `h1` and the Global Feed preview show the title (confirm how the backend trims/normalizes — ?).

### Negative cases

8. **User sees a validation error when publishing with an empty title** — server-side 422 surfaced via `.error-messages`. _(P1)_

   - Steps: New Article → leave title empty, fill body → click Publish.
   - Expect: stays on the editor (URL still `/editor`), and an `.error-messages` item reads `title can't be blank`.

9. **User sees validation errors when publishing a completely empty article** — multiple server errors listed. _(P1)_

   - Steps: New Article → click Publish with all fields empty.
   - Expect: stays on the editor; `.error-messages` contains `title can't be blank` and `body can't be blank`.

10. **Unauthenticated user cannot open the article editor** — `/editor` is guarded by `isAuthenticated`; guests never see the New Article link. _(P2, ?)_
    - Pre: guest project (no storageState).
    - Steps: as a guest on Home, confirm the "New Article" link is absent; attempt to deep-link to `/editor`.
    - Expect: the editor form does not render (guard blocks activation). Confirm the exact observable end state — blank/blocked vs redirect — during authoring (?).

## Out of scope

- Markdown-to-HTML rendering correctness of the body (`MarkdownPipe`) — unit-test concern, no distinct E2E surface.
- The exact `POST /articles/` request/response body shape — service/interceptor unit concern, not observable UI behavior.
- Favorite/follow buttons, comments (add/delete), and the full Edit/Delete mutation flows — adjacent features, separate coverage.
- Feed pagination mechanics and the "Popular Tags" sidebar filtering — separate feed-focused plan.
- "Your Feed" contents for the author's own article — Your Feed shows followed authors; own articles may not appear there (see open questions), so it is not asserted here.

## Open questions

- Does a freshly published article reliably appear on **page 1** of the Global Feed (newest-first), or should the feed assertion narrow by a unique tag/title to stay stable? (case 1)
- For the guest editor-access case (10): what is the precise observable outcome — a redirect to `/login`/`/`, or the editor simply not rendering? Confirm during authoring.
- Title normalization (case 7): does the backend trim trailing whitespace / how are special characters echoed back on the article page and feed preview?
- Should each test clean up the articles it creates, or is leaving them on the shared practice API acceptable (no delete step)?
