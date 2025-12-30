import {
  PlaylistSourceConfig,
  PlaylistSourceType,
} from "./playlist-sources.types";
import * as redditHelpers from "./reddit/reddit.helpers";
import * as rssHelpers from "./rss/rss.helpers";

// Re-export helpers from source-specific modules
export {
  getRedditSourceUrl,
  isRedditUrl,
  validateRedditUrl,
} from "./reddit/reddit.helpers";
export { isLikelyRssFeed, validateRssUrl } from "./rss/rss.helpers";

export interface PlaylistSourceValidationResult {
  valid: boolean;
  type?: PlaylistSourceType;
  config?: PlaylistSourceConfig;
  error?: string;
}

/**
 * Main validation function that determines the source type and validates accordingly
 * Attempts to validate as Reddit first, then falls back to RSS
 */
export async function validatePlaylistSourceUrl(
  url: string,
): Promise<PlaylistSourceValidationResult> {
  try {
    // Validate URL format
    new URL(url);
  } catch {
    return {
      valid: false,
      error: "Invalid URL format",
    };
  }

  // Check if it's a Reddit URL
  if (redditHelpers.isRedditUrl(url)) {
    const result = redditHelpers.validateRedditUrl(url);
    if (result.valid && result.config) {
      return {
        valid: true,
        type: PlaylistSourceType.REDDIT,
        config: result.config,
      };
    }
    return {
      valid: false,
      error: result.error || "Invalid Reddit URL",
    };
  }

  // Try validating as RSS feed
  const rssResult = await rssHelpers.validateRssUrl(url);
  if (rssResult.valid && rssResult.config) {
    return {
      valid: true,
      type: PlaylistSourceType.RSS,
      config: rssResult.config,
    };
  }

  return {
    valid: false,
    error:
      rssResult.error ||
      "URL does not appear to be a valid Reddit URL or RSS feed. Supported formats: Reddit subreddit/user URLs or RSS feed URLs",
  };
}
