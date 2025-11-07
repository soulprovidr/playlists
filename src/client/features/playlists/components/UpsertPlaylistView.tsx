import { PlaylistViewResponse } from "@api/playlists/playlists.types";
import {
  PlaylistSourceType,
  RedditSourceType,
} from "@modules/playlist-sources/playlist-sources.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "../../../components/layout";
import { LoadingView } from "../../../components/LoadingView";
import * as playlistsService from "../playlists.service";

interface UpsertPlaylistViewProps {
  playlistId?: string;
}

interface SourceFormData {
  id: string;
  type: PlaylistSourceType;
  config: {
    type?: string;
    value?: string;
    feedUrl?: string;
  };
}

export const UpsertPlaylistView = ({ playlistId }: UpsertPlaylistViewProps) => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const isEditing = !!playlistId;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sources, setSources] = useState<SourceFormData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing playlist if editing
  const { data: existingPlaylist, isFetching } = useQuery<PlaylistViewResponse>(
    {
      queryKey: ["playlists", playlistId],
      queryFn: () => playlistsService.getPlaylistView(playlistId!),
      enabled: isEditing,
    },
  );

  // Populate form when playlist data is loaded
  useEffect(() => {
    if (existingPlaylist) {
      setName(existingPlaylist.name);
      setDescription(existingPlaylist.description);
      setSources(
        _.map(existingPlaylist.sources, (source) => ({
          id: `${source.id}`,
          type: source.type,
          config: source.config as SourceFormData["config"],
        })),
      );
    }
  }, [existingPlaylist]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data: playlistsService.UpsertPlaylistRequest) =>
      playlistsService.upsertPlaylist(isEditing ? playlistId : undefined, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setLocation(`/playlists/${data.id}`);
    },
    onError: () => {
      setError("Failed to save playlist. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Playlist name is required");
      return;
    }

    if (_.isEmpty(sources)) {
      setError("At least one source is required");
      return;
    }

    saveMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      sources: _.map(sources, (source) => ({
        type: source.type,
        config: source.config,
      })),
    });
  };

  const addSource = () => {
    const newSource: SourceFormData = {
      id: `new-${Date.now()}`,
      type: PlaylistSourceType.REDDIT,
      config: {
        type: RedditSourceType.SUBREDDIT,
        value: "",
      },
    };
    setSources([...sources, newSource]);
  };

  const removeSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
  };

  const updateSource = (id: string, updates: Partial<SourceFormData>) => {
    setSources(sources.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const updateSourceConfig = (
    id: string,
    configUpdates: SourceFormData["config"],
  ) => {
    setSources(
      sources.map((s) =>
        s.id === id ? { ...s, config: { ...s.config, ...configUpdates } } : s,
      ),
    );
  };

  if (isFetching) {
    return (
      <Layout>
        <LoadingView />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Playlist" : "Create Playlist"}
          </h1>
          <p className="text-base-content/70 mt-2">
            {isEditing
              ? "Update your playlist configuration and sources"
              : "Configure a new playlist with sources to automatically populate it"}
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info Section */}
          <fieldset className="fieldset border-base-content/5 rounded-box border p-4">
            <legend className="fieldset-legend">Playlist Information</legend>

            <label className="label">Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter playlist name"
              required
            />

            <label className="label">Description</label>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter playlist description"
              rows={3}
            />
          </fieldset>

          {/* Sources Section */}
          <fieldset className="fieldset border-base-content/5 rounded-box border p-4">
            <legend className="fieldset-legend">Sources</legend>

            {_.isEmpty(sources) ? (
              <div className="text-center py-8 text-base-content/70">
                <p>No sources added yet. Click "Add Source" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {_.map(sources, (source) => (
                  <div
                    key={source.id}
                    className="border border-base-content/10 rounded-lg p-4"
                  >
                    <label className="label">Source Type</label>
                    <select
                      className="select select-bordered"
                      value={source.type}
                      onChange={(e) => {
                        const newType = e.target.value as PlaylistSourceType;
                        const newConfig =
                          newType === PlaylistSourceType.REDDIT
                            ? {
                                type: RedditSourceType.SUBREDDIT,
                                value: "",
                              }
                            : { feedUrl: "" };
                        updateSource(source.id, {
                          type: newType,
                          config: newConfig,
                        });
                      }}
                    >
                      <option value={PlaylistSourceType.REDDIT}>Reddit</option>
                      <option value={PlaylistSourceType.RSS}>RSS</option>
                    </select>

                    {source.type === PlaylistSourceType.REDDIT && (
                      <>
                        <label className="label">Reddit Source Type</label>
                        <select
                          className="select select-bordered"
                          value={
                            (source.config.type as string) ||
                            RedditSourceType.SUBREDDIT
                          }
                          onChange={(e) =>
                            updateSourceConfig(source.id, {
                              type: e.target.value,
                            })
                          }
                        >
                          <option value={RedditSourceType.SUBREDDIT}>
                            Subreddit
                          </option>
                          <option value={RedditSourceType.USER}>User</option>
                        </select>

                        <label className="label">
                          {source.config.type === RedditSourceType.USER
                            ? "Username"
                            : "Subreddit Name"}
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={(source.config.value as string) || ""}
                          onChange={(e) =>
                            updateSourceConfig(source.id, {
                              value: e.target.value,
                            })
                          }
                          placeholder={
                            source.config.type === RedditSourceType.USER
                              ? "username"
                              : "subreddit"
                          }
                        />
                      </>
                    )}

                    {source.type === PlaylistSourceType.RSS && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">RSS Feed URL</span>
                        </label>
                        <input
                          type="url"
                          className="input input-bordered"
                          value={(source.config.feedUrl as string) || ""}
                          onChange={(e) =>
                            updateSourceConfig(source.id, {
                              feedUrl: e.target.value,
                            })
                          }
                          placeholder="https://example.com/feed.rss"
                        />
                      </div>
                    )}

                    <div className="flex items-center">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circle"
                        onClick={() => removeSource(source.id)}
                        title="Remove source"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={addSource}
            >
              + Add Source
            </button>
          </fieldset>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setLocation(isEditing ? `/playlists/${playlistId}` : "/")
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending
                ? "Saving..."
                : isEditing
                  ? "Update Playlist"
                  : "Create Playlist"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
