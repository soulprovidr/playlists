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

export type PlaylistItemResponse = FromSchema<
  typeof PlaylistItemResponseSchema
>;

export interface PlaylistItem {
  artist: string;
  title: string;
}

/**
 * Generates a prompt for extracting playlist items from text content
 */
export function generateExtractionPrompt(content: string[]): string {
  return `
    You are a text extraction and normalization engine.

    Your task is to extract musical artist–song title pairs from the input content below. The input may be stringified JSON representing heterogeneous entities (e.g. RSS items, Reddit posts, Reddit comments) and may contain irrelevant or non-music text.

    ## OUTPUT REQUIREMENTS
    - Return only a valid JSON array.
    - Each item must be an object with the exact schema:
      { "artist": "string", "title": "string" }
    - Do not include any additional text, explanations, or formatting.

    ## EXTRACTION RULES
    -Only extract entries that clearly refer to a musical recording (song or track) by a musical artist.

    - Ignore:
      - Albums, playlists, genres, radio shows
      - Non-musical creators (e.g. podcasters, YouTubers, DJs unless referencing a specific song)
      - Mentions where either the artist or song is ambiguous or missing

    ## NORMALIZATION RULES
    - Apply all normalization steps after extraction:
      - Song title:
        - Remove all years and year annotations (e.g. 1980, (1980), [1980], - 1980 remaster)
        - Remove all non-alphanumeric characters, excluding spaces (e.g. "!", "?", "#", etc.)
      - Artist name:
        - Remove all non-alphanumeric characters, excluding spaces (e.g. "!", "?", "#", etc.)
      - Character normalization:
        - Replace all non-English characters with their closest ASCII equivalents (e.g. é → e, á → a, ö → o, ß → ss)
      - Casing:
        - Preserve original casing where possible

    ## DEDUPLICATION
    - If the same artist–title pair appears multiple times, include it only once.

    ## INPUT
    Extract from the following content:
    ${content.join("\n---\n")}
  `.trim();
}
