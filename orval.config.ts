import { defineConfig } from "orval"

// Generates a typed client from the backend's OpenAPI spec into src/api/generated/.
// Run `bun gen:api` with the backend running. Output is committed (build artifact).
export default defineConfig({
  strata: {
    input: process.env.STRATA_OPENAPI_URL ?? "http://localhost:8080/v3/api-docs",
    output: {
      mode: "tags-split",
      target: "src/api/generated",
      schemas: "src/api/generated/model",
      client: "axios-functions",
      clean: true,
      override: {
        mutator: {
          path: "src/api/axios-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
})
