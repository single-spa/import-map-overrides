/** @type {import('jest').Config} */
const config = {
  resetMocks: true,
  restoreMocks: true,
  setupFiles: ["./jest.setup.js"],
  testEnvironment: "jsdom",
  collectCoverageFrom: ["src/**/*.js", "!src/api/localStorageMock.js"],
};

module.exports = config;
