import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("playlist_configs")
    .addColumn("last_built_date", "varchar")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("playlist_configs")
    .dropColumn("last_built_date")
    .execute();
}
