import { PlaylistViewResponse } from "@api/playlists/playlists.types";
import { BuildStatus } from "@modules/playlist-configs/playlist-configs.types";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useState } from "react";
import { Layout } from "../../../components/Layout";
import { LoadingView } from "../../../components/LoadingView";
import * as playlistsService from "../playlists.service";
import { PlaylistHeader } from "./PlaylistHeader";
import { PlaylistSources } from "./PlaylistSources";
import { PlaylistTracks } from "./PlaylistTracks";
interface PlaylistViewProps {
  playlistId: string;
}

export const PlaylistView = ({ playlistId }: PlaylistViewProps) => {
  const [selectedTab, setSelectedTab] = useState<"tracks" | "sources">(
    "tracks",
  );

  const { data: playlist, isLoading } = useQuery<PlaylistViewResponse>({
    queryKey: ["playlists", playlistId],
    queryFn: () => playlistsService.getPlaylistView(playlistId),
    refetchInterval: (query) => {
      // Poll every 2 seconds if build status is IN_PROGRESS
      const data = query.state.data;
      return data?.buildStatus === BuildStatus.IN_PROGRESS ? 2000 : false;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <LoadingView />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        <PlaylistHeader playlist={playlist} />
      </div>

      <div role="tablist" className="tabs tabs-border">
        <button
          role="tab"
          className={`tab ${selectedTab === "tracks" ? "tab-active" : ""}`}
          aria-selected={selectedTab === "tracks"}
          onClick={() => setSelectedTab("tracks")}
        >
          Tracks
          <span className="badge badge-ghost ml-2">
            {_.size(playlist?.tracks)}
          </span>
        </button>
        <div className="tab-content">
          {selectedTab === "tracks" && (
            <PlaylistTracks tracks={playlist?.tracks} />
          )}
        </div>

        <button
          role="tab"
          className={`tab ${selectedTab === "sources" ? "tab-active" : ""}`}
          aria-selected={selectedTab === "sources"}
          onClick={() => setSelectedTab("sources")}
        >
          Sources
          <span className="badge badge-ghost ml-2">
            {_.size(playlist?.sources)}
          </span>
        </button>

        <div className="tab-content">
          {selectedTab === "sources" && (
            <PlaylistSources sources={playlist?.sources} />
          )}
        </div>
      </div>
    </Layout>
  );
};
