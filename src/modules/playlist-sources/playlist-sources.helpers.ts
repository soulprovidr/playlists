import { RedditSourceConfig, RedditSourceType } from "./playlist-sources.types";

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
