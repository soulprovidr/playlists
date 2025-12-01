import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { Layout } from "../../../components/Layout";
import { LoadingView } from "../../../components/LoadingView";
import * as dashboardService from "../dashboard.service";
import { DashboardEmpty } from "./DashboardEmpty";
import { DashboardList } from "./DashboardList";

export const DashboardView = () => {
  const { data: dashboardPlaylists, isFetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getDashboardView,
    initialData: [],
    refetchOnWindowFocus: false,
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
