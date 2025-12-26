import { logger } from "@logger";
import * as openAiApiService from "@modules/open-ai/open-ai-api.service";
import { backOff } from "exponential-backoff";
import { FromSchema } from "json-schema-to-ts";
import _ from "lodash";
import { PlaylistItem } from "./playlist-items.types";

export async function getPlaylistItemsFromText(
  input: string | string[],
  specialInstructions?: string,
): Promise<PlaylistItem[]> {
  try {
    const openai = openAiApiService.getInstance();

    const schema = {
      type: "object",
      properties: {
        playlistItems: {
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
      required: ["playlistItems"],
      additionalProperties: false,
    } as const;

    const response = await backOff(
      () =>
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `
            You are a text extraction and normalization engine.

            Your task is to extract musical artist–song title pairs from the input content below. The input may be stringified JSON representing heterogeneous entities (e.g. RSS items, Reddit posts, Reddit comments) and may contain irrelevant or non-music text.

            ## RULES
            -Only extract entries that clearly refer to a musical recording (song or track) by a musical artist.

            - Ignore:
              - Albums, playlists, genres, radio shows
              - Non-musical creators (e.g. podcasters, YouTubers, DJs unless referencing a specific song)
              - Mentions where either the artist or song is ambiguous or missing

            - Apply these normalization steps after extraction:
              - Song title:
                - Remove all years and year annotations (e.g. 1980, (1980), [1980], - 1980 remaster)
                - Remove all non-alphanumeric characters, excluding spaces (e.g. "!", "?", "#", etc.)
              - Artist name:
                - Remove all non-alphanumeric characters, excluding spaces (e.g. "!", "?", "#", etc.)
              - Character normalization:
                - Replace all non-English characters with their closest ASCII equivalents (e.g. é → e, á → a, ö → o, ß → ss)
              - Casing:
                - Preserve original casing where possible

            - If the same artist–title pair appears multiple times, include it only once.

            ${specialInstructions ? `## SPECIAL INSTRUCTIONS\n${specialInstructions}` : ""}

            ## INPUT
            ${_.isArray(input) ? input.join("\n") : input}
          `,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "playlistItems",
              schema,
              strict: true,
            },
          },
        }),
      { numOfAttempts: 5 },
    );

    const responseContent = response.choices[0].message.content?.trim();
    if (!responseContent) {
      return [];
    }

    const { playlistItems } = JSON.parse(responseContent) as FromSchema<
      typeof schema
    >;
    return playlistItems;
  } catch (error) {
    logger.error({ err: error }, "Failed to extract playlist items from text");
    return [];
  }
}
