import { Generated, Insertable, JSONColumnType, Selectable } from "kysely";
import {
  PlaylistSourceConfig,
  PlaylistSourceType,
} from "../playlist-sources.types";

export interface PlaylistSourceTemplatesTable {
  id: Generated<number>;
  playlistConfigId: number;
  name: string;
  description: string;
  type: PlaylistSourceType;
  config: JSONColumnType<PlaylistSourceConfig>;
}

export type PlaylistSourceTemplate = Selectable<PlaylistSourceTemplatesTable>;
export type PlaylistSourceTemplateInsert =
  Insertable<PlaylistSourceTemplatesTable>;
export type PlaylistSourceTemplateUpdate =
  Partial<PlaylistSourceTemplateInsert>;
