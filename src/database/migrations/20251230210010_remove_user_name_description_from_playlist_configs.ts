import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
  // 1. Create new table without the columns
  // 2. Copy data
  // 3. Drop old table
  // 4. Rename new table

  await db.schema
    .createTable("playlist_configs_new")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("spotify_playlist_id", "varchar")
    .addColumn("build_status", "varchar", (col) => col.defaultTo("UNSTARTED"))
    .addColumn("build_cadence", "varchar", (col) => col.defaultTo("NONE"))
    .addColumn("build_day", "varchar")
    .addColumn("last_built_date", "varchar")
    .addColumn("entity_type", "varchar", (col) => col.defaultTo("TRACKS"))
    .addColumn("created_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .addColumn("updated_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .execute();

  // Copy data from old table to new table (excluding user_id, description)
  await sql`
    INSERT INTO playlist_configs_new (
      id,
      name,
      spotify_playlist_id,
      build_status,
      build_cadence,
      build_day,
      last_built_date,
      entity_type,
      created_at,
      updated_at
    )
    SELECT
      id,
      name,
      spotify_playlist_id,
      build_status,
      build_cadence,
      build_day,
      last_built_date,
      entity_type,
      created_at,
      updated_at
    FROM playlist_configs
  `.execute(db);

  // Drop old table
  await db.schema.dropTable("playlist_configs").execute();

  // Rename new table to original name
  await db.schema
    .alterTable("playlist_configs_new")
    .renameTo("playlist_configs")
    .execute();

  // Note: The user_id index was dropped along with the old table
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Recreate table with original columns
  await db.schema
    .createTable("playlist_configs_old")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("user_id", "integer", (col) =>
      col.references("users.id").notNull(),
    )
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("description", "varchar")
    .addColumn("spotify_playlist_id", "varchar")
    .addColumn("build_status", "varchar", (col) => col.defaultTo("UNSTARTED"))
    .addColumn("build_cadence", "varchar", (col) => col.defaultTo("NONE"))
    .addColumn("build_day", "varchar")
    .addColumn("last_built_date", "varchar")
    .addColumn("entity_type", "varchar", (col) => col.defaultTo("TRACKS"))
    .addColumn("created_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .addColumn("updated_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .execute();

  // Copy data back (user_id, description will need default values)
  await sql`
    INSERT INTO playlist_configs_old (
      id,
      user_id,
      name,
      description,
      spotify_playlist_id,
      build_status,
      build_cadence,
      build_day,
      last_built_date,
      entity_type,
      created_at,
      updated_at
    )
    SELECT
      id,
      1,
      name,
      '',
      spotify_playlist_id,
      build_status,
      build_cadence,
      build_day,
      last_built_date,
      entity_type,
      created_at,
      updated_at
    FROM playlist_configs
  `.execute(db);

  // Drop current table
  await db.schema.dropTable("playlist_configs").execute();

  // Rename old table back
  await db.schema
    .alterTable("playlist_configs_old")
    .renameTo("playlist_configs")
    .execute();

  // Recreate the user_id index
  await db.schema
    .createIndex("playlist_configs_user_id_index")
    .on("playlist_configs")
    .columns(["user_id"])
    .execute();
}
