import { LocalDate } from "@js-joda/core";
import { PlaylistItem } from "@lib/playlist-item-extraction";
import { logger } from "@logger";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import { BuildStatus } from "@modules/playlist-configs/playlist-configs.types";
import * as playlistSourcesService from "@modules/playlist-sources/playlist-sources.service";
import {
  PlaylistSource,
  PlaylistSourceType,
  RedditSourceConfig,
  RssSourceConfig,
} from "@modules/playlist-sources/playlist-sources.types";
import * as redditService from "@modules/playlist-sources/reddit/reddit.service";
import * as rssService from "@modules/playlist-sources/rss/rss.service";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import * as usersService from "@modules/users/users.service";
import { backOff } from "exponential-backoff";
import _ from "lodash";

async function getPlaylistItems(
  source: PlaylistSource,
): Promise<PlaylistItem[]> {
  switch (source.type) {
    case PlaylistSourceType.REDDIT: {
      const config = source.config as RedditSourceConfig;
      return await redditService.extractPlaylistItems(config);
    }
    case PlaylistSourceType.RSS: {
      const config = source.config as RssSourceConfig;
      return await rssService.extractPlaylistItems(config);
    }
    default:
      logger.warn(`[buildPlaylist] Unsupported source type: ${source.type}`);
      return [];
  }
}

export async function buildPlaylist(playlistConfigId: number) {
  const playlistConfig =
    await playlistConfigsService.getPlaylistConfigById(playlistConfigId);
  if (!playlistConfig) {
    throw new Error(
      `[buildPlaylist] No matching playlist config found for ${playlistConfigId}`,
    );
  }

  const user = await usersService.getUserById(playlistConfig.userId);
  if (!user) {
    throw new Error(
      `[buildPlaylist] No matching user found for ${playlistConfig.userId}`,
    );
  }

  const spotifyApi = await spotifyApiService.getInstance(user.id);

  const playlistSources =
    await playlistSourcesService.getPlaylistSourcesByPlaylistConfigIds([
      playlistConfig.id,
    ]);

  try {
    logger.info("[buildPlaylist] Extracting PlaylistItems...");
    const playlistItems: PlaylistItem[] = [];

    for (const source of playlistSources) {
      const items = await getPlaylistItems(source);
      playlistItems.push(...items);
    }

    logger.info(`[buildPlaylist] Found ${playlistItems.length} PlaylistItems.`);

    const trackUriPromises: (() => Promise<string | null>)[] = _.chain(
      playlistItems,
    )
      .map(
        (item) => async () =>
          backOff(
            async () => {
              logger.info(
                `[buildPlaylist] Searching for Spotify track: ${item.artist} - ${item.title}`,
              );
              try {
                const searchResult = await spotifyApi.searchTracks(
                  `${item.artist} ${item.title}`,
                );

                if (
                  !searchResult.body.tracks ||
                  searchResult.body.tracks.items.length === 0
                ) {
                  return null;
                }

                return searchResult.body.tracks.items[0].uri;
              } catch (error) {
                // @ts-expect-error Spotify API error
                const { message, statusCode } = error;

                switch (statusCode) {
                  case 401:
                    logger.warn(
                      `[buildPlaylist] Token expired. Refreshing token...`,
                    );
                    await spotifyApi.refreshAccessToken();
                    break;
                  case 429:
                    logger.warn(`[buildPlaylist] Rate limit reached.`);
                    break;
                  default:
                    logger.warn(
                      { err: error },
                      `[buildPlaylist] Error searching for track: ${message}`,
                    );
                    break;
                }

                throw new Error();
              }
            },
            { numOfAttempts: 5 },
          ),
      )
      .value();

    const trackUris: string[] = [];
    for (const promise of trackUriPromises) {
      try {
        const trackUri = await promise();
        if (trackUri) {
          trackUris.push(trackUri);
        }
      } catch {
        logger.error(`[buildPlaylist] Error finding track.`);
      }
    }

    if (!trackUris.length) {
      logger.error(`[buildPlaylist] No tracks found for playlist.`);
      throw new Error();
    }

    logger.info(`[buildPlaylist] Found ${trackUris.length} tracks on Spotify.`);

    const chunkedTrackUris: string[][] = _.chain(trackUris)
      .shuffle()
      .chunk(100)
      .value();

    for (let i = 0; i < chunkedTrackUris.length; i++) {
      if (i === 0) {
        await spotifyApi.replaceTracksInPlaylist(
          playlistConfig.spotifyPlaylistId,
          chunkedTrackUris[i],
        );
      } else {
        await spotifyApi.addTracksToPlaylist(
          playlistConfig.spotifyPlaylistId,
          chunkedTrackUris[i],
          { position: i * 100 },
        );
      }
    }

    logger.info(
      `[buildPlaylist] Playlist ${playlistConfig.name} built successfully.`,
    );
    await playlistConfigsService.updatePlaylistConfig(playlistConfig.id, {
      buildStatus: BuildStatus.COMPLETED,
      lastBuiltDate: LocalDate.now().toString(),
    });
  } catch (error) {
    logger.error({ err: error }, "[buildPlaylist] Failed to build playlist.");
    await playlistConfigsService.updatePlaylistConfig(playlistConfig.id, {
      buildStatus: BuildStatus.ERRORED,
    });
  }
}
