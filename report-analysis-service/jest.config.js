/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  // No transforms needed for plain JS
  transform: {},
  // optional: limit coverage to what you care about
  collectCoverage: true,
  collectCoverageFrom: ["utils/**/*.js", "controllers/**/*.js"],
  coverageDirectory: "coverage",
  // optional: be explicit about your test files
  testMatch: ["**/tests/**/*.test.js"],
};
