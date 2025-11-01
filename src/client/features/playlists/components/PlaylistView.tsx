import { PlaylistViewResponse } from "@api/playlists/playlists.types";
import { DateTimeFormatter, ZonedDateTime } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { Link } from "wouter";
import { Layout } from "../../../components/layout";
import { api } from "../../../lib/api";
import * as playlistsHelpers from "../playlists.helpers";
interface PlaylistViewProps {
  playlistId: string;
}

export const PlaylistView = ({ playlistId }: PlaylistViewProps) => {
  const { data: playlistConfig } = useQuery<PlaylistViewResponse>({
    queryKey: ["playlists", playlistId],
    queryFn: () =>
      api
        .get<PlaylistViewResponse>(`/playlists/${playlistId}`)
        .then(({ data }) => data),
  });

  const handleGeneratePlaylist = () => {
    api.post(`/playlists/${playlistConfig?.id}/build`);
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center justify-center gap-6">
            <img
              className="rounded-lg shadow-md"
              src={playlistConfig?.imageUrl ?? "/img/default-cover.png"}
              height="100"
              width="100"
              alt={playlistConfig?.name}
            />
            <div>
              <h1 className="text-3xl font-light tracking-tight mb-2">
                {playlistConfig?.name}
              </h1>

              {playlistConfig?.description ? (
                <p className="mb-2 text-base-content/80">
                  {playlistConfig.description}
                </p>
              ) : null}

              {playlistConfig?.spotifyPlaylistId ? (
                <a
                  className="link link-primary text-sm"
                  href={playlistsHelpers.getSpotifyPlaylistUrl(
                    playlistConfig.spotifyPlaylistId,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Spotify
                </a>
              ) : null}
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <Link
              className="link link-primary text-sm"
              href={`/edit/${playlistConfig?.id}`}
            >
              Edit playlist
            </Link>
            <button
              className="btn btn-primary"
              onClick={handleGeneratePlaylist}
            >
              Refresh Playlist
            </button>
          </div>
        </div>
      </div>

      <div>
        <div role="tablist" className="tabs tabs-bordered">
          <button role="tab" className="tab tab-active" aria-selected="true">
            Tracks
          </button>
          <button role="tab" className="tab">
            Sources{" "}
            <span className="badge badge-secondary ml-2">
              {_.size(playlistConfig?.sources)}
            </span>
          </button>
        </div>

        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Date added</th>
                </tr>
              </thead>
              <tbody>
                {_.map(playlistConfig?.tracks, (track) => (
                  <tr
                    key={track.track!.id}
                    onClick={() =>
                      window.open(track.track!.external_urls.spotify, "_blank")
                    }
                    className="hover cursor-pointer"
                  >
                    <td>
                      <img
                        height="50"
                        width="50"
                        src={track.track!.album!.images[0].url}
                        alt={track.track!.name}
                        className="rounded"
                      />
                    </td>
                    <td>
                      <p className="mb-0 font-semibold">
                        {track.track!.artists[0].name}
                      </p>
                      <p className="mb-0 text-sm text-base-content/70">
                        {track.track!.name}
                      </p>
                    </td>
                    <td>
                      {ZonedDateTime.parse(track.added_at).format(
                        DateTimeFormatter.ofPattern("LLLL d, yyyy").withLocale(
                          Locale.ENGLISH,
                        ),
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};
