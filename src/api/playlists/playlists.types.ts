import { BuildStatus } from "@modules/playlist-configs/playlist-configs.types";
import { PlaylistSource } from "@modules/playlist-sources/playlist-sources.types";

export interface PlaylistViewResponse {
  id: number;
  userId: number;
  name: string;
  imageUrl: string | undefined;
  description: string;
  spotifyPlaylistId: string;
  buildStatus: BuildStatus;
  createdAt: string;
  updatedAt: string;
  sources: PlaylistSource[];
  tracks: SpotifyApi.PlaylistTrackResponse["items"];
}
