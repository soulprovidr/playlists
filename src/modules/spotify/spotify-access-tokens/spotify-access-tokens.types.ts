import { ColumnType, Generated, Insertable, Selectable } from "kysely";

export interface SpotifyAccessTokensTable {
  id: Generated<number>;
  spotifyUserId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: ColumnType<string, never, never>;
  updatedAt: ColumnType<string, never, never>;
}

export type SpotifyAccessToken = Selectable<SpotifyAccessTokensTable>;
export type SpotifyAccessTokenInsert = Insertable<SpotifyAccessTokensTable>;
export type SpotifyAccessTokenUpdate = Partial<SpotifyAccessTokenInsert>;
