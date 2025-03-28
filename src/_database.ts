import { env } from "@env";
import { SpotifyUsersTable } from "@modules/spotify/spotify-users/spotify-users.types";
import { UsersTable } from "@modules/users/users.types";
import SqliteDatabase from "better-sqlite3";
import { promises as fs } from "fs";
import {
  CamelCasePlugin,
  FileMigrationProvider,
  Kysely,
  Migrator,
  SqliteDialect,
} from "kysely";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const database = new Kysely<{
  spotifyUsers: SpotifyUsersTable;
  users: UsersTable;
}>({
  dialect: new SqliteDialect({
    database: async () => new SqliteDatabase(env.DATABASE_PATH),
  }),
  plugins: [new CamelCasePlugin()],
});

export const migrator = new Migrator({
  db: database,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "../src/database/migrations"),
  }),
});
