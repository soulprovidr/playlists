import { SpotifyUserTokensTable } from "./spotify_user_tokens";
import { SpotifyUsersTable } from "./spotify_users";

export interface Database {
  spotify_users: SpotifyUsersTable;
  spotify_user_tokens: SpotifyUserTokensTable;
}
