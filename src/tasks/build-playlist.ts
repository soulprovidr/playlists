import { getSpotifyUserId } from "@config";
import { LocalDate } from "@js-joda/core";
import { logger } from "@logger";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import {
  BuildStatus,
  EntityType,
} from "@modules/playlist-configs/playlist-configs.types";
import * as playlistItemsHelpers from "@modules/playlist-items/playlist-items.helpers";
import { PlaylistItem } from "@modules/playlist-items/playlist-items.validation";
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
import { writeDebugOutput } from "@lib/debug-output";
import { backOff } from "exponential-backoff";
import Fuse from "fuse.js";
import _ from "lodash";
import SpotifyWebApi from "spotify-web-api-node";

async function searchPlaylistItem(
  spotifyApi: SpotifyWebApi,
  item: PlaylistItem,
  entityType: EntityType,
): Promise<SpotifyApi.TrackObjectFull | null> {
  try {
    switch (entityType) {
      case EntityType.ALBUMS: {
        logger.info(
          `[buildPlaylist] Searching for album: ${item.artist} - ${item.name}`,
        );
        return spotifyApiService.getMostPopularTrackFromAlbum(
          spotifyApi,
          item.artist,
          item.name,
        );
      }
      case EntityType.TRACKS: {
        logger.info(
          `[buildPlaylist] Searching for track: ${item.artist} - ${item.name}`,
        );
        const searchResult = await spotifyApi.searchTracks(
          `${item.artist} ${item.name}`,
        );

        if (
          !searchResult.body.tracks ||
          searchResult.body.tracks.items.length === 0
        ) {
          return null;
        }

        const artistFuse = new Fuse(searchResult.body.tracks.items, {
          keys: ["artists.name"],
          includeScore: true,
        });
        const artistResults = artistFuse
          .search(item.artist)
          .filter((r) => (r.score ?? 1) < 0.5)
          .map((r) => r.item);

        if (artistResults.length === 0) {
          return null;
        }

        const trackFuse = new Fuse(artistResults, {
          keys: ["name"],
          includeScore: true,
        });
        const trackResults = trackFuse.search(item.name);
        if (trackResults.length === 0) {
          return null;
        }

        return _.minBy(trackResults, (r) => r.score)!.item;
      }
    }
  } catch (error) {
    // @ts-expect-error Spotify API error
    const { message, statusCode } = error;

    switch (statusCode) {
      case 401:
        logger.warn(`[buildPlaylist] Token expired. Refreshing token...`);
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

    throw error;
  }
}

async function getPlaylistItems(
  source: PlaylistSource,
  entityType: EntityType,
): Promise<PlaylistItem[]> {
  switch (source.type) {
    case PlaylistSourceType.REDDIT: {
      const config = source.config as RedditSourceConfig;
      return redditService.getPlaylistItems(config, entityType);
    }
    case PlaylistSourceType.RSS: {
      const config = source.config as RssSourceConfig;
      return rssService.getPlaylistItems(config, entityType);
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
    const message = `No matching playlist config found for ${playlistConfigId}`;
    logger.error(`[buildPlaylist] ${message}`);
    throw new Error(message);
  }

  const spotifyUserId = getSpotifyUserId();
  if (!spotifyUserId) {
    const message = `No spotifyUserId configured in config.yml`;
    logger.error(`[buildPlaylist] ${message}`);
    throw new Error(message);
  }

  const spotifyApi = await spotifyApiService.getInstance(spotifyUserId);

  const playlistSources =
    await playlistSourcesService.getPlaylistSourcesByPlaylistConfigIds([
      playlistConfig.id,
    ]);

  try {
    logger.info("[buildPlaylist] Extracting PlaylistItems...");
    const allPlaylistItems: PlaylistItem[] = [];

    for (const source of playlistSources) {
      const items = await getPlaylistItems(source, playlistConfig.entityType);
      allPlaylistItems.push(...items);
    }

    const playlistItems =
      playlistItemsHelpers.dedupePlaylistItems(allPlaylistItems);

    logger.info(`[buildPlaylist] Found ${playlistItems.length} PlaylistItems.`);

    const tracksMap = new Map<string, SpotifyApi.TrackObjectFull>();
    for (const playlistItem of playlistItems) {
      try {
        const track = await backOff(
          async () =>
            searchPlaylistItem(
              spotifyApi,
              playlistItem,
              playlistConfig.entityType,
            ),
          { numOfAttempts: 5 },
        );
        if (track) {
          tracksMap.set(track.id, track);
        }
      } catch {
        logger.warn(playlistItem, `[buildPlaylist] Error finding track.`);
      }
    }

    if (!tracksMap.size) {
      const message = `No tracks found for playlist.`;
      logger.error(`[buildPlaylist] ${message}`);
      throw new Error(message);
    }

    logger.info(`[buildPlaylist] Found ${tracksMap.size} tracks on Spotify.`);

    const tracks = Array.from(tracksMap.values());
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    writeDebugOutput(`${playlistConfig.spotifyPlaylistId}-${timestamp}.json`, {
      playlistId: playlistConfig.spotifyPlaylistId,
      playlistName: playlistConfig.name,
      builtAt: new Date().toISOString(),
      trackCount: tracks.length,
      tracks: tracks.map((t) => ({
        artist: t.artists.map((a) => a.name).join(", "),
        name: t.name,
        spotifyId: t.id,
        spotifyUri: t.uri,
        popularity: t.popularity,
        album: t.album.name,
        durationMs: t.duration_ms,
      })),
    });

    const chunkedTrackUris: string[][] = _.chain(Array.from(tracksMap.values()))
      .sortBy((t) => t.popularity, "desc")
      .map((t) => t.uri)
      .compact()
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
      `[buildPlaylist] Playlist ${playlistConfig.spotifyPlaylistId} built successfully.`,
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
    throw error;
  }
}
