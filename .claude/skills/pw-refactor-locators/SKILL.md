---
name: pw-refactor-locators
description: Refactor Playwright test locators that use CSS class names, XPath, or structural selectors into Playwright's recommended user-visible selectors or data-testid attributes. Inspects application source, replaces brittle locators, adds data-testid to source when needed, and verifies the test still passes.
---

Refactor existing Playwright test locators to follow the project's recommended locator strategy.

**Never skip `AskUserQuestion` steps in this skill, even if told to work autonomously.**

## Instructions

### 1. Ask which tests to refactor

Use the `AskUserQuestion` tool:

- Question: "Which tests should I refactor?"
- Header: "Refactor scope"
- Option 1: label "All tests", description "Refactor every spec file under `tests/`"
- Option 2: label "Specific test", description "I'll name the file or test title to refactor"

If the user picks "Specific test", ask for the file path or `test()` title to target. Confirm the resolved scope before proceeding.

### 2. Identify locators to fix

First determine where the locators live:

- **POM in use** — the spec imports a custom fixture (e.g. `pom`) instead of `test` directly from `@playwright/test`. Locators live in the page object files under `playwright-utils/pages/`. Read every page class that is exercised by the tests in scope — that is the real audit target, not the spec files.
- **No POM** — locators are inline in the spec files. Read those directly.

In whichever files contain the locators, collect every locator that should be replaced:

- `page.locator('.class-name')` — CSS class selectors
- `page.locator('div > span')`, `page.locator('nth-child')` — structural/path selectors
- `page.locator('[class*="..."]')` — attribute selectors on styling classes
- Any `page.locator(...)` expression that is not a stable HTML structural tag (`header`, `nav`, `footer`, `section`, `article`)
- `getByRole(...).first()` or `.nth()` without a parent scope — flag these for review; they often need a container scope via `data-testid`

For each target, note the file, element being targeted, and line number.

### 3. Inspect application source code

For each locator identified in step 2, read the Angular component source in `src/app/` that renders the element. Determine the best replacement using the locator priority from `playwright-scripting.md`:

`getByRole` > `getByLabel` > `getByText` > `getByPlaceholder` > `getByTestId` > CSS (structural tags only, never class names)

For each element, check in priority order:

- Can `getByRole` match it uniquely? Check the HTML tag, accessible name, and ARIA role.
- Can `getByLabel` or `getByText` or `getByPlaceholder` match it uniquely?
- Is a `data-testid` already on the element? Use `getByTestId`.
- No semantic hook exists → add `data-testid` to the component source, then use `getByTestId`.

**`data-testid` naming** — values must name the **element** (a noun), not a state or action. Use the form `<subject>-<descriptor>-<element>`:

```typescript
// BAD: names a state, not an element
data-testid="article-published"

// GOOD: names the element
data-testid="article-published-badge"
data-testid="comment-delete-button"
```

**Last resort — CSS constant:** Only when you cannot add `data-testid` (e.g. a third-party or generated component where source edits are impossible). Extract a constant in the test and add a comment explaining why a semantic locator is not possible. Name constants per `playwright-scripting.md` naming rules (descriptive, no abbreviations, element-type suffix for locator variables). This is the final option — exhaust all other approaches first.

```typescript
// CSS used: third-party avatar widget — data-testid cannot be added to rendered output
const authorAvatarImage = page.locator("app-user-avatar img.avatar");
```

### 4. Replace the locators

Apply the replacements identified in step 3. When POM is in use, edits go to the page object methods — not the spec files.

- **User-visible locator available** — replace inline in the page method (or spec if no POM). Do not extract into a constant unless the locator is used 3+ times, or is opaque and used 2+ times.
- **`data-testid` needed** — add the attribute to the Angular component source, then use `page.getByTestId('...')` in the page method (or spec).
- **CSS last resort** — extract a named constant per the naming rules above; add the explanatory comment.

After making all replacements, re-read the test file and inline any vertically-stacked expressions so each statement lives on a single line. Line length doesn't matter — judge structure visually.

