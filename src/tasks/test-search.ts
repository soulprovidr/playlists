import { getSpotifyUserId } from "@config";
import { PlaylistItem } from "@modules/playlist-items/playlist-items.validation";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import * as fs from "fs";
import Fuse from "fuse.js";
import _ from "lodash";

export async function testSearch() {
  const spotifyUserId = getSpotifyUserId();
  if (!spotifyUserId) {
    throw new Error("No spotifyUserId configured in config.yml");
  }

  const spotifyApi = await spotifyApiService.getInstance(spotifyUserId);

  const playlistItems: PlaylistItem[] = JSON.parse(
    fs.readFileSync("./playlist-items.json", "utf-8"),
  );

  console.log(
    `\nTesting Fuse.js search for ${playlistItems.length} items...\n`,
  );

  for (const item of playlistItems) {
    console.log(`\n--- ${item.artist} - ${item.name} ---`);

    const searchResult = await spotifyApi.searchTracks(
      `${item.artist} ${item.name}`,
    );

    const candidates = searchResult.body.tracks?.items ?? [];

    if (candidates.length === 0) {
      console.log("  No Spotify results found.");
      continue;
    }

    const artistFuse = new Fuse(candidates, {
      keys: ["artists.name"],
      threshold: 0.5,
      includeScore: true,
    });
    const artistResults = artistFuse.search(item.artist);
    const artistMatches = artistResults.filter((r) => (r.score ?? 1) < 0.4);

    console.log(
      `  Artist matches (score < 0.5): ${artistMatches.length}/${candidates.length}`,
    );
    for (const r of artistMatches) {
      const artists = r.item.artists.map((a) => a.name).join(", ");
      console.log(`    [${r.score?.toFixed(3)}] ${artists} - ${r.item.name}`);
    }

    if (artistMatches.length === 0) {
      console.log("  No artist matches above confidence threshold.");
      console.log("  Raw candidates:");
      for (const c of candidates.slice(0, 3)) {
        console.log(
          `    - ${c.artists.map((a) => a.name).join(", ")} - ${c.name}`,
        );
      }
      continue;
    }

    const trackFuse = new Fuse(
      artistMatches.map((r) => r.item),
      { keys: ["name"], includeScore: true },
    );
    const trackResults = trackFuse.search(item.name);

    console.log(`  Track matches: ${trackResults.length}`);
    for (const r of trackResults) {
      const artists = r.item.artists.map((a) => a.name).join(", ");
      console.log(`    [${r.score?.toFixed(3)}] ${artists} - ${r.item.name}`);
    }

    if (trackResults.length === 0) {
      console.log("  No track matches found.");
    } else {
      const best = _.minBy(trackResults, (r) => r.score)!.item;
      console.log(
        `  => Selected: ${best.artists.map((a) => a.name).join(", ")} - ${best.name}`,
      );
    }
  }

  console.log("\nDone.\n");
}
