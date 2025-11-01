import { AppProvider } from "./provider";
import { AppRoutes } from "./routes";

export const App = () => (
  <AppProvider>
    <AppRoutes />
  </AppProvider>
);
