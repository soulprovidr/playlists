import { env } from "@env";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import { PlaylistSourceType } from "@modules/playlist-configs/playlist-configs.types";
import * as playlistSourcesHelpers from "@modules/playlist-sources/playlist-sources.helpers";
import * as playlistSourcesService from "@modules/playlist-sources/playlist-sources.service";
import {
  PlaylistSource,
  RedditSourceConfig,
} from "@modules/playlist-sources/playlist-sources.types";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import * as usersService from "@modules/users/users.service";
import axios from "axios";
import { backOff } from "exponential-backoff";
import { FromSchema } from "json-schema-to-ts";
import _ from "lodash";
import OpenAI from "openai";

const PlaylistItemResponseSchema = {
  type: "object",
  properties: {
    playlist_items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          artist: { type: "string" },
          title: { type: "string" },
        },
        required: ["artist", "title"],
        additionalProperties: false,
      },
    },
  },
  required: ["playlist_items"],
  additionalProperties: false,
} as const;

type PlaylistItemResponse = FromSchema<typeof PlaylistItemResponseSchema>;

interface PlaylistItem {
  artist: string;
  title: string;
}

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

async function getSourceJson(source: PlaylistSource): Promise<unknown> {
  switch (source.type) {
    case PlaylistSourceType.REDDIT: {
      const config = source.config as RedditSourceConfig;
      const url = playlistSourcesHelpers.getRedditSourceUrl(config);
      const { data, status } = await axios.get(url);
      return status === 200 ? data : {};
    }
    default:
      console.warn(`Unsupported source type: ${source.type}`);
      return {};
  }
}

// TODO: centralize OpenAI API interactions + add exponential backoff
async function extractPlaylistItems(data: unknown): Promise<PlaylistItem[]> {
  const prompt = `
        Extract an array of objects with artist and song title from the following JSON.

        ## Guidelines
        1. Strip all years from the song title (e.g. "1980", "(1980)", "[1980]", etc.).
        2. Strip all non-alphanumeric characters from the song title (e.g. "!", "?", "#", etc.)
        3. Strip all non-alphanumeric characters from the artist name (e.g. "!", "?", "#", etc.)
        4. Replace all non-English characters with their English equivalents (e.g. "é" -> "e", "á" -> "a", etc.)
        5. Verify that a real song belonging to the artist exists.

        ${JSON.stringify(data)}
      `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "playlist_items",
        schema: PlaylistItemResponseSchema,
        strict: true,
      },
    },
  });

  const content = response.choices[0].message.content?.trim();
  const { playlist_items } = JSON.parse(content!) as PlaylistItemResponse;
  return playlist_items;
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
    const sourceData: unknown[] = await Promise.all(
      _.map(playlistSources, getSourceJson),
    );

    console.log("Extracting PlaylistItems...");
    const playlistItems: PlaylistItem[] = [];
    for (const data of sourceData) {
      const items = await extractPlaylistItems(data);
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
          chunkedTrackUris[i].slice(100),
        );
      } else {
        await spotifyApi.addTracksToPlaylist(
          playlistConfig.spotifyPlaylistId,
          chunkedTrackUris[i].slice(i * 100, i * 100 + 100),
          { position: i * 100 },
        );
      }
    }

    console.log(`Found ${trackUris.length} songs on Spotify.`);

    await spotifyApi.replaceTracksInPlaylist(
      playlistConfig.spotifyPlaylistId,
      trackUris,
    );
  } catch (error) {
    console.error("Error:", error);
  }
}
