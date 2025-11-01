import { api } from "../../lib/api";

export const logout = async (): Promise<boolean> => {
  const response = await api.post("/auth/logout");
  return response.status === 200;
};
