import { GetPlaylistSourcesReply } from "@/playlists/playlists.types";
import { CreatePlaylistBody } from "@/playlists/playlists.validators";
import { DayOfWeek } from "@js-joda/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Layout } from "components/layout";
import { AsyncImage } from "components/util/async-image";
import { useStateObject } from "hooks/use-state-object";
import _ from "lodash";
import { PlaylistConfigRepeat } from "modules/playlist-configs/playlist-configs.types";
import { FormEventHandler } from "react";
import { navigate } from "wouter/use-browser-location";

export const PlaylistCreatePage = () => {
  const [values, setValues] = useStateObject<CreatePlaylistBody>({
    name: "",
    description: "",
    repeat: PlaylistConfigRepeat.NONE,
    repeatDay: undefined,
    playlistSourceIds: [],
  });

  const { data } = useQuery<GetPlaylistSourcesReply>({
    queryKey: ["playlists", "playlist-sources"],
    queryFn: () =>
      axios
        .get<GetPlaylistSourcesReply>(`/api/playlists/playlist-sources`)
        .then(({ data }) => data),
  });

  const playlistSourcesByType = _.groupBy(data?.sources, (p) => p.type);

  const togglePlaylistSource = (playlistSourceId: number) => {
    setValues({
      playlistSourceIds: _.xor(values.playlistSourceIds, [playlistSourceId]),
    });
  };

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post<{ id: number }>(
        "/api/playlists",
        values,
      );
      navigate(`/playlists/${data.id}`);
    } catch (e) {
      alert("Failed to create playlist");
    }
  };

  return (
    <Layout>
      <h1>Create Playlist</h1>

      <div className="grid g-5">
        <AsyncImage
          className="g-col-4 img-fluid"
          src="/img/default-cover.png"
        />

        <form className="g-col-8" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <input
              className="form-control"
              type="text"
              name="name"
              id="name"
              onChange={(e) => setValues({ name: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              className="form-control"
              name="description"
              id="description"
              onChange={(e) => setValues({ description: e.target.value })}
            ></textarea>
          </div>

          <div className="grid g-3 mb-3">
            <div className="g-col-6">
              <label className="form-label" htmlFor="repeat">
                Repeat?
              </label>
              <select
                className="form-select"
                name="repeat"
                id="repeat"
                onChange={(e) => {
                  const repeat = e.target.value as PlaylistConfigRepeat;
                  setValues({
                    repeat,
                    repeatDay:
                      repeat === PlaylistConfigRepeat.WEEKLY
                        ? DayOfWeek.MONDAY.value()
                        : undefined,
                  });
                }}
                value={values.repeat}
              >
                {Object.entries(PlaylistConfigRepeat).map(([key, value]) => (
                  <option key={key} value={value}>
                    {_.capitalize(key)}
                  </option>
                ))}
              </select>
            </div>

            <div className="g-col-6">
              <label className="form-label" htmlFor="repeatDay">
                Repeat Day
              </label>
              <select
                className="form-select"
                disabled={values.repeat !== PlaylistConfigRepeat.WEEKLY}
                id="repeatDay"
                name="repeatDay"
                onChange={(e) => {
                  setValues({ repeatDay: Number(e.target.value) });
                }}
              >
                {DayOfWeek.values().map((day) => (
                  <option key={day.name()} value={day.value()}>
                    {_.capitalize(day.name())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Sources</label>
            {_.map(playlistSourcesByType, (sources, type) => (
              <ul key={type} className="list-group">
                <li className="list-group-item list-group-item-dark">{type}</li>
                {_.map(sources, (source) => (
                  <li className="list-group-item" key={source.id}>
                    <input
                      className="form-check-input me-2"
                      id={String(source.id)}
                      onChange={() => togglePlaylistSource(source.id)}
                      type="checkbox"
                      value=""
                    />
                    <label
                      className="form-check-label stretched-link"
                      htmlFor={String(source.id)}
                    >
                      {source.name}
                    </label>
                  </li>
                ))}
              </ul>
            ))}
          </div>

          <div className="d-flex justify-content-end">
            <a href="/dashboard" className="btn btn-outline-secondary me-2">
              Cancel
            </a>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
