import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("playlist_configs")
    .addColumn("build_cadence", "varchar", (col) =>
      col.notNull().defaultTo("NONE"),
    )
    .execute();

  await db.schema
    .alterTable("playlist_configs")
    .addColumn("build_day", "varchar")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("playlist_configs")
    .dropColumn("build_cadence")
    .execute();

  await db.schema
    .alterTable("playlist_configs")
    .dropColumn("build_day")
    .execute();
}
