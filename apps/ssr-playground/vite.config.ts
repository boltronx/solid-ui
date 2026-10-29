import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  // ssr: the server entry compiles for the server, the client entry compiles hydratable.
  plugins: [solid({ ssr: true })]
});
