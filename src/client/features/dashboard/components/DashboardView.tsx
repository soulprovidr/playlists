import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { LoadingView } from "../../../components/LoadingView";
import { Layout } from "../../../components/layout";
import * as dashboardService from "../dashboard.service";
import { DashboardEmpty } from "./DashboardEmpty";
import { DashboardList } from "./DashboardList";

export const DashboardView = () => {
  const { data: dashboardPlaylists, isFetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getDashboardView,
    initialData: [],
  });

  let children = null;

  if (isFetching) {
    children = <LoadingView />;
  } else if (_.isEmpty(dashboardPlaylists)) {
    children = <DashboardEmpty />;
  } else {
    children = <DashboardList dashboardPlaylists={dashboardPlaylists} />;
  }

  return <Layout>{children}</Layout>;
};
