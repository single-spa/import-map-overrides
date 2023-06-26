/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

module.exports = config;
