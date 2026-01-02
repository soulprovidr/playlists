import { ColumnType, Generated, Insertable, Selectable } from "kysely";

export enum BuildCadence {
  NONE = "NONE",
  WEEKLY = "WEEKLY",
}

export enum BuildStatus {
  UNSTARTED = "UNSTARTED",
  IN_PROGRESS = "IN_PROGRESS",
  ERRORED = "ERRORED",
  COMPLETED = "COMPLETED",
}

export enum EntityType {
  ALBUMS = "ALBUMS",
  TRACKS = "TRACKS",
}

export interface PlaylistConfigsTable {
  id: Generated<number>;
  name: string;
  spotifyPlaylistId: string;
  buildStatus: ColumnType<BuildStatus, BuildStatus | undefined, BuildStatus>;
  buildCadence: ColumnType<
    BuildCadence,
    BuildCadence | undefined,
    BuildCadence
  >;
  buildDay: string | null;
  lastBuiltDate: string | null;
  entityType: ColumnType<EntityType, EntityType | undefined, EntityType>;
  createdAt: ColumnType<string, never, never>;
  updatedAt: ColumnType<string, never, never>;
}

export type PlaylistConfig = Selectable<PlaylistConfigsTable>;
export type PlaylistConfigInsert = Insertable<PlaylistConfigsTable>;
export type PlaylistConfigUpdate = Partial<PlaylistConfigInsert>;
