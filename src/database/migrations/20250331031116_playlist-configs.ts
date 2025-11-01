import type { Kysely } from "kysely";
import * as databaseHelpers from "../database.helpers";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("playlist_configs")
    .$call(databaseHelpers.withAutoIncrementingId)
    .addColumn("user_id", "integer", (col) =>
      col.references("users.id").notNull(),
    )
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("description", "varchar")
    .addColumn("spotify_playlist_id", "varchar")
    .$call(databaseHelpers.withTimestamps)
    .execute();

  await db.schema
    .createIndex("playlist_configs_user_id_index")
    .on("playlist_configs")
    .columns(["user_id"])
    .execute();

  await db.schema
    .createTable("playlist_sources")
    .$call(databaseHelpers.withAutoIncrementingId)
    .addColumn("playlist_config_id", "integer", (col) =>
      col.references("playlist_configs.id").notNull(),
    )
    .addColumn("type", "varchar", (col) => col.notNull())
    .addColumn("config", "json", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("playlist_sources_playlist_config_id_index")
    .on("playlist_sources")
    .columns(["playlist_config_id"])
    .execute();

  await db.schema
    .createTable("playlist_source_templates")
    .$call(databaseHelpers.withAutoIncrementingId)
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("description", "varchar")
    .addColumn("type", "varchar", (col) => col.notNull())
    .addColumn("site_url", "varchar")
    .addColumn("config", "json", (col) => col.notNull())
    .execute();
}
