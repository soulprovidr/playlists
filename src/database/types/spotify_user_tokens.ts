import { Generated, Insertable, Selectable } from "kysely";

export interface SpotifyUserTokensTable {
  id: Generated<number>;
  spotify_user_id: number | null;
  access_token: string;
  refresh_token: string;
}

export type SpotifyUserToken = Selectable<SpotifyUserTokensTable>;
export type SpotifyUserTokenInsert = Insertable<SpotifyUserTokensTable>;
export type SpotifyUserTokenUpdate = Partial<SpotifyUserTokenInsert>;
