import { ColumnType, Generated, Insertable, Selectable } from "kysely";

export enum PlaylistConfigRepeat {
  NONE = "none",
  WEEKLY = "weekly",
}

export enum PlaylistSourceType {
  REDDIT = "reddit",
}

export enum BuildStatus {
  UNSTARTED = "UNSTARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface PlaylistConfigsTable {
  id: Generated<number>;
  userId: number;
  name: string;
  description: string;
  spotifyPlaylistId: string;
  buildStatus: ColumnType<BuildStatus, BuildStatus | undefined, BuildStatus>;
  createdAt: ColumnType<string, never, never>;
  updatedAt: ColumnType<string, never, never>;
}

export type PlaylistConfig = Selectable<PlaylistConfigsTable>;
export type PlaylistConfigInsert = Insertable<PlaylistConfigsTable>;
export type PlaylistConfigUpdate = Partial<PlaylistConfigInsert>;
