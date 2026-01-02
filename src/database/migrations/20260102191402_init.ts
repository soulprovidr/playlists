import {
  BuildCadence,
  BuildStatus,
  EntityType,
} from "@modules/playlist-configs/playlist-configs.types";
import { sql, type Kysely } from "kysely";
import * as databaseHelpers from "../database.helpers";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create spotify_access_tokens table
  await db.schema
    .createTable("spotify_access_tokens")
    .$call(databaseHelpers.withAutoIncrementingId)
    .addColumn("spotify_user_id", "varchar", (col) => col.notNull())
    .addColumn("access_token", "varchar")
    .addColumn("refresh_token", "varchar")
    .addColumn("expires_at", "varchar")
    .$call(databaseHelpers.withTimestamps)
    .execute();

  await db.schema
    .createIndex("spotify_access_tokens_spotify_user_id_index")
    .on("spotify_access_tokens")
    .columns(["spotify_user_id"])
    .execute();

  // Create playlist_configs table
  await db.schema
    .createTable("playlist_configs")
    .$call(databaseHelpers.withAutoIncrementingId)
    .addColumn("name", "varchar", (col) => col.notNull().defaultTo(""))
    .addColumn("spotify_playlist_id", "varchar")
    .addColumn("build_status", "varchar", (col) =>
      col.notNull().defaultTo(BuildStatus.UNSTARTED),
    )
    .addColumn("build_cadence", "varchar", (col) =>
      col.notNull().defaultTo(BuildCadence.NONE),
    )
    .addColumn("build_day", "varchar")
    .addColumn("last_built_date", "varchar")
    .addColumn("entity_type", "varchar", (col) =>
      col.notNull().defaultTo(EntityType.TRACKS),
    )
    .$call(databaseHelpers.withTimestamps)
    .execute();

  // Create trigger for updated_at on playlist_configs
  await sql`
    CREATE TRIGGER playlist_configs_updated_at_trigger
    AFTER UPDATE ON playlist_configs
    FOR EACH ROW
    BEGIN
      UPDATE playlist_configs
      SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db);

  // Create playlist_sources table
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
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop trigger
  await sql`DROP TRIGGER IF EXISTS playlist_configs_updated_at_trigger`.execute(
    db,
  );

  // Drop tables in reverse order of creation (respecting foreign key constraints)
  await db.schema.dropTable("playlist_sources").ifExists().execute();
  await db.schema.dropTable("playlist_configs").ifExists().execute();
  await db.schema.dropTable("spotify_access_tokens").ifExists().execute();
}
