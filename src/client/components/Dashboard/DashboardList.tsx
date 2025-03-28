import { PlaylistConfig } from "@modules/playlist-configs/playlist-configs.types";
import { Link } from "wouter";
import css from "./DashboardList.module.scss";

interface DashboardListProps {
  // playlistConfigs: PlaylistConfig[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playlistConfigs: PlaylistConfig[];
}

export const DashboardList = ({ playlistConfigs }: DashboardListProps) => (
  <div className="w-100 d-flex flex-column gap-4">
    <div className="d-flex justify-content-between align-items-center">
      <h1>My Playlists</h1>
      <Link className="small text-decoration-none" href="/create">
        + Create playlist
      </Link>
    </div>

    <ul className="list-unstyled m-0">
      {playlistConfigs.map((playlistConfig) => (
        <Link
          href={`/playlists/${playlistConfig.spotifyPlaylistId}`}
          key={playlistConfig.spotifyPlaylistId}
          asChild
        >
          <li className={css.playlist}>
            <img src="/img/default-cover.png" width={100} />
            <div className="d-flex flex-column">
              <Link
                className="fs-5 text-decoration-none"
                href={`/playlists/${playlistConfig.spotifyPlaylistId}`}
              >
                {playlistConfig.name}
              </Link>
              <p className="m-0">
                {/* {playlistConfig.description || "No playlist description."} */}
              </p>
              {/* <div className="d-flex flex-column gap-1 mt-2">
                {playlistConfig.repeat !== PlaylistConfigRepeat.NONE && (
                  <p className="small text-black-50">
                    Repeats {playlistConfig.repeat.toLocaleLowerCase()}
                  </p>
                )}
              </div> */}
            </div>
          </li>
        </Link>
      ))}
    </ul>
  </div>
);
