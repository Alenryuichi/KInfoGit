import { createRequire } from "module";

const require = createRequire(import.meta.url);
const nextConfig = require("eslint-config-next");
const coreWebVitals = require("eslint-config-next/core-web-vitals");
const typescript = require("eslint-config-next/typescript");

const config = [
  ...nextConfig,
  ...coreWebVitals,
  ...typescript,
  // CommonJS 配置文件允许 require()
  {
    files: ["**/*.config.js", "**/*.config.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default config;
