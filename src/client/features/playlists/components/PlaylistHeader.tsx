import { PlaylistViewResponse } from "@api/playlists/playlists.types";
import { Link } from "wouter";
import * as playlistsHelpers from "../playlists.helpers";
import * as playlistsService from "../playlists.service";

interface PlaylistHeaderProps {
  playlist: PlaylistViewResponse | undefined;
}

export const PlaylistHeader = ({ playlist }: PlaylistHeaderProps) => {
  const handleBuildPlaylist = () => {
    if (playlist?.id) {
      playlistsService.buildPlaylist(playlist.id);
    }
  };

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
        <Link href={`/playlists/${playlist?.id}/edit`}>
          <button className="btn btn-ghost">Edit</button>
        </Link>
        <button className="btn btn-primary" onClick={handleBuildPlaylist}>
          Build Playlist
        </button>
      </div>
    </div>
  );
};
