module.exports = {
  root: true,
  env: { browser: true, node: true, es2022: true, jest: true },
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  overrides: [
    {
      files: ["app/src/**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescr
ipt-eslint/recommended"],
      rules: {}
    }
  ]
};
