import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  reporter: "list",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
    },
  },
  use: {
    baseURL: "http://127.0.0.1:6007",
    browserName: "chromium",
    colorScheme: "light",
    deviceScaleFactor: 1,
    locale: "en-US",
    reducedMotion: "reduce",
    timezoneId: "UTC",
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command:
      "pnpm exec storybook dev --host 127.0.0.1 --port 6007 --exact-port --ci --quiet --no-version-updates",
    url: "http://127.0.0.1:6007",
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "ignore",
  },
});
