import { PlaylistViewResponse } from "@api/playlists/playlists.types";
import { DateTimeFormatter, ZonedDateTime } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en";
import _ from "lodash";

interface PlaylistTracksProps {
  tracks?: PlaylistViewResponse["tracks"];
}

export const PlaylistTracks = ({ tracks }: PlaylistTracksProps) => {
  if (!tracks) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Date added</th>
          </tr>
        </thead>
        <tbody>
          {_.map(tracks, (track) => (
            <tr
              key={track.track!.id}
              onClick={() =>
                window.open(track.track!.external_urls.spotify, "_blank")
              }
              className="hover cursor-pointer"
            >
              <td>
                <img
                  src={track.track!.album!.images[0].url}
                  alt={track.track!.name}
                  width={50}
                  height={50}
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
  );
};
