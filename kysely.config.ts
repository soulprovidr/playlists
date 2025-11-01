import SqliteDatabase from "better-sqlite3";
import { CamelCasePlugin, ParseJSONResultsPlugin, SqliteDialect } from "kysely";
import { defineConfig, getKnexTimestampPrefix } from "kysely-ctl";

export const dialect = new SqliteDialect({
  database: async () => new SqliteDatabase(process.env.DATABASE_PATH as string),
});

export const plugins = [new CamelCasePlugin(), new ParseJSONResultsPlugin()];

export default defineConfig({
  dialect,
  plugins,
  migrations: {
    getMigrationPrefix: getKnexTimestampPrefix,
    migrationFolder: "src/database/migrations",
  },
  seeds: {
    getSeedPrefix: getKnexTimestampPrefix,
    seedFolder: "src/database/seeds",
  },
});
