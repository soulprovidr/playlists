import { database } from "@database";
import {
  BuildCadence,
  BuildStatus,
  EntityType,
  PlaylistConfig,
  PlaylistConfigInsert,
  PlaylistConfigUpdate,
} from "./playlist-configs.types";

export async function getPlaylistConfigById(
  playlistConfigId: number,
): Promise<PlaylistConfig | undefined> {
  return database
    .selectFrom("playlistConfigs")
    .where("id", "=", playlistConfigId)
    .selectAll()
    .executeTakeFirst();
}

export async function getAllPlaylistConfigs(): Promise<PlaylistConfig[]> {
  return database.selectFrom("playlistConfigs").selectAll().execute();
}

export async function createPlaylistConfig(
  playlistConfig: PlaylistConfigInsert,
): Promise<PlaylistConfig> {
  const result = await database
    .insertInto("playlistConfigs")
    .values(playlistConfig)
    .returningAll()
    .executeTakeFirstOrThrow();
  return result;
}

export async function updatePlaylistConfig(
  playlistConfigId: number,
  playlistConfig: PlaylistConfigUpdate,
): Promise<PlaylistConfig> {
  const result = await database
    .updateTable("playlistConfigs")
    .set(playlistConfig)
    .where("id", "=", playlistConfigId)
    .returningAll()
    .executeTakeFirstOrThrow();
  return result;
}

export async function getPlaylistConfigBySpotifyPlaylistId(
  spotifyPlaylistId: string,
): Promise<PlaylistConfig | undefined> {
  return database
    .selectFrom("playlistConfigs")
    .where("spotifyPlaylistId", "=", spotifyPlaylistId)
    .selectAll()
    .executeTakeFirst();
}

export async function upsertPlaylistConfigBySpotifyId(
  playlistConfig: PlaylistConfigInsert,
): Promise<PlaylistConfig> {
  const existing = await getPlaylistConfigBySpotifyPlaylistId(
    playlistConfig.spotifyPlaylistId,
  );

  if (existing) {
    // Update existing playlist config (preserve build status and last built date)
    const result = await database
      .updateTable("playlistConfigs")
      .set({
        buildCadence: playlistConfig.buildCadence ?? BuildCadence.NONE,
        buildDay: playlistConfig.buildDay ?? null,
        entityType: playlistConfig.entityType ?? EntityType.TRACKS,
      })
      .where("id", "=", existing.id)
      .returningAll()
      .executeTakeFirstOrThrow();
    return result;
  }

  // Insert new playlist config
  const result = await database
    .insertInto("playlistConfigs")
    .values({
      ...playlistConfig,
      buildStatus: BuildStatus.UNSTARTED,
      buildCadence: playlistConfig.buildCadence ?? BuildCadence.NONE,
      entityType: playlistConfig.entityType ?? EntityType.TRACKS,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return result;
}
