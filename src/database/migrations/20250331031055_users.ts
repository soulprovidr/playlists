import { type Kysely } from "kysely";
import * as databaseHelpers from "../database.helpers";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("users")
    .$call(databaseHelpers.withAutoIncrementingId)
    .addColumn("spotify_user_id", "varchar")
    .$call(databaseHelpers.withTimestamps)
    .execute();

  await db.schema
    .createTable("spotify_access_tokens")
    .$call(databaseHelpers.withAutoIncrementingId)
    .addColumn("user_id", "integer", (col) => col.references("users.id"))
    .addColumn("access_token", "varchar")
    .addColumn("refresh_token", "varchar")
    .addColumn("expires_at", "varchar")
    .$call(databaseHelpers.withTimestamps)
    .execute();

  await db.schema
    .createIndex("spotify_access_tokens_user_id_index")
    .on("spotify_access_tokens")
    .columns(["user_id"])
    .execute();
}
