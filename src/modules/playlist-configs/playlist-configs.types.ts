import { ColumnType, Generated, Insertable, Selectable } from "kysely";

export enum BuildCadence {
  NONE = "NONE",
  WEEKLY = "WEEKLY",
}

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
  ERRORED = "ERRORED",
  COMPLETED = "COMPLETED",
}

export interface PlaylistConfigsTable {
  id: Generated<number>;
  userId: number;
  name: string;
  description: string;
  spotifyPlaylistId: string;
  buildStatus: ColumnType<BuildStatus, BuildStatus | undefined, BuildStatus>;
  buildCadence: ColumnType<
    BuildCadence,
    BuildCadence | undefined,
    BuildCadence
  >;
  buildDay: string | null;
  createdAt: ColumnType<string, never, never>;
  updatedAt: ColumnType<string, never, never>;
}

export type PlaylistConfig = Selectable<PlaylistConfigsTable>;
export type PlaylistConfigInsert = Insertable<PlaylistConfigsTable>;
export type PlaylistConfigUpdate = Partial<PlaylistConfigInsert>;
