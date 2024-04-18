import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";

import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      alias: {
        "@/*": "./path/to/lib/*",
      },
      assets: "dist",
      pages: "dist",
      strict: true,
    }),
    paths: {
      base: "/ui",
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
