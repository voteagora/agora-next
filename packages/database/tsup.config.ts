import { defineConfig } from "tsup"

const isProduction = process.env.NEXT_PUBLIC_ENV === "prod"

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  minify: isProduction,
  sourcemap: true
})
