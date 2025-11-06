import { Generated, Insertable, JSONColumnType, Selectable } from "kysely";

export enum PlaylistSourceType {
  REDDIT = "reddit",
  RSS = "rss",
}

// TODO: Move source type configs to their own domains?
export enum RedditSourceType {
  SUBREDDIT = "subreddit",
  USER = "user",
}

export interface RedditSourceConfig {
  type: RedditSourceType;
  value: string;
}

export interface RssSourceConfig {
  feedUrl: string;
}

export type PlaylistSourceConfig = RedditSourceConfig | RssSourceConfig;

export interface PlaylistSourcesTable {
  id: Generated<number>;
  playlistConfigId: number;
  type: PlaylistSourceType;
  config: JSONColumnType<PlaylistSourceConfig>;
}

export type PlaylistSource = Selectable<PlaylistSourcesTable>;
export type PlaylistSourceInsert = Insertable<PlaylistSourcesTable>;
export type PlaylistSourceUpdate = Partial<PlaylistSourceInsert>;
