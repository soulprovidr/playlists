import { logger } from "@logger";
import * as openAiApiService from "@modules/open-ai/open-ai-api.service";
import { z } from "zod";
import { ALBUMS_PROMPT, TRACKS_PROMPT } from "./playlist-items.constants";
import {
  albumValidator,
  PlaylistItem,
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
    return albums;
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
    return tracks;
  } catch (error) {
    logger.error({ err: error }, "Failed to extract tracks from text");
    return [];
  }
}
