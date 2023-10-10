/** @type {import('jest').Config} */
module.exports = {
  collectCoverageFrom: ["src/**/*.js", "!src/api/local-storage-mock.js"],
  preset: "jest-preset-preact",
  resetMocks: true,
  restoreMocks: true,
  setupFiles: ["./jest.setup.js"],
  testEnvironment: "jsdom",
};
