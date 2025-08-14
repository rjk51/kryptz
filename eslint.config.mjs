import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    },
    overrides: [
      {
        files: ["src/app/api/**/*.js", "src/app/api/**/*.ts"],
        rules: {
          "react-hooks/rules-of-hooks": "off",
          "react-hooks/exhaustive-deps": "off"
        }
      }
    ]
  }
];

export default eslintConfig;
