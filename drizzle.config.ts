import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/drizzle/schema/tables.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo", // <--- very important
});
