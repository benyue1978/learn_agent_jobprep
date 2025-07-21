import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for different test environments */
  projects: [
    // 单元测试 - 完全Mock，快速执行
    {
      name: 'unit',
      testMatch: /.*-unit\.spec\.ts|.*-boundary\.spec\.ts|.*-format.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
    },

    // 集成测试 - Mock API响应
    {
      name: 'integration',
      testMatch: /.*-integration\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
    },

    // E2E测试 - Mock后端API
    {
      name: 'e2e-mock',
      testMatch: /.*-e2e\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
    },

    // E2E测试 - 真实后端API（可选）
    {
      name: 'e2e-real',
      testMatch: /.*-e2e\.spec\.ts/,
      grep: /@real-backend/,
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3000',
      },
      // 只在特定条件下运行
      retries: 1,
    },

    // 默认项目 - 所有测试
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // 其他浏览器测试（可选）
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },

  /* Global timeout settings */
  timeout: 60000, // 60 seconds for individual tests
  expect: {
    timeout: 10000, // 10 seconds for expect assertions
  },

  /* Test groups */
  grep: process.env.TEST_GROUP ? new RegExp(process.env.TEST_GROUP) : undefined,
}); 