import { logger } from "@logger";
import {
  BuildCadence,
  EntityType,
} from "@modules/playlist-configs/playlist-configs.types";
import {
  PlaylistSourceType,
  RedditSourceConfig,
  RedditSourceType,
  RssSourceConfig,
} from "@modules/playlist-sources/playlist-sources.types";
import yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";

const CONFIG_FILE_NAME = "config.yml";

/**
 * Grouped sources configuration as defined in config.yml
 * - reddit: list of subreddit names (strings)
 * - rss: list of feed URLs (strings)
 */
export interface ConfigPlaylistSources {
  reddit?: string[];
  rss?: string[];
}

/**
 * Flattened source with type for internal use
 */
export interface ConfigPlaylistSource {
  type: PlaylistSourceType;
  config: RedditSourceConfig | RssSourceConfig;
}

/**
 * Playlist configuration as defined in config.yml
 */
export interface ConfigPlaylist {
  name: string;
  spotifyPlaylistId: string;
  buildCadence?: BuildCadence;
  buildDay?: string | null;
  entityType?: EntityType;
  sources?: ConfigPlaylistSources;
}

/**
 * Root configuration structure for config.yml
 */
export interface AppConfig {
  spotifyUserId: string;
  playlists: ConfigPlaylist[];
}

/**
 * Get the path to the config.yml file
 */
function getConfigPath(): string {
  return path.resolve(process.cwd(), CONFIG_FILE_NAME);
}

/**
 * Load and parse the config.yml file
 */
export function loadConfig(): AppConfig {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    logger.warn(
      `[config] Config file not found at ${configPath}, using empty config`,
    );
    return { spotifyUserId: "", playlists: [] };
  }

  try {
    const fileContents = fs.readFileSync(configPath, "utf8");
    const config = yaml.load(fileContents) as AppConfig;

    if (!config) {
      logger.info("[config] Empty config.yml");
      return { spotifyUserId: "", playlists: [] };
    }

    return {
      spotifyUserId: config.spotifyUserId ?? "",
      playlists: config.playlists ?? [],
    };
  } catch (error) {
    logger.error({ err: error }, "[config] Failed to parse config.yml");
    throw error;
  }
}

/**
 * Get the Spotify user ID from config.yml
 */
export function getSpotifyUserId(): string {
  const config = loadConfig();
  return config.spotifyUserId;
}

/**
 * Get all playlist configurations from config.yml
 */
export function getConfigPlaylists(): ConfigPlaylist[] {
  const config = loadConfig();
  return config.playlists;
}

/**
 * Flatten grouped sources into an array with type information
 * - Reddit strings become RedditSourceConfig with type "subreddit"
 * - RSS strings become RssSourceConfig with feedUrl
 */
export function flattenSources(
  sources: ConfigPlaylistSources | undefined,
): ConfigPlaylistSource[] {
  if (!sources) {
    return [];
  }

  const flattened: ConfigPlaylistSource[] = [];

  if (sources.reddit) {
    for (const subreddit of sources.reddit) {
      const config: RedditSourceConfig = {
        type: RedditSourceType.SUBREDDIT,
        value: subreddit,
      };
      flattened.push({ type: PlaylistSourceType.REDDIT, config });
    }
  }

  if (sources.rss) {
    for (const feedUrl of sources.rss) {
      const config: RssSourceConfig = { feedUrl };
      flattened.push({ type: PlaylistSourceType.RSS, config });
    }
  }

  return flattened;
}
