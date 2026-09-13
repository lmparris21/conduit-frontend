import { test as base, expect } from "@playwright/test";

type Fixtures = {
  // Add fixtures here as page objects and helpers are built.
};

export const test = base.extend<Fixtures>({});

export { expect };
