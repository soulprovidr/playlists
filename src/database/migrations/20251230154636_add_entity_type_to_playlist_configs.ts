import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("playlist_configs")
    .addColumn("entity_type", "varchar", (col) =>
      col.notNull().defaultTo("TRACKS"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("playlist_configs")
    .dropColumn("entity_type")
    .execute();
}
