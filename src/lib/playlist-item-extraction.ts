import { FromSchema } from "json-schema-to-ts";

/**
 * JSON Schema for OpenAI structured output of playlist items
 */
export const PlaylistItemResponseSchema = {
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

export type PlaylistItemResponse = FromSchema<typeof PlaylistItemResponseSchema>;

export interface PlaylistItem {
  artist: string;
  title: string;
}

/**
 * Generates a prompt for extracting playlist items from text content
 */
export function generateExtractionPrompt(content: string[]): string {
  return `
Extract an array of objects with artist and song title from the following content.

## Guidelines
1. Strip all years from the song title (e.g. "1980", "(1980)", "[1980]", etc.).
2. Strip all non-alphanumeric characters from the song title (e.g. "!", "?", "#", etc.)
3. Strip all non-alphanumeric characters from the artist name (e.g. "!", "?", "#", etc.)
4. Replace all non-English characters with their English equivalents (e.g. "é" -> "e", "á" -> "a", etc.)
5. Verify that a real song belonging to the artist exists.
6. Only extract content that appears to be music-related (artist + song format).

Content to analyze:
${content.join("\n---\n")}
  `.trim();
}
