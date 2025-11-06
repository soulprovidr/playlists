import { PlaylistViewResponse } from "@api/playlists/playlists.types";
import _ from "lodash";
import * as playlistsHelpers from "../playlists.helpers";

interface PlaylistSourcesProps {
  sources?: PlaylistViewResponse["sources"];
}

export const PlaylistSources = ({ sources }: PlaylistSourcesProps) => {
  if (!sources || _.isEmpty(sources)) {
    return (
      <div className="rounded-box border border-base-content/5 bg-base-100 p-8 text-center">
        <p className="text-base-content/70">No sources configured</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {_.map(sources, (source) => (
            <tr key={source.id} className="hover">
              <td>
                <p className="font-semibold">
                  {playlistsHelpers.getSourceDetails(source)}
                </p>
              </td>
              <td>
                <span className="badge badge-primary">
                  {playlistsHelpers.getSourceTypeLabel(source.type)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
