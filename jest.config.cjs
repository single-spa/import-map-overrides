/** @type {import('jest').Config} */
const config = {
  resetMocks: true,
  restoreMocks: true,
  setupFiles: ["./jest.setup.js"],
  testEnvironment: "jsdom",
};

module.exports = config;
