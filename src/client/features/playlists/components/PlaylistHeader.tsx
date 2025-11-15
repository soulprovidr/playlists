import { PlaylistViewResponse } from "@api/playlists/playlists.types";
import { BuildStatus } from "@modules/playlist-configs/playlist-configs.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import * as playlistsHelpers from "../playlists.helpers";
import * as playlistsService from "../playlists.service";

interface PlaylistHeaderProps {
  playlist: PlaylistViewResponse | undefined;
}

export const PlaylistHeader = ({ playlist }: PlaylistHeaderProps) => {
  const queryClient = useQueryClient();

  const buildMutation = useMutation({
    mutationFn: (playlistId: number) =>
      playlistsService.buildPlaylist(playlistId),
    onSuccess: () => {
      // Invalidate the playlist query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: ["playlists", String(playlist?.id)],
      });
    },
  });

  const handleBuildPlaylist = () => {
    if (playlist?.id) {
      buildMutation.mutate(playlist.id);
    }
  };

  const isBuilding = playlist?.buildStatus === BuildStatus.IN_PROGRESS;
  const isDisabled = isBuilding || buildMutation.isPending;

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center justify-center gap-6">
        <img
          className="rounded-lg shadow-md"
          src={playlist?.imageUrl ?? "/img/default-cover.png"}
          height="100"
          width="100"
          alt={playlist?.name}
        />
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-2">
            {playlist?.name}
          </h1>

          {playlist?.description ? (
            <p className="mb-2 text-base-content/80">{playlist.description}</p>
          ) : null}

          {playlist?.spotifyPlaylistId ? (
            <a
              className="link link-primary text-sm"
              href={playlistsHelpers.getSpotifyPlaylistUrl(
                playlist.spotifyPlaylistId,
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
          className="btn btn-ghost btn-sm"
          href={`/playlists/${playlist?.id}/edit`}
        >
          Edit
        </Link>
        <button
          className="btn btn-primary btn-soft btn-sm"
          onClick={handleBuildPlaylist}
          disabled={isDisabled}
        >
          {isBuilding && (
            <span className="loading loading-spinner loading-sm"></span>
          )}
          {isBuilding ? "Building..." : "Build Playlist"}
        </button>
      </div>
    </div>
  );
};
