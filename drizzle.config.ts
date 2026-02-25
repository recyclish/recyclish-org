import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  schemaFilter: ["public"],
  tablesFilter: [
    "shelters",
    "users",
    "facility_submissions",
    "user_favorites",
    "newsletter_subscribers",
    "facility_reports",
    "facility_reviews",
    "review_helpful_votes",
    "shelter_corrections"
  ],
});
