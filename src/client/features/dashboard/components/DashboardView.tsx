import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { Layout } from "../../../components/layout";
import * as dashboardService from "../dashboard.service";
import { DashboardEmpty } from "./DashboardEmpty";
import { DashboardList } from "./DashboardList";

export const DashboardView = () => {
  const { data: dashboardPlaylists, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getDashboardView,
    initialData: [],
  });

  console.log(dashboardPlaylists);

  let children = null;

  if (!isLoading && _.isEmpty(dashboardPlaylists)) {
    children = <DashboardEmpty />;
  } else if (!_.isEmpty(dashboardPlaylists)) {
    children = <DashboardList dashboardPlaylists={dashboardPlaylists} />;
  }

  return <Layout>{children}</Layout>;
};
