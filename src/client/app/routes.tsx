import { Route, Switch } from "wouter";
import { LoginView, LogoutView } from "../features/auth";
import { DashboardView } from "../features/dashboard";
import { PlaylistView, UpsertPlaylistView } from "../features/playlists";

export const AppRoutes = () => (
  <Switch>
    <Route path="/login">
      <LoginView />
    </Route>

    <Route path="/logout">
      <LogoutView />
    </Route>

    <Route path="/">
      <DashboardView />
    </Route>

    <Route path="/playlists/new">
      <UpsertPlaylistView />
    </Route>

    <Route path="/playlists/:playlistId/edit">
      {(params) => <UpsertPlaylistView playlistId={params.playlistId} />}
    </Route>

    <Route path="/playlists/:playlistId">
      {(params) => <PlaylistView playlistId={params.playlistId} />}
    </Route>
  </Switch>
);
