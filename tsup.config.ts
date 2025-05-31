import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  bundle: false,
  dts: true,
  format: "esm",
  outDir: "dist",
  target: "esnext",
  minify: false,
});
