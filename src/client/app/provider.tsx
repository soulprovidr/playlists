import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient();

export const AppProvider = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
