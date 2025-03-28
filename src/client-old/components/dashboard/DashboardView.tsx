import { Layout } from "components/layout";
import { DashboardEmpty } from "./DashboardEmpty";
// import { DashboardList } from "./dashboard-list";

export const DashboardView = () => {
  return (
    <Layout>
      <DashboardEmpty />
      {/* {_.isEmpty(playlistConfigs) ? (
        <DashboardEmpty />
      ) : (
        <DashboardList playlistConfigs={playlistConfigs!} />
      )} */}
    </Layout>
  );
};
