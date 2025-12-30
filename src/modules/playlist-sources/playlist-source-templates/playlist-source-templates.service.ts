import * as playlistSourceTemplatesRepo from "./playlist-source-templates.repo";
import { PlaylistSourceTemplate } from "./playlist-source-templates.types";

export function getPlaylistSourceTemplates(): Promise<
  PlaylistSourceTemplate[]
> {
  return playlistSourceTemplatesRepo.getPlaylistSourceTemplates();
}
