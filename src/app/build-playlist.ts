import { env } from "@env";
import axios from "axios";
import { backOff } from "exponential-backoff";
import { FromSchema } from "json-schema-to-ts";
import OpenAI from "openai";
import { refreshAccessToken, spotifyApi } from "./spotify";
import { PlaylistConfig, PlaylistSourceType } from "./validators";

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

async function getSourceJson(
  source: PlaylistConfig["sources"][0],
): Promise<unknown> {
  switch (source.type) {
    case PlaylistSourceType.REDDIT:
      const { data, status } = await axios.get(source.url);
      return status === 200 ? data : {};
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
  console.log(playlist_items);
  return playlist_items;
}

async function findSongsOnSpotify(item: PlaylistItem): Promise<string | null> {
  return await backOff(
    async () => {
      const searchResult = await spotifyApi.searchTracks(
        `${item.artist} ${item.title}`,
      );
      if (
        !searchResult.body.tracks ||
        searchResult.body.tracks.items.length === 0
      ) {
        throw new Error(`No track found for: ${item.artist} - ${item.title}`);
      }
      return searchResult.body.tracks.items[0].uri;
    },
    {
      retry: (error, attemptNumber) => {
        console.warn(
          `Rate limit reached. Retrying for ${item.artist} - ${item.title}. Attempt ${attemptNumber}. Error:`,
          error.message,
        );
        return true;
      },
    },
  );
}

async function getAllTracks(playlistItems: PlaylistItem[]): Promise<string[]> {
  const foundTracks: string[] = [];

  for (const item of playlistItems) {
    try {
      const trackUri = await findSongsOnSpotify(item);
      if (trackUri) {
        foundTracks.push(trackUri);
      }
    } catch (error) {
      console.warn(
        `Failed to find song: ${item.artist} - ${item.title}`,
        error,
      );
    }
  }

  return foundTracks;
}

async function updateSpotifyPlaylist(
  playlistId: string,
  trackUris: string[],
): Promise<void> {
  try {
    await spotifyApi.replaceTracksInPlaylist(playlistId, trackUris);
    console.log("Playlist updated successfully.");
  } catch (error) {
    console.error("Error updating playlist:", error);
  }
}

export async function buildPlaylist(playlistConfig: PlaylistConfig) {
  try {
    const sourceData: unknown[] = await Promise.all(
      playlistConfig.sources.map(getSourceJson),
    );

    console.log("Extracting PlaylistItems...");
    const playlistItems: PlaylistItem[] = [];
    for (const data of sourceData) {
      const items = await extractPlaylistItems(data);
      playlistItems.push(...items);
    }

    console.log(`Found ${playlistItems.length} PlaylistItems.`);

    await refreshAccessToken();
    const trackUris = await getAllTracks(playlistItems);
    trackUris.sort(() => Math.random() - 0.5);
    trackUris.splice(100);

    console.log(`Found ${trackUris.length} songs on Spotify.`);
    await updateSpotifyPlaylist(playlistConfig.spotifyPlaylistId, trackUris);
  } catch (error) {
    console.error("Error:", error);
  }
}
