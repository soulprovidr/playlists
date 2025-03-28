import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import { DashboardView } from "./components/Dashboard";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PlaylistView } from "./components/Playlist";
import "./scss/styles.scss";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <Switch>
      <Route path="/">
        <DashboardView />
      </Route>
      <Route path="/playlists/:id">
        <PlaylistView />
      </Route>
    </Switch>
  </QueryClientProvider>
);

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
