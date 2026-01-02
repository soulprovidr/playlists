import { logger } from "@logger";
import { EntityType } from "@modules/playlist-configs/playlist-configs.types";
import * as playlistItemsService from "@modules/playlist-items/playlist-items.service";
import { PlaylistItem } from "@modules/playlist-items/playlist-items.validation";
import axios from "axios";
import _ from "lodash";
import {
  RedditSourceConfig,
  RedditSourceType,
} from "../playlist-sources.types";

interface RedditPost {
  data: {
    title: string;
    permalink: string;
    id: string;
  };
}

interface RedditListing {
  data: {
    children: RedditPost[];
    after: string | null;
  };
}

// Configuration constants for performance tuning
const CONCURRENT_COMMENT_BATCH_SIZE = 5; // Number of posts to fetch comments from concurrently
const CONTENT_BATCH_SIZE = 100; // Number of text items to attempt to parse per request
const RATE_LIMIT_DELAY_MS = 100; // Delay between batches to respect rate limits

/**
 * Fetches a page of posts from Reddit
 */
async function fetchRedditPage(
  url: string,
  after?: string,
): Promise<RedditListing> {
  const params = after ? { after } : {};
  const { data } = await axios.get<RedditListing>(url, {
    params,
    headers: {
      "User-Agent": "Playlists-App/1.0",
    },
  });
  return data;
}

/**
 * Fetches comments for a Reddit post
 */
async function fetchPostComments(permalink: string): Promise<string[]> {
  try {
    const url = `https://www.reddit.com${permalink}.json`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Playlists-App/1.0",
      },
    });

    // Reddit returns an array: [post_listing, comments_listing]
    if (!Array.isArray(data) || data.length < 2) {
      return [];
    }

    const commentsListing = data[1];
    const comments: string[] = [];

    // Recursively extract comment text
    function extractComments(children: unknown[]): void {
      for (const child of children) {
        const item = child as {
          kind?: string;
          data?: {
            body?: string;
            replies?: { data?: { children?: unknown[] } };
          };
        };
        if (item.kind === "t1" && item.data?.body) {
          comments.push(item.data.body);
        }
        if (item.data?.replies?.data?.children) {
          extractComments(item.data.replies.data.children);
        }
      }
    }

    if (commentsListing.data?.children) {
      extractComments(commentsListing.data.children);
    }

    return comments;
  } catch (error) {
    logger.error(
      { err: error },
      `[reddit] Failed to fetch comments for ${permalink}`,
    );
    return [];
  }
}

/**
 * Fetches multiple pages of posts from a subreddit
 */
async function fetchSubredditPosts(
  subreddit: string,
  pageCount: number = 3,
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}.json`;
  const posts: RedditPost[] = [];
  let after: string | undefined;

  for (let i = 0; i < pageCount; i++) {
    try {
      const listing = await fetchRedditPage(url, after);
      posts.push(...listing.data.children);
      after = listing.data.after || undefined;

      if (!after) {
        break; // No more pages
      }

      // Rate limiting: wait between requests
      if (i < pageCount - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, RATE_LIMIT_DELAY_MS),
        );
      }
    } catch (error) {
      logger.error(
        { err: error },
        `[reddit] Failed to fetch page ${i + 1} for r/${subreddit}`,
      );
      break;
    }
  }

  return posts;
}

/**
 * Fetches posts from a Reddit user
 */
async function fetchUserPosts(
  username: string,
  pageCount: number = 3,
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/user/${username}.json`;
  const posts: RedditPost[] = [];
  let after: string | undefined;

  for (let i = 0; i < pageCount; i++) {
    try {
      const listing = await fetchRedditPage(url, after);
      posts.push(...listing.data.children);
      after = listing.data.after || undefined;

      if (!after) {
        break; // No more pages
      }

      // Rate limiting: wait between requests
      if (i < pageCount - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, RATE_LIMIT_DELAY_MS),
        );
      }
    } catch (error) {
      logger.error(
        { err: error },
        `[reddit] Failed to fetch page ${i + 1} for u/${username}`,
      );
      break;
    }
  }

  return posts;
}

/**
 * Extracts playlist items from a Reddit source
 * For subreddits: fetches last 3 pages of posts and all comments
 * For users: fetches last 3 pages of posts and all comments
 */
export async function getPlaylistItems(
  config: RedditSourceConfig,
  entityType: EntityType,
): Promise<PlaylistItem[]> {
  logger.info(
    `[reddit] Extracting playlist items from Reddit ${config.type}: ${config.value}`,
  );

  let posts: RedditPost[] = [];

  // Fetch posts based on source type
  switch (config.type) {
    case RedditSourceType.SUBREDDIT:
      posts = await fetchSubredditPosts(config.value, 3);
      break;
    case RedditSourceType.USER:
      posts = await fetchUserPosts(config.value, 3);
      break;
    default:
      throw new Error(`Unsupported Reddit source type: ${config.type}`);
  }

  logger.info(`[reddit] Found ${posts.length} posts`);

  // Extract post titles
  const postTitles = posts.map((post) => post.data.title);

  // Fetch all comments from all posts (in concurrent batches)
  const allComments: string[] = [];
  const postBatches = _.chunk(posts, CONCURRENT_COMMENT_BATCH_SIZE);

  for (let i = 0; i < postBatches.length; i++) {
    const batch = postBatches[i];
    logger.info(
      `[reddit] Fetching comments for batch ${i + 1}/${postBatches.length} (${batch.length} posts)`,
    );

    // Fetch all comments for posts in this batch concurrently
    const batchCommentsPromises = batch.map((post) =>
      fetchPostComments(post.data.permalink),
    );
    const batchCommentsResults = await Promise.all(batchCommentsPromises);

    // Flatten and add to all comments
    for (const comments of batchCommentsResults) {
      allComments.push(...comments);
    }

    // Rate limiting: wait between batches (not between individual requests)
    if (i < postBatches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  logger.info(`[reddit] Found ${allComments.length} comments`);

  // Extract playlist items from titles
  const itemsFromTitles = await playlistItemsService.getPlaylistItemsFromText(
    postTitles,
    entityType,
  );
  logger.info(
    `[reddit] Extracted ${itemsFromTitles.length} items from post titles`,
  );

  // Extract playlist items from comments (in batches to avoid token limits)
  const commentBatches = _.chunk(allComments, CONTENT_BATCH_SIZE);
  const itemsFromComments: PlaylistItem[] = [];

  for (let i = 0; i < commentBatches.length; i++) {
    const batchItems = await playlistItemsService.getPlaylistItemsFromText(
      commentBatches[i],
      entityType,
    );
    itemsFromComments.push(...batchItems);
    logger.info(
      `[reddit] Extracted ${batchItems.length} items from comment batch ${i + 1}/${commentBatches.length}`,
    );

    // Rate limiting: wait between OpenAI calls
    if (i < commentBatches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  logger.info(
    `[reddit] Extracted ${itemsFromComments.length} items from comments`,
  );

  // Combine and deduplicate
  const allItems = [...itemsFromTitles, ...itemsFromComments];
  const uniqueItems = _.uniqBy(
    allItems,
    (item) => `${item.artist.toLowerCase()}-${item.name.toLowerCase()}`,
  );

  logger.info(`[reddit] Total unique playlist items: ${uniqueItems.length}`);

  return uniqueItems;
}