### 5. Ask user to run or adjust

After editing, use the `AskUserQuestion` tool:

- Question: "Locators updated. What would you like to do next?"
- Header: "Next step"
- Option 1: label "Run the test", description "Execute the test and debug if it fails"
- Option 2: label "Something else", description "Tell me what you'd like to change"

If the user selects "Run the test", proceed to step 6. If "Something else", follow their instructions.

### 6. Run the test

Execute the refactored test(s) with tracing enabled and retries disabled:

```bash
npx playwright test <file-or-pattern> --trace on --retries 0
```

If the test **passes**, proceed to step 8.

If the test **fails**, proceed to step 7.

### 7. Debug using trace

#### 7.1 Read terminal output

Extract from the terminal output:

- The error message and assertion failure details
- The stack trace pointing to the failing line
- The trace zip file path (under `test-results/`)

If the trace path is not visible, find it:

```bash
find test-results -name "trace.zip" -newer /tmp/test-start-marker 2>/dev/null | head -5
```

#### 7.2 Analyze the trace with CLI

**Important:** Use `npx playwright trace` (CLI mode), NOT `npx playwright show-trace` (GUI — will block execution).

```bash
npx playwright trace open <path-to-trace.zip>
npx playwright trace actions
npx playwright trace action <number>
npx playwright trace snapshot <action-number> --name after
npx playwright trace requests
npx playwright trace errors
npx playwright trace close
```

#### 7.3 Apply the fix

Common locator-refactor failures and their fixes:

- **Element not found** — the locator text doesn't match source exactly; re-read the component and correct the locator
- **Multiple elements matched** — the locator isn't unique; scope it to a parent container or add `data-testid` to the container
- **`data-testid` missing** — attribute was not saved to the component file; verify the source edit and re-run
- **Wrong responsive variant** — the test viewport is Desktop Chrome; re-read the source for the desktop-visible element

If the failure is in the application (not the test), explain it to the user rather than guessing at a fix.

Repeat steps 6–7 until all tests pass.

### 8. Finalize

Use `AskUserQuestion`:

- Question: "Tests pass. Does the refactor look right?"
- Header: "Finalize"
- Option 1: label "Looks good", description "Remove comments and finalize"
- Option 2: label "Needs changes", description "Tell me what to adjust"

On **"Looks good"**: remove all inline `//` comments from the refactored test files (keep `test.describe` labels, test titles, and all executable code — only `//` comment lines go). Collapse blank lines between consecutive code lines inside test bodies; preserve a single blank line between top-level blocks (between `describe` and `test`, between sibling `test` blocks). Then proceed to step 9.

On **"Needs changes"**: apply the user's feedback, re-run the test (step 6), and loop.

### 9. Report and offer to commit

Print a summary table of all changes made:

| #   | File               | Old locator         | Replacement                           | Change type       |
| --- | ------------------ | ------------------- | ------------------------------------- | ----------------- |
| 1   | `smoke.spec.ts:12` | `.font-bold`        | `getByRole('heading', { name: '…' })` | user-visible      |
| 2   | `smoke.spec.ts:28` | `div > button`      | `getByTestId('submit-button')`        | data-testid added |
| 3   | `smoke.spec.ts:41` | `[class*="avatar"]` | `locator('img.avatar')` constant      | CSS last resort   |

End the table with totals: locators replaced, `data-testid` attributes added to source, CSS last-resort constants created.

Then use `AskUserQuestion`:

- Question: "Should I commit the changes?"
- Header: "Commit"
- Option 1: label "Yes, commit", description "Stage the changes and create a commit"
- Option 2: label "No", description "Skip the commit"

On **"Yes, commit"**: run `git status` and `git diff` to review what will be included, draft a concise commit message describing the refactor (e.g. `refactor(tests): replace CSS locators with user-visible selectors in smoke tests`), stage the relevant spec and source files, and commit. Match the repo's existing commit message style from `git log`.

On **"No"**: stop.
