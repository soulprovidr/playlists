import { ColumnType, Generated, Insertable, Selectable } from "kysely";

export interface SpotifyUsersTable {
  id: Generated<number>;
  spotifyUserId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: ColumnType<string, never, never>;
}

export type SpotifyUser = Selectable<SpotifyUsersTable>;
export type SpotifyUserInsert = Insertable<SpotifyUsersTable>;
export type SpotifyUserUpdate = Partial<SpotifyUserInsert>;
