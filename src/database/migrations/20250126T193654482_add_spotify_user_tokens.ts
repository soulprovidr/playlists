import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("spotify_user_tokens")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("spotify_user_id", "integer")
    .addColumn("access_token", "varchar", (col) => col.notNull())
    .addColumn("refresh_token", "varchar", (col) => col.notNull())
    .execute();
}
