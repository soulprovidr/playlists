import { database } from "@database";
import { PlaylistSourceTemplate } from "./playlist-source-templates.types";

export const getPlaylistSourceTemplates = (): Promise<
  PlaylistSourceTemplate[]
> => {
  return database
    .selectFrom("playlistSourceTemplates")
    .selectAll("playlistSourceTemplates")
    .execute();
};
