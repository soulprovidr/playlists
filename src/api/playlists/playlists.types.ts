import {
  BuildCadence,
  BuildStatus,
} from "@modules/playlist-configs/playlist-configs.types";
import { PlaylistSource } from "@modules/playlist-sources/playlist-sources.types";

export interface PlaylistViewResponse {
  id: number;
  userId: number;
  name: string;
  imageUrl: string | undefined;
  description: string;
  spotifyPlaylistId: string;
  buildStatus: BuildStatus;
  buildCadence: BuildCadence;
  buildDay: string | null;
  lastBuiltDate: string | null;
  createdAt: string;
  updatedAt: string;
  sources: PlaylistSource[];
  tracks: SpotifyApi.PlaylistTrackResponse["items"];
}
