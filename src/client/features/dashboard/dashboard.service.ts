import { DashboardPlaylist } from "@api/dashboard/dashboard.types";
import { api } from "../../lib/api";

export const getDashboardView = async (): Promise<DashboardPlaylist[]> => {
  const response = await api.get("/dashboard");
  return response.data;
};
