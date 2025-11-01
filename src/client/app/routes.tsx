import { Route, Switch } from "wouter";
import { LoginView, LogoutView } from "../features/auth";
import { DashboardView } from "../features/dashboard";
import { PlaylistView } from "../features/playlists";

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

    <Route path="/playlists/:playlistId">
      {(params) => <PlaylistView playlistId={params.playlistId} />}
    </Route>
  </Switch>
);
