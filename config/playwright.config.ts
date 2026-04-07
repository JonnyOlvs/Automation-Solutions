import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const env = (process.env.TEST_ENV ?? "qa").toLowerCase();
const baseURLs: Record<string, string> = {
  dev: process.env.BASE_URL_DEV ?? "https://www.automationexercise.com/",
  qa: process.env.BASE_URL_QA ?? "https://www.automationexercise.com/",
  prod: process.env.BASE_URL_PROD ?? "https://www.automationexercise.com/"
};

const baseURL = baseURLs[env] ?? "https://www.automationexercise.com/";
const retries = Number(process.env.RETRIES ?? (process.env.CI ? 2 : 1));
const timeout = Number(process.env.TIMEOUT ?? 30000);
const expectTimeout = Number(process.env.EXPECT_TIMEOUT ?? 10000);
const workers = process.env.CI ? 1 : Number(process.env.WORKERS ?? 2);
const headless = (process.env.HEADLESS ?? "true").toLowerCase() === "true";
const video = (process.env.VIDEO ?? "off") as "off" | "on" | "retain-on-failure";

export default defineConfig({
  testDir: "../src/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries,
  workers,
  timeout,
  expect: {
    timeout: expectTimeout
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: "../reports/playwright-report", open: "never" }],
    ["allure-playwright", { outputFolder: "allure-results", detail: true, suiteTitle: false }]
  ],
  outputDir: "../test-results",
  use: {
    baseURL,
    headless,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    }
  ]
});
