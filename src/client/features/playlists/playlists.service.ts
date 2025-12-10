import { PlaylistViewResponse } from "@api/playlists/playlists.types";
import { api } from "../../lib/api";

export const getPlaylistView = async (
  playlistId: string,
): Promise<PlaylistViewResponse> => {
  const response = await api.get<PlaylistViewResponse>(
    `/playlists/${playlistId}`,
  );
  return response.data;
};

export const buildPlaylist = async (playlistId: number): Promise<void> => {
  await api.post(`/playlists/${playlistId}/build`);
};

export interface UpsertPlaylistRequest {
  name: string;
  description: string;
  sources: Array<{
    type: string;
    config: {
      type?: string;
      value?: string;
      feedUrl?: string;
    };
  }>;
  buildCadence?: string;
  buildDay?: string | null;
}

export const upsertPlaylist = async (
  playlistId: string | undefined,
  data: UpsertPlaylistRequest,
): Promise<PlaylistViewResponse> => {
  const endpoint = playlistId ? `/playlists/${playlistId}` : "/playlists";
  const response = await api.post<PlaylistViewResponse>(endpoint, data);
  return response.data;
};
