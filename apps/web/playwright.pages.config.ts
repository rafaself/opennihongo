import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/pages",
  outputDir: "test-results-pages",
  use: {
    baseURL: "http://127.0.0.1:4175/opennihongo/",
    headless: true,
  },
  webServer: {
    command:
      "pnpm exec vite preview --host 127.0.0.1 --port 4175 --strictPort --base=/opennihongo/",
    url: "http://127.0.0.1:4175/opennihongo/",
    reuseExistingServer: false,
  },
});
