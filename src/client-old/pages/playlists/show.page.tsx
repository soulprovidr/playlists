import { GetPlaylistReply } from "@/playlists/playlists.types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Layout } from "components/layout";
import { AsyncImage } from "components/util/async-image";
import _ from "lodash";
import { Link, useParams } from "wouter";

export const PlaylistsShowPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data } = useQuery<GetPlaylistReply>({
    queryKey: ["playlists", id],
    queryFn: () =>
      axios
        .get<GetPlaylistReply>(`/api/playlists/${id}`)
        .then(({ data }) => data),
  });

  const handleGeneratePlaylist = () => {
    axios.post(`/api/playlists/${id}/generate`);
  };

  return (
    <Layout>
      <div className="w-100 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-center">
          <h1>{data?.config.name}</h1>
          <Link
            className="small text-decoration-none"
            href={`/edit/${data?.config.id}`}
          >
            Edit playlist
          </Link>
          <button onClick={handleGeneratePlaylist}>Generate Playlist</button>
        </div>
      </div>

      {data?.config.description ? (
        <p className="mb-3">{data?.config.description}</p>
      ) : null}

      <div className="grid g-5">
        <AsyncImage
          className="g-col-4 img-fluid"
          src="/img/default-cover.png"
        />

        <div className="g-col-8">
          <div className="grid g-3 mb-3">
            <div className="g-col-6">
              <p>{_.capitalize(data?.config.repeat)}</p>
            </div>

            <div className="g-col-6">
              <label className="form-label" htmlFor="repeatDay">
                Repeat Day
              </label>
              <p>{data?.config.repeatDay}</p>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Sources</label>
            <ul className="list-group">
              {_.map(data?.sources, (source) => (
                <li className="list-group-item" key={source.id}>
                  {source.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};
