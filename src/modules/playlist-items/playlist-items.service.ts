import { logger } from "@logger";
import * as openAiApiService from "@modules/open-ai/open-ai-api.service";
import { EntityType } from "@modules/playlist-configs/playlist-configs.types";
import { z } from "zod";
import { ALBUMS_PROMPT, TRACKS_PROMPT } from "./playlist-items.constants";
import {
  albumToPlaylistItem,
  albumValidator,
  PlaylistItem,
  trackToPlaylistItem,
  trackValidator,
} from "./playlist-items.validation";

function getAlbumsPrompt(input: string) {
  return `
  ${ALBUMS_PROMPT}

  ## INPUT
  ${input}
  `;
}

function getTracksPrompt(input: string) {
  return `
  ${TRACKS_PROMPT}

  ## INPUT
  ${input}
  `;
}

export async function getAlbumsFromText(text: string): Promise<PlaylistItem[]> {
  try {
    const { albums } = await openAiApiService.getCompletion(
      getAlbumsPrompt(text),
      z.object({
        albums: z.array(albumValidator),
      }),
    );
    return albums.map(albumToPlaylistItem);
  } catch (error) {
    logger.error({ err: error }, "Failed to extract albums from text");
    return [];
  }
}

export async function getTracksFromText(text: string): Promise<PlaylistItem[]> {
  try {
    const { tracks } = await openAiApiService.getCompletion(
      getTracksPrompt(text),
      z.object({
        tracks: z.array(trackValidator),
      }),
    );
    return tracks.map(trackToPlaylistItem);
  } catch (error) {
    logger.error({ err: error }, "Failed to extract tracks from text");
    return [];
  }
}

export async function getPlaylistItemsFromText(
  text: string | string[],
  entityType: EntityType,
  additionalInstructions?: string,
): Promise<PlaylistItem[]> {
  const inputText = Array.isArray(text) ? text.join("\n") : text;
  const finalText = additionalInstructions
    ? `${inputText}\n\n## Additional Instructions\n${additionalInstructions}`
    : inputText;

  switch (entityType) {
    case EntityType.ALBUMS:
      return getAlbumsFromText(finalText);
    case EntityType.TRACKS:
      return getTracksFromText(finalText);
    default:
      logger.warn(`Unknown entity type: ${entityType}, defaulting to tracks`);
      return getTracksFromText(finalText);
  }
}
