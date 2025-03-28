import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useParams } from "wouter";
import { PlaylistConfig } from "../../../api/validators";
import { Layout } from "../Layout";

export const PlaylistView = () => {
  const { id } = useParams<{ id: string }>();

  const { data: playlistConfig } = useQuery<PlaylistConfig>({
    queryKey: ["playlists", id],
    queryFn: () =>
      axios
        .get<PlaylistConfig>(`/api/playlists/${id}`)
        .then(({ data }) => data),
  });

  const handleGeneratePlaylist = () => {
    axios.post(`/api/playlists/${playlistConfig?.spotifyPlaylistId}/generate`);
  };

  return (
    <Layout>
      <div className="w-100 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-center">
          <h1>{playlistConfig?.name}</h1>
          <Link
            className="small text-decoration-none"
            href={`/edit/${playlistConfig?.spotifyPlaylistId}`}
          >
            Edit playlist
          </Link>
          <button className="btn btn-primary" onClick={handleGeneratePlaylist}>
            Generate Playlist
          </button>
        </div>
      </div>

      {/* {playlistConfig?.description ? (
        <p className="mb-3">{playlistConfig?.description}</p>
      ) : null} */}

      <div className="grid g-5">
        <img className="g-col-4 img-fluid" src="/img/default-cover.png" />

        {/* <div className="g-col-8">
          <div className="grid g-3 mb-3">
            <div className="g-col-6">
              <p>{_.capitalize(playlistConfig?.repeat)}</p>
            </div>

            <div className="g-col-6">
              <label className="form-label" htmlFor="repeatDay">
                Repeat Day
              </label>
              <p>{playlistConfig?.repeatDay}</p>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Sources</label>
            <ul className="list-group">
              {_.map(playlistConfig?.sources, (source) => (
                <li className="list-group-item" key={source.id}>
                  {source.name}
                </li>
              ))}
            </ul>
          </div>
        </div> */}
      </div>
    </Layout>
  );
};
