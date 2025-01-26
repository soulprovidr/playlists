import { Generated, Insertable, Selectable } from "kysely";

export interface SpotifyUsersTable {
  id: Generated<number>;
  spotify_id: string;
  display_name: string;
  email: string;
  image_url: string | null;
}

export type SpotifyUser = Selectable<SpotifyUsersTable>;
export type SpotifyUserInsert = Insertable<SpotifyUsersTable>;
export type SpotifyUserUpdate = Partial<SpotifyUserInsert>;
