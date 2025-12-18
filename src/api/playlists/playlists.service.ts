import { getCurrentUser } from "@context";
import { jobs } from "@jobs";
import { logger } from "@logger";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import {
  BuildCadence,
  BuildStatus,
} from "@modules/playlist-configs/playlist-configs.types";
import * as playlistSourcesService from "@modules/playlist-sources/playlist-sources.service";
import {
  PlaylistSourceConfig,
  PlaylistSourceType,
} from "@modules/playlist-sources/playlist-sources.types";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import * as usersService from "@modules/users/users.service";
import { buildPlaylist } from "@tasks/build-playlist";
import _ from "lodash";
import { PlaylistViewResponse } from "./playlists.types";

export const buildPlaylistByPlaylistConfigId = async (
  playlistConfigId: number,
): Promise<boolean | undefined> => {
  const currentUser = getCurrentUser();
  const playlistConfig =
    await playlistConfigsService.getPlaylistConfigById(playlistConfigId);

  if (!currentUser) {
    throw new Error("No authenticated user.");
  }

  if (!playlistConfig) {
    throw new Error("Playlist config not found");
  }

  if (playlistConfig.userId !== currentUser.id) {
    throw new Error("Unauthorized");
  }

  // Set status to IN_PROGRESS
  await playlistConfigsService.updatePlaylistConfig(playlistConfigId, {
    buildStatus: BuildStatus.IN_PROGRESS,
  });

  // Queue the build job
  jobs.add(
    async () => {
      try {
        await buildPlaylist(playlistConfig.id);
        // Set status to COMPLETED on success
        await playlistConfigsService.updatePlaylistConfig(playlistConfigId, {
          buildStatus: BuildStatus.COMPLETED,
        });
      } catch (error) {
        logger.error(
          { err: error },
          `Failed to build playlist ${playlistConfigId}`,
        );
        // Set status to ERRORED on error
        await playlistConfigsService.updatePlaylistConfig(playlistConfigId, {
          buildStatus: BuildStatus.ERRORED,
        });
      }
    },
    {
      onSuccess: (jobId) =>
        logger.info(
          `Playlist ${playlistConfigId} built successfully (${jobId})`,
        ),
      onError: (jobId, error) =>
        logger.error(
          { err: error },
          `Playlist ${playlistConfigId} build failed (${jobId})`,
        ),
    },
  );

  return true;
};

export const getPlaylistView = async (
  playlistConfigId: number,
): Promise<PlaylistViewResponse | undefined> => {
  const playlistConfig =
    await playlistConfigsService.getPlaylistConfigById(playlistConfigId);

  if (!playlistConfig) {
    return undefined;
  }

  const playlistSources =
    await playlistSourcesService.getPlaylistSourcesByPlaylistConfigIds([
      playlistConfig.id,
    ]);
  const spotifyApi = await spotifyApiService.getInstance(playlistConfig.userId);
  const { body: playlist } = await spotifyApi.getPlaylist(
    playlistConfig.spotifyPlaylistId,
  );

  return {
    id: playlistConfig.id,
    userId: playlistConfig.userId,
    name: playlistConfig.name,
    imageUrl: _.first(playlist.images)?.url,
    description: playlistConfig.description,
    spotifyPlaylistId: playlistConfig.spotifyPlaylistId,
    buildStatus: playlistConfig.buildStatus,
    buildCadence: playlistConfig.buildCadence,
    buildDay: playlistConfig.buildDay,
    createdAt: playlistConfig.createdAt,
    updatedAt: playlistConfig.updatedAt,
    sources: playlistSources,
    tracks: playlist.tracks.items,
  };
};

export interface UpsertPlaylistRequest {
  name: string;
  description: string;
  sources: Array<{
    type: string;
    config: PlaylistSourceConfig;
  }>;
  buildCadence?: string;
  buildDay?: string | null;
}

export const upsertPlaylist = async (
  userId: number,
  playlistConfigId: number | undefined,
  data: UpsertPlaylistRequest,
) => {
  let config;

  if (playlistConfigId) {
    // Update existing playlist
    const existingConfig =
      await playlistConfigsService.getPlaylistConfigById(playlistConfigId);

    if (!existingConfig) {
      throw new Error("Playlist config not found");
    }

    if (existingConfig.userId !== userId) {
      throw new Error("Unauthorized");
    }

    config = await playlistConfigsService.updatePlaylistConfig(
      playlistConfigId,
      {
        name: data.name,
        description: data.description,
        buildCadence: data.buildCadence as BuildCadence | undefined,
        buildDay: data.buildDay,
      },
    );

    // Delete existing sources and recreate them
    await playlistSourcesService.deletePlaylistSourcesByPlaylistConfigId(
      playlistConfigId,
    );
  } else {
    // Create new playlist
    // First get the user's Spotify user ID
    const user = await usersService.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Create a Spotify playlist
    const spotifyApi = await spotifyApiService.getInstance(userId);
    const spotifyPlaylistResponse = await spotifyApi.createPlaylist(data.name, {
      description: data.description,
      public: false,
    });
    const spotifyPlaylist = spotifyPlaylistResponse.body;

    config = await playlistConfigsService.createPlaylistConfig({
      userId,
      name: data.name,
      description: data.description,
      spotifyPlaylistId: spotifyPlaylist.id,
      buildCadence: data.buildCadence as BuildCadence | undefined,
      buildDay: data.buildDay,
    });
  }

  // Create new sources
  const sources = await Promise.all(
    _.map(data.sources, (source) =>
      playlistSourcesService.createPlaylistSource({
        playlistConfigId: config.id,
        type: source.type as PlaylistSourceType,
        config: JSON.stringify(source.config) as string,
      }),
    ),
  );

  return _.extend(config, { sources });
};
