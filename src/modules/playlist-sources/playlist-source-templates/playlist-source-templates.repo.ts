import { database } from "@database";
import { PlaylistSourceTemplate } from "./playlist-source-templates.types";

export function getPlaylistSourceTemplates(): Promise<
  PlaylistSourceTemplate[]
> {
  return database
    .selectFrom("playlistSourceTemplates")
    .selectAll("playlistSourceTemplates")
    .execute();
}
