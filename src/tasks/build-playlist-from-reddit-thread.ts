import { getSpotifyUserId } from "@config";
import { logger } from "@logger";
import { EntityType } from "@modules/playlist-configs/playlist-configs.types";
import * as playlistItemsHelpers from "@modules/playlist-items/playlist-items.helpers";
import * as playlistItemsService from "@modules/playlist-items/playlist-items.service";
import { PlaylistItem } from "@modules/playlist-items/playlist-items.validation";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import axios from "axios";
import { backOff } from "exponential-backoff";
import _ from "lodash";
import SpotifyWebApi from "spotify-web-api-node";

// Configuration constants for performance tuning
const CONTENT_BATCH_SIZE = 100; // Number of text items to attempt to parse per request
const RATE_LIMIT_DELAY_MS = 100; // Delay between batches to respect rate limits

interface RedditThreadData {
  title: string;
  selftext: string;
  comments: string[];
}

/**
 * Parses a Reddit thread URL and returns the permalink path
 * Supports various Reddit URL formats:
 * - https://www.reddit.com/r/subreddit/comments/id/title
 * - https://reddit.com/r/subreddit/comments/id/title
 * - https://old.reddit.com/r/subreddit/comments/id/title
 * - /r/subreddit/comments/id/title
 */
function parseRedditThreadUrl(url: string): string {
  // Remove trailing slashes
  const cleanUrl = url.trim().replace(/\/+$/, "");

  // Extract the path portion
  let path: string;

  if (cleanUrl.startsWith("/r/")) {
    path = cleanUrl;
  } else {
    try {
      const urlObj = new URL(cleanUrl);
      path = urlObj.pathname;
    } catch {
      throw new Error(`Invalid Reddit URL: ${url}`);
    }
  }

  // Validate it's a comments thread
  if (!path.includes("/comments/")) {
    throw new Error(
      `URL does not appear to be a Reddit thread: ${url}. Expected a URL containing /comments/`,
    );
  }

  return path;
}

/**
 * Fetches a Reddit thread and extracts the title, selftext, and all comments
 */
async function fetchRedditThread(url: string): Promise<RedditThreadData> {
  const permalink = parseRedditThreadUrl(url);
  const apiUrl = `https://www.reddit.com${permalink}.json`;

  logger.info(`[buildPlaylistFromRedditThread] Fetching thread: ${apiUrl}`);

  const { data } = await axios.get(apiUrl, {
    headers: {
      "User-Agent": "Playlists-App/1.0",
    },
  });

  // Reddit returns an array: [post_listing, comments_listing]
  if (!Array.isArray(data) || data.length < 2) {
    throw new Error("Invalid Reddit API response");
  }

  const postListing = data[0];
  const commentsListing = data[1];

  // Extract post data
  const post = postListing.data?.children?.[0]?.data;
  if (!post) {
    throw new Error("Could not extract post data from Reddit response");
  }

  const title = post.title || "";
  const selftext = post.selftext || "";

  // Recursively extract all comment text
  const comments: string[] = [];

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

  logger.info(
    `[buildPlaylistFromRedditThread] Found ${comments.length} comments`,
  );

  return { title, selftext, comments };
}

/**
 * Extracts a default playlist name from the Reddit thread title
 * Removes common prefixes and cleans up the title
 */
export function getDefaultPlaylistName(threadTitle: string): string {
  let name = threadTitle.trim();

  // Remove common Reddit prefixes
  const prefixPatterns = [
    /^\[.*?\]\s*/i, // [FRESH], [Discussion], etc.
    /^(daily|weekly|monthly)\s+(discussion|thread|playlist)\s*:?\s*/i,
    /^(what|which)\s+(are\s+)?(you|we)\s+(listening\s+to|playing)\s*/i,
    /^recommend(ation)?s?\s*(thread)?\s*:?\s*/i,
  ];

  for (const pattern of prefixPatterns) {
    name = name.replace(pattern, "");
  }

  // Truncate if too long (Spotify playlist names have a limit)
  if (name.length > 100) {
    name = name.substring(0, 97) + "...";
  }

  // Fallback if the name is empty or too short
  if (name.length < 3) {
    name = "Reddit Thread Playlist";
  }

  return name;
}

async function searchPlaylistItem(
  spotifyApi: SpotifyWebApi,
  item: PlaylistItem,
): Promise<string | null> {
  try {
    logger.info(
      `[buildPlaylistFromRedditThread] Searching for track: ${item.artist} - ${item.name}`,
    );
    const searchResult = await spotifyApi.searchTracks(
      `${item.artist} ${item.name}`,
    );

    if (
      !searchResult.body.tracks ||
      searchResult.body.tracks.items.length === 0
    ) {
      return null;
    }

    return searchResult.body.tracks.items[0].uri;
  } catch (error) {
    // @ts-expect-error Spotify API error
    const { message, statusCode } = error;

    switch (statusCode) {
      case 401:
        logger.warn(
          `[buildPlaylistFromRedditThread] Token expired. Refreshing token...`,
        );
        await spotifyApi.refreshAccessToken();
        break;
      case 429:
        logger.warn(`[buildPlaylistFromRedditThread] Rate limit reached.`);
        break;
      default:
        logger.warn(
          { err: error },
          `[buildPlaylistFromRedditThread] Error searching for track: ${message}`,
        );
        break;
    }

    throw error;
  }
}

