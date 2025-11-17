import { env } from "@env";
import {
  generateExtractionPrompt,
  PlaylistItem,
  PlaylistItemResponse,
  PlaylistItemResponseSchema,
} from "@lib/playlist-item-extraction";
import axios from "axios";
import _ from "lodash";
import OpenAI from "openai";
import { parseStringPromise } from "xml2js";
import { RssSourceConfig } from "../playlist-sources.types";

// Configuration constants for performance tuning
const OPENAI_CONTENT_BATCH_SIZE = 100; // Number of text items to send to OpenAI per request
const RATE_LIMIT_DELAY_MS = 1000; // Delay between batches to respect rate limits

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/**
 * Fetches RSS feed content
 */
async function fetchRssFeed(url: string): Promise<string> {
  const { data } = await axios.get<string>(url, {
    headers: {
      "User-Agent": "Playlists-App/1.0",
    },
  });
  return data;
}

/**
 * Extracts text content from RSS feed items
 */
async function extractRssContent(xmlContent: string): Promise<string[]> {
  try {
    const parsed = await parseStringPromise(xmlContent);
    const content: string[] = [];

    // Handle RSS 2.0 format
    if (parsed.rss?.channel?.[0]?.item) {
      for (const item of parsed.rss.channel[0].item) {
        if (item.title?.[0]) {
          content.push(item.title[0]);
        }
        if (item.description?.[0]) {
          // Strip HTML tags from description
          const description = item.description[0].replace(/<[^>]*>/g, "");
          content.push(description);
        }
      }
    }

    // Handle Atom format
    if (parsed.feed?.entry) {
      for (const entry of parsed.feed.entry) {
        if (entry.title?.[0]) {
          const title =
            typeof entry.title[0] === "string"
              ? entry.title[0]
              : entry.title[0]._;
          content.push(title);
        }
        if (entry.content?.[0]) {
          const contentText =
            typeof entry.content[0] === "string"
              ? entry.content[0]
              : entry.content[0]._;
          // Strip HTML tags
          const stripped = contentText.replace(/<[^>]*>/g, "");
          content.push(stripped);
        }
        if (entry.summary?.[0]) {
          const summary =
            typeof entry.summary[0] === "string"
              ? entry.summary[0]
              : entry.summary[0]._;
          const stripped = summary.replace(/<[^>]*>/g, "");
          content.push(stripped);
        }
      }
    }

    return content;
  } catch (error) {
    console.error("Failed to parse RSS feed:", error);
    return [];
  }
}

/**
 * Uses OpenAI to extract playlist items from text content
 */
async function extractPlaylistItemsFromText(
  content: string[],
): Promise<PlaylistItem[]> {
  if (content.length === 0) {
    return [];
  }

  const prompt = generateExtractionPrompt(content);

  try {
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

    const responseContent = response.choices[0].message.content?.trim();
    if (!responseContent) {
      return [];
    }

    const { playlist_items } = JSON.parse(
      responseContent,
    ) as PlaylistItemResponse;
    return playlist_items;
  } catch (error) {
    console.error("Failed to extract playlist items from text:", error);
    return [];
  }
}

/**
 * Extracts playlist items from an RSS feed
 */
export async function extractPlaylistItems(
  config: RssSourceConfig,
): Promise<PlaylistItem[]> {
  console.log(`Extracting playlist items from RSS feed: ${config.feedUrl}`);

  // Fetch RSS feed
  const xmlContent = await fetchRssFeed(config.feedUrl);

  // Extract text content from feed items
  const content = await extractRssContent(xmlContent);
  console.log(`Found ${content.length} content items from RSS feed`);

  // Extract playlist items from content (in batches to avoid token limits)
  const contentBatches = _.chunk(content, OPENAI_CONTENT_BATCH_SIZE);
  const allItems: PlaylistItem[] = [];

  for (let i = 0; i < contentBatches.length; i++) {
    const batchItems = await extractPlaylistItemsFromText(contentBatches[i]);
    allItems.push(...batchItems);
    console.log(
      `Extracted ${batchItems.length} items from batch ${i + 1}/${contentBatches.length}`,
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

  console.log(`Total unique playlist items: ${uniqueItems.length}`);

  return uniqueItems;
}
