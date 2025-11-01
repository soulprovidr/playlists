import { getCurrentUser } from "@context";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import * as playlistSourcesService from "@modules/playlist-sources/playlist-sources.service";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import { buildPlaylist } from "@tasks/build-playlist";
import _ from "lodash";
import { PlaylistViewResponse } from "./playlists.types";

export const buildPlaylistByPlaylistConfigId = async (
  playlistConfigId: number,
): Promise<boolean | undefined> => {
  const currentUser = getCurrentUser();
  const playlistConfig =
    await playlistConfigsService.getPlaylistConfigById(playlistConfigId);

  if (!currentUser) {
    throw new Error("No authenticated user.");
  }

  if (!playlistConfig) {
    throw new Error("Playlist config not found");
  }

  if (playlistConfig.userId !== currentUser.id) {
    throw new Error("Unauthorized");
  }

  await buildPlaylist(playlistConfig.id);

  return true;
};

export const getPlaylistView = async (
  playlistConfigId: number,
): Promise<PlaylistViewResponse | undefined> => {
  const playlistConfig =
    await playlistConfigsService.getPlaylistConfigById(playlistConfigId);

  if (!playlistConfig) {
    return undefined;
  }

  const playlistSources =
    await playlistSourcesService.getPlaylistSourcesByPlaylistConfigIds([
      playlistConfig.id,
    ]);
  const spotifyApi = await spotifyApiService.getInstance(playlistConfig.userId);
  const { body: playlist } = await spotifyApi.getPlaylist(
    playlistConfig.spotifyPlaylistId,
  );

  return {
    id: playlistConfig.id,
    userId: playlistConfig.userId,
    name: playlistConfig.name,
    imageUrl: _.first(playlist.images)?.url,
    description: playlistConfig.description,
    spotifyPlaylistId: playlistConfig.spotifyPlaylistId,
    createdAt: playlistConfig.createdAt,
    updatedAt: playlistConfig.updatedAt,
    sources: playlistSources,
    tracks: playlist.tracks.items,
  };
};
