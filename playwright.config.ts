import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

const testEnv = process.env.TEST_ENV ?? "local";
process.env.TEST_ENV = testEnv;
dotenv.config({ path: `.env.test.${testEnv}`, quiet: true });

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [["html", { open: "never" }], ["github"]]
    : [["html", { open: "never" }]],
  timeout: 60000,
  expect: { timeout: 10000 },
  use: {
    baseURL: process.env.BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "auth-setup",
      testMatch: "auth.setup.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "guest",
      testDir: "./tests/guest",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "user",
      testDir: "./tests/user",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright-utils/.auth/user.json",
      },
      dependencies: ["auth-setup"],
    },
  ],
});
