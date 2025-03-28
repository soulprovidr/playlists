import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Route, Router, Switch } from "wouter";
import { DashboardView } from "./components/dashboard";
import { IndexPage } from "./pages/index";

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={IndexPage} />
        <Route path="/playlists" nest>
          <Switch>
            <Route path="/" component={DashboardView} />
            {/* <Route path="/create" component={PlaylistCreatePage} /> */}
            {/* <Route path="/:id" component={PlaylistsShowPage} /> */}
            <Route>
              <Redirect to="~/" />
            </Route>
          </Switch>
        </Route>
      </Router>
    </QueryClientProvider>
  );
};
