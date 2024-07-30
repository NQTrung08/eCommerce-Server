import globals from "globals";
import pluginJs from "@eslint/js";

export default {
  files: ["**/*.js"], // Áp dụng cho tất cả các file .js
  languageOptions: {
    sourceType: "commonjs",
    globals: globals.node // Đảm bảo các biến toàn cục của Node.js được nhận diện
  },
  rules: {
    // Quy tắc cơ bản
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": "warn",
    "no-debugger": "warn",
    "eqeqeq": ["error", "always"],
    "semi": ["error", "always"],
    "quotes": ["error", "single"]
  },
  // Nếu bạn chỉ muốn cấu hình một phần của cấu hình recommended, bạn có thể chọn
  extends: [
    pluginJs.configs.recommended
  ],
};
