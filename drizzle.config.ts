import { defineConfig } from "drizzle-kit";
import { fileURLToPath } from 'url';
import path from 'path';

const dbDirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(dbDirname, 'data');

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${path.join(dataDir, 'shelly-smart-home.db')}`,
  },
});
