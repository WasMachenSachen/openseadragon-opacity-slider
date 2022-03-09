import { defineConfig } from "vite";
const path = require("path");

export default defineConfig({
  build: {
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "./src/plugin.js"),
      name: "openseadragon-opacity-slider",
      formats: ["umd"],
      fileName: (format) => "openseadragon-opacity-slider.min.js",
    },
  },
});
