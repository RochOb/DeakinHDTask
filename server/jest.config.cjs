/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).[tj]s"],
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "js", "json"]
};
