import { PlaylistConfigsTable } from "@modules/playlist-configs/playlist-configs.types";
import { PlaylistSourcesTable } from "@modules/playlist-sources/playlist-sources.types";
import { SpotifyAccessTokensTable } from "@modules/spotify/spotify-access-tokens/spotify-access-tokens.types";
import { Kysely } from "kysely";
import { dialect, plugins } from "../kysely.config";

export const database = new Kysely<{
  playlistConfigs: PlaylistConfigsTable;
  playlistSources: PlaylistSourcesTable;
  spotifyAccessTokens: SpotifyAccessTokensTable;
}>({ dialect, plugins });

export * from "@database/database.helpers";
