import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
  // 1. Create new spotify_access_tokens table with spotify_user_id instead of user_id
  // 2. Copy data (we can't preserve user mappings, so this will be a fresh start)
  // 3. Drop old table
  // 4. Rename new table
  // 5. Drop users table

  // Create new spotify_access_tokens table with spotify_user_id
  await db.schema
    .createTable("spotify_access_tokens_new")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("spotify_user_id", "varchar", (col) => col.notNull())
    .addColumn("access_token", "varchar")
    .addColumn("refresh_token", "varchar")
    .addColumn("expires_at", "varchar")
    .addColumn("created_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .addColumn("updated_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .execute();

  // Copy data from old table, joining with users to get spotify_user_id
  await sql`
    INSERT INTO spotify_access_tokens_new (
      id,
      spotify_user_id,
      access_token,
      refresh_token,
      expires_at,
      created_at,
      updated_at
    )
    SELECT
      sat.id,
      u.spotify_user_id,
      sat.access_token,
      sat.refresh_token,
      sat.expires_at,
      sat.created_at,
      sat.updated_at
    FROM spotify_access_tokens sat
    JOIN users u ON sat.user_id = u.id
  `.execute(db);

  // Drop old spotify_access_tokens table
  await db.schema.dropTable("spotify_access_tokens").execute();

  // Rename new table to original name
  await db.schema
    .alterTable("spotify_access_tokens_new")
    .renameTo("spotify_access_tokens")
    .execute();

  // Create index on spotify_user_id
  await db.schema
    .createIndex("spotify_access_tokens_spotify_user_id_index")
    .on("spotify_access_tokens")
    .columns(["spotify_user_id"])
    .execute();

  // Drop users table
  await db.schema.dropTable("users").execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Recreate users table
  await db.schema
    .createTable("users")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("spotify_user_id", "varchar")
    .addColumn("created_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .addColumn("updated_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .execute();

  // Insert users from spotify_access_tokens
  await sql`
    INSERT INTO users (spotify_user_id)
    SELECT DISTINCT spotify_user_id FROM spotify_access_tokens
  `.execute(db);

  // Recreate old spotify_access_tokens table with user_id
  await db.schema
    .createTable("spotify_access_tokens_old")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("user_id", "integer", (col) => col.references("users.id"))
    .addColumn("access_token", "varchar")
    .addColumn("refresh_token", "varchar")
    .addColumn("expires_at", "varchar")
    .addColumn("created_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .addColumn("updated_at", "varchar", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .execute();

  // Copy data back, joining to get user_id
  await sql`
    INSERT INTO spotify_access_tokens_old (
      id,
      user_id,
      access_token,
      refresh_token,
      expires_at,
      created_at,
      updated_at
    )
    SELECT
      sat.id,
      u.id,
      sat.access_token,
      sat.refresh_token,
      sat.expires_at,
      sat.created_at,
      sat.updated_at
    FROM spotify_access_tokens sat
    JOIN users u ON sat.spotify_user_id = u.spotify_user_id
  `.execute(db);

  // Drop current table
  await db.schema.dropTable("spotify_access_tokens").execute();

  // Rename old table back
  await db.schema
    .alterTable("spotify_access_tokens_old")
    .renameTo("spotify_access_tokens")
    .execute();

  // Recreate index on user_id
  await db.schema
    .createIndex("spotify_access_tokens_user_id_index")
    .on("spotify_access_tokens")
    .columns(["user_id"])
    .execute();
}
