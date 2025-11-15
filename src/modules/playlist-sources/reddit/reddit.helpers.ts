import {
  RedditSourceConfig,
  RedditSourceType,
} from "../playlist-sources.types";
import { RedditValidationResult } from "./reddit.types";

/**
 * Validates a Reddit URL and extracts the source configuration
 * Supports:
 * - Subreddit URLs: https://reddit.com/r/subreddit or https://www.reddit.com/r/subreddit
 * - User URLs: https://reddit.com/user/username, https://reddit.com/u/username
 */
export const validateRedditUrl = (url: string): RedditValidationResult => {
  try {
    const parsedUrl = new URL(url);

    // Check if it's a Reddit domain
    if (
      parsedUrl.hostname !== "reddit.com" &&
      parsedUrl.hostname !== "www.reddit.com"
    ) {
      return {
        valid: false,
        error: "URL must be from reddit.com",
      };
    }

    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

    // Check for subreddit: /r/subreddit
    if (pathParts[0] === "r" && pathParts[1]) {
      return {
        valid: true,
        config: {
          type: RedditSourceType.SUBREDDIT,
          value: pathParts[1],
        },
      };
    }

    // Check for user: /user/username or /u/username
    if ((pathParts[0] === "user" || pathParts[0] === "u") && pathParts[1]) {
      return {
        valid: true,
        config: {
          type: RedditSourceType.USER,
          value: pathParts[1],
        },
      };
    }

    return {
      valid: false,
      error:
        "Invalid Reddit URL. Must be a subreddit (/r/...) or user (/user/... or /u/...)",
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid URL format",
    };
  }
};

/**
 * Checks if a URL is a Reddit URL
 */
export const isRedditUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === "reddit.com" ||
      parsedUrl.hostname === "www.reddit.com"
    );
  } catch {
    return false;
  }
};

/**
 * Gets the Reddit API URL for a given config
 */
export const getRedditSourceUrl = (config: RedditSourceConfig): string => {
  switch (config.type) {
    case RedditSourceType.SUBREDDIT: {
      return `https://www.reddit.com/r/${config.value}.json`;
    }
    case RedditSourceType.USER: {
      return `https://www.reddit.com/user/${config.value}.json`;
    }
    default:
      throw new Error(`Unsupported Reddit source type: ${config.type}`);
  }
};
