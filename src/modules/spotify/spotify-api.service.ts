import * as databaseHelpers from "@database/database.helpers";
import { env } from "@env";
import { Instant, ZoneId } from "@js-joda/core";
import { logger } from "@logger";
import * as spotifyAccessTokensService from "@modules/spotify/spotify-access-tokens/spotify-access-tokens.service";
import SpotifyWebApi from "spotify-web-api-node";

export async function getInstance(
  spotifyUserId?: string,
): Promise<SpotifyWebApi> {
  const spotifyApi = new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    redirectUri: env.SPOTIFY_REDIRECT_URI,
  });

  if (!spotifyUserId) {
    return spotifyApi;
  }

  const spotifyAccessToken =
    await spotifyAccessTokensService.getSpotifyAccessTokenBySpotifyUserId(
      spotifyUserId,
    );

  if (spotifyAccessToken) {
    spotifyApi.setCredentials({
      accessToken: spotifyAccessToken.accessToken,
      refreshToken: spotifyAccessToken.refreshToken,
    });

    const expiresAt = databaseHelpers.getZonedDateTimeFromDatabaseTimestamp(
      spotifyAccessToken.expiresAt,
    );
    const now = Instant.now().atZone(ZoneId.UTC);
    if (expiresAt && expiresAt.isBefore(now)) {
      console.log("Refreshing access token...");
      const res = await spotifyApi.refreshAccessToken();
      if (res.statusCode === 200) {
        await spotifyAccessTokensService.upsertSpotifyAccessToken({
          id: spotifyAccessToken.id,
          spotifyUserId: spotifyAccessToken.spotifyUserId,
          accessToken: res.body.access_token,
          refreshToken:
            res.body.refresh_token || spotifyAccessToken.refreshToken,
          expiresAt: databaseHelpers.getDatabaseTimestampFromInstant(
            Instant.now().plusSeconds(res.body.expires_in),
          ),
        });
      } else {
        throw new Error("Failed to refresh access token.");
      }
    }
  }

  return spotifyApi;
}

/**
 * Searches for an album by artist and album name, then returns the most popular track URI from that album.
 * @param spotifyApi - An authenticated SpotifyWebApi instance
 * @param artist - The artist name
 * @param albumName - The album name
 * @returns The URI of the most popular track from the album, or null if not found
 */
export async function getMostPopularTrackFromAlbum(
  spotifyApi: SpotifyWebApi,
  artist: string,
  albumName: string,
): Promise<string | null> {
  try {
    // Search for the album
    const searchResult = await spotifyApi.searchAlbums(
      `artist:${artist} album:${albumName}`,
    );

    if (
      !searchResult.body.albums ||
      searchResult.body.albums.items.length === 0
    ) {
      logger.warn(`[spotify] No album found for: ${artist} - ${albumName}`);
      return null;
    }

    const album = searchResult.body.albums.items[0];
    logger.info(
      `[spotify] Found album: ${album.name} by ${album.artists.map((a) => a.name).join(", ")}`,
    );

    // Get the album's tracks
    const albumTracks = await spotifyApi.getAlbumTracks(album.id);

    if (!albumTracks.body.items || albumTracks.body.items.length === 0) {
      logger.warn(`[spotify] No tracks found for album: ${album.name}`);
      return null;
    }

    // Get full track details to access popularity
    const trackIds = albumTracks.body.items.map((track) => track.id);
    const tracksDetails = await spotifyApi.getTracks(trackIds);

    if (!tracksDetails.body.tracks || tracksDetails.body.tracks.length === 0) {
      logger.warn(
        `[spotify] Could not get track details for album: ${album.name}`,
      );
      return null;
    }

    // Find the most popular track
    const mostPopularTrack = tracksDetails.body.tracks.reduce(
      (mostPopular, track) => {
        if (!track) return mostPopular;
        if (!mostPopular || track.popularity > mostPopular.popularity) {
          return track;
        }
        return mostPopular;
      },
      null as SpotifyApi.TrackObjectFull | null,
    );

    if (!mostPopularTrack) {
      logger.warn(
        `[spotify] Could not determine most popular track for album: ${album.name}`,
      );
      return null;
    }

    logger.info(
      `[spotify] Selected most popular track: ${mostPopularTrack.name} (popularity: ${mostPopularTrack.popularity})`,
    );

    return mostPopularTrack.uri;
  } catch (error) {
    logger.error(
      { err: error },
      `[spotify] Error getting most popular track from album: ${artist} - ${albumName}`,
    );
    return null;
  }
}
