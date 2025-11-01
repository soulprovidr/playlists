import { DashboardPlaylist } from "@api/dashboard/dashboard.types";
import * as databaseHelpers from "@database/database.helpers";
import * as datesHelpers from "@lib/dates";
import { Link } from "wouter";

interface DashboardListProps {
  dashboardPlaylists: DashboardPlaylist[];
}

export const DashboardList = ({ dashboardPlaylists }: DashboardListProps) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-light tracking-tight">My Playlists</h1>
        <Link className="link link-primary text-sm" href="/create">
          + Create playlist
        </Link>
      </div>

      <ul className="list bg-base-100 rounded-box">
        {dashboardPlaylists.map((playlistConfig) => {
          const createdAt =
            databaseHelpers.getZonedDateTimeFromDatabaseTimestamp(
              playlistConfig.createdAt,
            );
          const formattedCreatedAt = datesHelpers.formatZonedDateTime(
            createdAt!,
            "LLL d, yyyy",
          );
          return (
            <Link
              href={`/playlists/${playlistConfig.id}`}
              key={playlistConfig.id}
              asChild
            >
              <li className="list-row flex items-start gap-6 px-6 py-6 border-b border-base-300 last:border-b-0 hover:bg-base-200 transition-colors duration-150 cursor-pointer group">
                <img
                  src={playlistConfig.imageUrl || "/img/default-cover.png"}
                  className="rounded-box size-12"
                  alt={playlistConfig.name}
                />
                <div className="flex flex-col flex-1">
                  <Link
                    className="text-xl link link-hover no-underline group-hover:link-primary"
                    href={`/playlists/${playlistConfig.id}`}
                  >
                    {playlistConfig.name}
                  </Link>
                  <p className="mt-1 text-base-content">
                    {playlistConfig.description || "No playlist description."}
                  </p>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-sm text-base-content/50">
                      Created {formattedCreatedAt}
                    </p>
                  </div>
                </div>
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
};
