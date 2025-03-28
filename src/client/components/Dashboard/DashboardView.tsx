import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import _ from "lodash";
import { Layout } from "../Layout";
import { DashboardEmpty } from "./DashboardEmpty";
import { DashboardList } from "./DashboardList";

export const DashboardView = () => {
  const { data: playlistConfigs } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => axios.get("/api/dashboard").then(({ data }) => data),
  });

  return (
    <Layout>
      {_.isEmpty(playlistConfigs) ? (
        <DashboardEmpty />
      ) : (
        <DashboardList playlistConfigs={playlistConfigs} />
      )}
    </Layout>
  );
};
