import { PlaylistItem } from "@lib/playlist-item-extraction";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
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
      console.warn(`Unsupported source type: ${source.type}`);
      return [];
  }
}

export async function buildPlaylist(playlistConfigId: number) {
  const playlistConfig =
    await playlistConfigsService.getPlaylistConfigById(playlistConfigId);
  if (!playlistConfig) {
    throw new Error(
      `No matching playlist config found for ${playlistConfigId}`,
    );
  }

  const user = await usersService.getUserById(playlistConfig.userId);
  if (!user) {
    throw new Error(`No matching user found for ${playlistConfig.userId}`);
  }

  const spotifyApi = await spotifyApiService.getInstance(user.id);

  const playlistSources =
    await playlistSourcesService.getPlaylistSourcesByPlaylistConfigIds([
      playlistConfig.id,
    ]);

  try {
    console.log("Extracting PlaylistItems...");
    const playlistItems: PlaylistItem[] = [];

    for (const source of playlistSources) {
      const items = await getPlaylistItems(source);
      playlistItems.push(...items);
    }

    console.log(`Found ${playlistItems.length} PlaylistItems.`);

    const trackUriPromises: (() => Promise<string | null>)[] = _.chain(
      playlistItems,
    )
      .map(
        (item) => async () =>
          backOff(
            async () => {
              console.log(
                `Searching for Spotify track: ${item.artist} - ${item.title}`,
              );
              const searchResult = await spotifyApi.searchTracks(
                `${item.artist} ${item.title}`,
              );

              if (searchResult.statusCode === 401) {
                await spotifyApi.refreshAccessToken();
                throw new Error("Token expired. Refreshing token...");
              }

              if (searchResult.statusCode === 429) {
                throw new Error("Rate limit reached.");
              }

              if (
                !searchResult.body.tracks ||
                searchResult.body.tracks.items.length === 0
              ) {
                return null;
              }

              return searchResult.body.tracks.items[0].uri;
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
      } catch (error) {
        console.error(error);
      }
    }

    console.log(`Found ${trackUris.length} songs on Spotify.`);

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
  } catch (error) {
    console.trace(error);
  }
}
