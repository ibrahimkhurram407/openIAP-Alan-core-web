import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-static";
import path from "path";

/** @type {import("@sveltejs/kit").Config} */
const config = {
  kit: {
    adapter: adapter({
      alias: {
        "@/*": "./path/to/lib/*",
      },
      assets: "dist",
      pages: "dist",
      fallback: "index.html",
      strict: true,
    }),
    paths: {
      base: "/ui",
      relative: false
    },
  },

  vite: {
    resolve: {
      alias: {
        $lib: path.resolve("./src/lib"),
      },
    },
  },

  plugins: [],

  preprocess: [vitePreprocess({})],
};

export default config;