export interface BuildPlaylistFromRedditThreadOptions {
  threadUrl: string;
  playlistName?: string;
}

export interface BuildPlaylistFromRedditThreadResult {
  playlistId: string;
  playlistUrl: string;
  trackCount: number;
}

/**
 * Builds a new Spotify playlist from a Reddit thread URL.
 * Extracts track recommendations from the thread title, body, and comments,
 * creates a new playlist, and adds the found tracks.
 */
export async function buildPlaylistFromRedditThread(
  options: BuildPlaylistFromRedditThreadOptions,
): Promise<BuildPlaylistFromRedditThreadResult> {
  const { threadUrl, playlistName: customPlaylistName } = options;

  // Get Spotify user ID from config
  const spotifyUserId = getSpotifyUserId();
  if (!spotifyUserId) {
    const message = `No spotifyUserId configured in config.yml`;
    logger.error(`[buildPlaylistFromRedditThread] ${message}`);
    throw new Error(message);
  }

  // Get authenticated Spotify API instance
  const spotifyApi = await spotifyApiService.getInstance(spotifyUserId);

  // Fetch the Reddit thread
  const threadData = await fetchRedditThread(threadUrl);

  // Determine playlist name
  const playlistName =
    customPlaylistName || getDefaultPlaylistName(threadData.title);

  logger.info(
    `[buildPlaylistFromRedditThread] Creating playlist: "${playlistName}"`,
  );

  // Combine all text content for extraction
  const allContent: string[] = [
    threadData.title,
    threadData.selftext,
    ...threadData.comments,
  ].filter((text) => text.trim().length > 0);

  logger.info(
    `[buildPlaylistFromRedditThread] Extracting tracks from ${allContent.length} text items...`,
  );

  // Extract playlist items in batches
  const contentBatches = _.chunk(allContent, CONTENT_BATCH_SIZE);
  const allPlaylistItems: PlaylistItem[] = [];

  for (let i = 0; i < contentBatches.length; i++) {
    const batchItems = await playlistItemsService.getPlaylistItemsFromText(
      contentBatches[i],
      EntityType.TRACKS,
    );
    allPlaylistItems.push(...batchItems);
    logger.info(
      `[buildPlaylistFromRedditThread] Extracted ${batchItems.length} items from batch ${i + 1}/${contentBatches.length}`,
    );

    // Rate limiting: wait between AI calls
    if (i < contentBatches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  // Deduplicate
  const playlistItems = playlistItemsHelpers.dedupePlaylistItems(allPlaylistItems);

  logger.info(
    `[buildPlaylistFromRedditThread] Found ${playlistItems.length} unique tracks`,
  );

  if (playlistItems.length === 0) {
    throw new Error("No tracks found in the Reddit thread");
  }

  // Search for tracks on Spotify
  const trackUriSet = new Set<string>();
  for (const playlistItem of playlistItems) {
    try {
      const trackUri = await backOff(
        async () => searchPlaylistItem(spotifyApi, playlistItem),
        { numOfAttempts: 5 },
      );
      if (trackUri) {
        trackUriSet.add(trackUri);
      }
    } catch {
      logger.warn(
        playlistItem,
        `[buildPlaylistFromRedditThread] Error finding track.`,
      );
    }
  }

  if (!trackUriSet.size) {
    const message = `No tracks found on Spotify.`;
    logger.error(`[buildPlaylistFromRedditThread] ${message}`);
    throw new Error(message);
  }

  logger.info(
    `[buildPlaylistFromRedditThread] Found ${trackUriSet.size} tracks on Spotify.`,
  );

  // Create the playlist
  const createPlaylistResponse = await spotifyApi.createPlaylist(playlistName, {
    description: `Created from Reddit thread: ${threadUrl}`,
    public: false,
  });

  const playlistId = createPlaylistResponse.body.id;
  const playlistUrl =
    createPlaylistResponse.body.external_urls?.spotify ||
    `https://open.spotify.com/playlist/${playlistId}`;

  logger.info(
    `[buildPlaylistFromRedditThread] Created playlist: ${playlistId}`,
  );

  // Add tracks to the playlist (in chunks of 100)
  const chunkedTrackUris: string[][] = _.chain(Array.from(trackUriSet))
    .compact()
    .shuffle()
    .chunk(100)
    .value();

  for (let i = 0; i < chunkedTrackUris.length; i++) {
    await spotifyApi.addTracksToPlaylist(playlistId, chunkedTrackUris[i]);
  }

  logger.info(
    `[buildPlaylistFromRedditThread] Added ${trackUriSet.size} tracks to playlist.`,
  );

  return {
    playlistId,
    playlistUrl,
    trackCount: trackUriSet.size,
  };
}
