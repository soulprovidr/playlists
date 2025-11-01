import {
  PlaylistSourceType,
  RedditSourceType,
} from "@modules/playlist-sources/playlist-sources.types";
import type { Kysely } from "kysely";
import _ from "lodash";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seed(db: Kysely<any>): Promise<void> {
  await db
    .insertInto("users")
    .values({ spotifyUserId: "soulprovidr" })
    .execute();

  const playlistConfigs = [
    {
      userId: 1,
      name: "r/disco",
      description: "Disco playlists, sourced from Reddit.",
      spotifyPlaylistId: "5RVgW86SpEvlSsr3ZiAPNB",
      sources: [
        {
          type: PlaylistSourceType.REDDIT,
          config: JSON.stringify({
            type: RedditSourceType.SUBREDDIT,
            value: "disco",
          }),
        },
      ],
    },
    {
      userId: 1,
      name: "r/reggae",
      description: "Reggae playlists, sourced from Reddit.",
      spotifyPlaylistId: "3u3Ny2Nf6MsXVXUuWw1WqG",
      sources: [
        {
          type: PlaylistSourceType.REDDIT,
          config: JSON.stringify({
            type: RedditSourceType.SUBREDDIT,
            value: "reggae",
          }),
        },
      ],
    },
  ];

  await db
    .insertInto("playlist_configs")
    .values(
      _.map(playlistConfigs, (playlistConfig) =>
        _.omit(playlistConfig, ["sources"]),
      ),
    )
    .execute();

  for (let i = 0; i < playlistConfigs.length; i++) {
    const playlistSources = _.map(
      playlistConfigs[i].sources,
      (playlistSource) => ({
        playlistConfigId: i + 1,
        ...playlistSource,
      }),
    );
    await db.insertInto("playlist_sources").values(playlistSources).execute();
  }

  await db
    .insertInto("playlist_source_templates")
    .values([
      {
        name: "Backseat Mafia: Album Reviews",
        type: PlaylistSourceType.RSS,
        site_url: "https://www.backseatmafia.com/category/album-reviews",
        config: JSON.stringify({
          feedUrl: "https://www.backseatmafia.com/category/album-reviews/feed",
        }),
      },
      {
        name: "Bandcamp Daily",
        type: PlaylistSourceType.RSS,
        site_url: "https://daily.bandcamp.com",
        config: JSON.stringify({
          feedUrl: "https://daily.bandcamp.com/feed",
        }),
      },
      {
        name: "Beats Per Minute",
        type: PlaylistSourceType.RSS,
        site_url: "https://beatsperminute.com",
        config: JSON.stringify({
          feedUrl: "https://beatsperminute.com/feed",
        }),
      },
      {
        name: "The Guardian",
        type: PlaylistSourceType.RSS,
        site_url: "https://www.theguardian.com/music+tone/albumreview",
        config: JSON.stringify({
          feedUrl: "https://www.theguardian.com/music+tone/albumreview/rss",
        }),
      },
      {
        name: "The Needledrop",
        type: PlaylistSourceType.RSS,
        site_url: "https://www.theneedledrop.com/articles",
        config: JSON.stringify({
          feedUrl: "https://www.theneedledrop.com/articles?format=rss",
        }),
      },
      {
        name: "NME",
        type: PlaylistSourceType.RSS,
        site_url: "https://www.nme.com/reviews/album",
        config: JSON.stringify({
          feedUrl: "https://www.nme.com/reviews/album/feed",
        }),
      },
      {
        name: "NPR",
        type: PlaylistSourceType.RSS,
        site_url: "https://www.npr.org/sections/music-reviews/",
        config: JSON.stringify({
          feedUrl: "https://feeds.npr.org/1104/rss.xml",
        }),
      },
      {
        name: "Pitchfork",
        type: PlaylistSourceType.RSS,
        site_url: "https://pitchfork.com/reviews/albums/",
        config: JSON.stringify({
          feedUrl: "https://pitchfork.com/feed/feed-album-reviews/rss",
        }),
      },
      {
        name: "PopMatters",
        type: PlaylistSourceType.RSS,
        site_url: "https://www.popmatters.com/category/music-reviews",
        config: JSON.stringify({
          feedUrl: "https://www.popmatters.com/category/music-reviews/feed",
        }),
      },
      {
        name: "The Quietus",
        type: PlaylistSourceType.RSS,
        site_url: "https://thequietus.com",
        config: JSON.stringify({
          feedUrl: "https://thequietus.com/reviews.atom",
        }),
      },
      {
        name: "Rolling Stone",
        type: PlaylistSourceType.RSS,
        site_url: "https://www.rollingstone.com/music/music-album-reviews/",
        config: JSON.stringify({
          feedUrl:
            "https://www.rollingstone.com/music/music-album-reviews/feed/",
        }),
      },
    ])
    .execute();
}
