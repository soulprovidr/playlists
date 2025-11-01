import * as playlistSourceTemplatesRepo from "./playlist-source-templates.repo";
import { PlaylistSourceTemplate } from "./playlist-source-templates.types";

export const getPlaylistSourceTemplates = (): Promise<
  PlaylistSourceTemplate[]
> => {
  return playlistSourceTemplatesRepo.getPlaylistSourceTemplates();
};
