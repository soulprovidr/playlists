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
        <Link className="btn btn-ghost btn-sm" href="/playlists/new">
          + Create playlist
        </Link>
      </div>

      <ul className="list rounded-box border border-base-content/5 bg-base-100">
        {dashboardPlaylists.map((playlistConfig) => {
          const updatedAt =
            databaseHelpers.getZonedDateTimeFromDatabaseTimestamp(
              playlistConfig.updatedAt,
            );
          const formattedUpdatedAt = datesHelpers.formatZonedDateTime(
            updatedAt!,
            "LLL d, yyyy",
          );
          return (
            <Link
              href={`/playlists/${playlistConfig.id}`}
              key={playlistConfig.id}
              asChild
            >
              <li className="list-row gap-6 px-6 py-6 rounded-none first:rounded-t-box last:rounded-b-box hover:bg-base-200 cursor-pointer">
                <img
                  src={playlistConfig.imageUrl || "/img/default-cover.png"}
                  className="rounded-lg size-24"
                  alt={playlistConfig.name}
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      className="text-xl link link-hover no-underline group-hover:link-primary"
                      href={`/playlists/${playlistConfig.id}`}
                    >
                      {playlistConfig.name}
                    </Link>
                  </div>
                  <p className="mt-1 text-base-content">
                    {playlistConfig.description || "No playlist description."}
                  </p>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-sm text-base-content/50">
                      Updated {formattedUpdatedAt}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="badge badge-sm badge-ghost">
                    {playlistConfig.trackCount} tracks
                  </span>
                  <span className="badge badge-sm badge-ghost">
                    {playlistConfig.sources.length} source
                    {playlistConfig.sources.length > 1 ? "s" : ""}
                  </span>
                </div>
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
};
