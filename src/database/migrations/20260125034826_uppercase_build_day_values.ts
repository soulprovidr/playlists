import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    UPDATE playlist_configs
    SET build_day = UPPER(build_day)
    WHERE build_day IS NOT NULL
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    UPDATE playlist_configs
    SET build_day = LOWER(build_day)
    WHERE build_day IS NOT NULL
  `.execute(db);
}
