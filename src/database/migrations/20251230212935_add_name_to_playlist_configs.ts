import { type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("playlist_configs")
    .addColumn("name", "varchar", (col) => col.notNull().defaultTo(""))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("playlist_configs")
    .dropColumn("name")
    .execute();
}
