import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create a trigger that automatically updates the updated_at column
  // whenever a row in playlist_configs is updated
  await sql`
    CREATE TRIGGER playlist_configs_updated_at_trigger
    AFTER UPDATE ON playlist_configs
    FOR EACH ROW
    BEGIN
      UPDATE playlist_configs
      SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now')
      WHERE id = NEW.id;
    END;
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop the trigger if we need to rollback
  await sql`DROP TRIGGER IF EXISTS playlist_configs_updated_at_trigger`.execute(
    db,
  );
}
