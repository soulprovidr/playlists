import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import * as playlistSourcesService from "@modules/playlist-sources/playlist-sources.service";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import _ from "lodash";
import { DashboardPlaylist } from "./dashboard.types";

export const getDashboardViewResponse = async (
  userId: number,
): Promise<DashboardPlaylist[]> => {
  const playlistConfigs =
    await playlistConfigsService.getPlaylistConfigsByUserId(userId);

  const playlistConfigIds = _.map(playlistConfigs, (x) => x.id);
  const spotifyPlaylistIds = _.map(playlistConfigs, (x) => x.spotifyPlaylistId);

  const playlistConfigSources =
    await playlistSourcesService.getPlaylistSourcesByPlaylistConfigIds(
      playlistConfigIds,
    );
  const playlistSourcesByPlaylistConfigId = _.groupBy(
    playlistConfigSources,
    (x) => x.playlistConfigId,
  );

  const spotifyApi = await spotifyApiService.getInstance(userId);
  const spotifyPlaylistResponses = await Promise.all(
    _.map(spotifyPlaylistIds, (spotifyPlaylistId) =>
      spotifyApi.getPlaylist(spotifyPlaylistId),
    ),
  );
  const spotifyPlaylistsBySpotifyPlaylistId = _.chain(spotifyPlaylistResponses)
    .map((x) => x.body)
    .keyBy((x) => x.id)
    .value();

  const dashboardPlaylists = _.map(playlistConfigs, (playlistConfig) => {
    const playlistSources =
      playlistSourcesByPlaylistConfigId[playlistConfig.id];
    const spotifyPlaylist =
      spotifyPlaylistsBySpotifyPlaylistId[playlistConfig.spotifyPlaylistId];
    return {
      id: playlistConfig.id,
      description: playlistConfig.description,
      imageUrl: spotifyPlaylist?.images[0].url,
      userId: playlistConfig.userId,
      name: playlistConfig.name,
      spotifyPlaylistId: playlistConfig.spotifyPlaylistId,
      buildStatus: playlistConfig.buildStatus,
      buildCadence: playlistConfig.buildCadence,
      buildDay: playlistConfig.buildDay,
      createdAt: playlistConfig.createdAt,
      updatedAt: playlistConfig.updatedAt,
      sources: playlistSources,
      trackCount: spotifyPlaylist?.tracks.total ?? 0,
    } as DashboardPlaylist;
  });

  return dashboardPlaylists;
};
