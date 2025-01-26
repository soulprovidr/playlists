import { env } from "@env";
import SqliteDatabase from "better-sqlite3";
import { promises as fs } from "fs";
import { FileMigrationProvider, Kysely, Migrator, SqliteDialect } from "kysely";
import * as path from "path";
import { fileURLToPath } from "url";
import { Database } from "./database/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const database = new Kysely<Database>({
  dialect: new SqliteDialect({
    database: async () => new SqliteDatabase(env.DB_FILENAME),
  }),
});

export const migrator = new Migrator({
  db: database,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "../src/database/migrations"),
  }),
});
