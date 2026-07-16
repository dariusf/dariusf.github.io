import ssg from "./plugin/index.js";

export default {
  // static/ is served at the site root in dev; build.js copies it into _build/dist
  publicDir: "static",
  // disable Vite's SPA index.html handling; the plugin serves all pages
  appType: "custom",
  // rebuilds write to _build; without this Vite fires its own reload per file
  server: { watch: { ignored: ["**/_build/**"] } },
  plugins: [ssg()],
};
