import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
// import adapter from "@sveltejs/adapter-static";
import adapter from "@sveltejs/adapter-node";
import path from "path";

/** @type {import("@sveltejs/kit").Config} */
const config = {
  kit: {
    adapter: adapter({
      // alias: {
      //   "@/*": "./path/to/lib/*",
      // },
      // assets: "dist",
      // pages: "dist",
      // fallback: "index.html",
      // strict: true,
      out: 'build',
			precompress: true,
			envPrefix: ''
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
