/** @type {import('jest').Config} */
module.exports = {
  collectCoverageFrom: ["src/**/*.js", "!src/api/local-storage-mock.js"],
  resetMocks: true,
  restoreMocks: true,
  setupFiles: ["./jest.setup.js"],
  testEnvironment: "jsdom",
};
