import type { ConfigPlaylist } from "@config";
import { flattenSources, getConfigPlaylists, getSpotifyUserId } from "@config";
import { logger } from "@logger";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import {
  BuildCadence,
  type PlaylistConfigInsert,
} from "@modules/playlist-configs/playlist-configs.types";
import * as playlistSourcesService from "@modules/playlist-sources/playlist-sources.service";
import type { PlaylistSourceInsert } from "@modules/playlist-sources/playlist-sources.types";
import _ from "lodash";

/**
 * Seed a single playlist configuration and its sources
 */
async function seedPlaylist(configPlaylist: ConfigPlaylist): Promise<void> {
  const { sources, ...playlistData } = configPlaylist;

  const playlistConfigInsert: PlaylistConfigInsert = {
    name: playlistData.name,
    spotifyPlaylistId: playlistData.spotifyPlaylistId,
    buildCadence: playlistData.buildCadence ?? BuildCadence.WEEKLY,
    buildDay: playlistData.buildDay ?? "monday",
    entityType: playlistData.entityType,
  };

  // Upsert the playlist config
  const playlistConfig =
    await playlistConfigsService.upsertPlaylistConfigBySpotifyId(
      playlistConfigInsert,
    );

  logger.info(
    `[seedPlaylists] Upserted playlist config: ${playlistConfig.spotifyPlaylistId} (ID: ${playlistConfig.id})`,
  );

  // Handle sources if provided
  const flattenedSources = flattenSources(sources);

  if (flattenedSources.length > 0) {
    // Delete existing sources and replace with new ones from config
    await playlistSourcesService.deletePlaylistSourcesByPlaylistConfigId(
      playlistConfig.id,
    );

    for (const source of flattenedSources) {
      const sourceInsert: PlaylistSourceInsert = {
        playlistConfigId: playlistConfig.id,
        type: source.type,
        config: JSON.stringify(source.config),
      };

      await playlistSourcesService.createPlaylistSource(sourceInsert);
    }

    logger.info(
      `[seedPlaylists] Added ${flattenedSources.length} source(s) to playlist ${playlistConfig.spotifyPlaylistId}`,
    );
  }
}

/**
 * Seed all playlists from config.yml into the database
 * Uses upsert logic - existing playlists are updated, new ones are created
 */
export async function seedPlaylists(): Promise<void> {
  const spotifyUserId = getSpotifyUserId();

  if (!spotifyUserId) {
    logger.warn(
      "[seedPlaylists] No spotifyUserId configured in config.yml, skipping seed",
    );
    return;
  }

  logger.info(`[seedPlaylists] Using Spotify user: ${spotifyUserId}`);

  const configPlaylists = getConfigPlaylists();

  if (configPlaylists.length === 0) {
    logger.info("[seedPlaylists] No playlists to seed from config.yml");
    return;
  }

  logger.info(`[seedPlaylists] Deleting existing playlist configs`);
  const playlistConfigs = await playlistConfigsService.getAllPlaylistConfigs();
  const deleteSpotifyPlaylistIds = _.difference(
    playlistConfigs.map((config) => config.spotifyPlaylistId),
    configPlaylists.map((config) => config.spotifyPlaylistId),
  );

  for (const spotifyPlaylistId of deleteSpotifyPlaylistIds) {
    await playlistConfigsService.deletePlaylistConfigBySpotifyPlaylistId(
      spotifyPlaylistId,
    );
  }

  logger.info(
    `[seedPlaylists] Seeding ${configPlaylists.length} playlist(s) from config.yml`,
  );

  for (const configPlaylist of configPlaylists) {
    try {
      await seedPlaylist(configPlaylist);
    } catch (error) {
      logger.error(
        { err: error },
        `[seedPlaylists] Failed to seed playlist: ${configPlaylist.spotifyPlaylistId}`,
      );
    }
  }

  logger.info("[seedPlaylists] Finished seeding playlists from config.yml");
}
