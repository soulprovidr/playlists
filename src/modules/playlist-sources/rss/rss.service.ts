import { logger } from "@logger";
import * as playlistItemsService from "@modules/playlist-items/playlist-items.service";
import { PlaylistItem } from "@modules/playlist-items/playlist-items.types";
import _ from "lodash";
import RssParser from "rss-parser";
import { RssSourceConfig } from "../playlist-sources.types";

// Configuration constants for performance tuning
const CONTENT_BATCH_SIZE = 100; // Number of text items to send to OpenAI per request
const RATE_LIMIT_DELAY_MS = 1000; // Delay between batches to respect rate limits

const parser = new RssParser();

export async function getPlaylistItems(
  config: RssSourceConfig,
): Promise<PlaylistItem[]> {
  const { items } = await parser.parseURL(config.feedUrl);
  logger.info(`[rss] Found ${items.length} content items from RSS feed`);

  // Extract playlist items from content (in batches to avoid token limits)
  const contentBatches = _.chunk(items, CONTENT_BATCH_SIZE);
  const allItems: PlaylistItem[] = [];

  for (let i = 0; i < contentBatches.length; i++) {
    const batchItems = await playlistItemsService.getPlaylistItemsFromText(
      JSON.stringify(contentBatches[i]),
      `
        - Ignore the "creator" or "author" fields – these represent the names of the author of the post, NOT the artist being referenced by the post.
        - Attempt to infer the artist name from the post URL or any available image URL. For example, if the post URL is "https://pitchfork.com/reviews/tracks/rooster-nuketown-blues/" and the title is "Nuketown Blues", the artist is likely "rooster".
      `,
    );
    allItems.push(...batchItems);
    logger.info(
      `[rss] Extracted ${batchItems.length} items from batch ${i + 1}/${contentBatches.length}`,
    );

    // Rate limiting: wait between OpenAI calls
    if (i < contentBatches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  // Deduplicate
  const uniqueItems = _.uniqBy(
    allItems,
    (item) => `${item.artist.toLowerCase()}-${item.title.toLowerCase()}`,
  );

  return uniqueItems;
}
