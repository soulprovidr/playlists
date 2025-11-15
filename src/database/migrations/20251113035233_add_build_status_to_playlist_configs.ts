import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("playlist_configs")
    .addColumn("build_status", "varchar", (col) =>
      col.notNull().defaultTo("UNSTARTED"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("playlist_configs")
    .dropColumn("build_status")
    .execute();
}
