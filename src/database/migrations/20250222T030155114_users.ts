import { sql, type Kysely } from "kysely";

// eslint-disable-next-line
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("spotify_user_id", "varchar")
    .addColumn("created_at", "text", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .execute();

  await db.schema
    .createTable("spotify_users")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("spotify_user_id", "varchar")
    .addColumn("access_token", "varchar")
    .addColumn("refresh_token", "varchar")
    .addColumn("expires_at", "text")
    .addColumn("created_at", "text", (col) =>
      col.defaultTo(sql`(strftime('%Y-%m-%d %H:%M:%S', 'now'))`).notNull(),
    )
    .execute();

  await db.schema
    .createIndex("users_spotify_user_id_index")
    .on("users")
    .columns(["spotify_user_id"])
    .execute();

  await db.schema
    .createIndex("spotify_users_spotify_user_id_index")
    .on("spotify_users")
    .columns(["spotify_user_id"])
    .execute();
}
