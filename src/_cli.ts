import { search } from "@inquirer/prompts";
import { logger } from "@logger";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import * as usersService from "@modules/users/users.service";
import { buildPlaylist } from "@tasks/build-playlist";
import { schedulePlaylists } from "./tasks/schedule-playlists";

import "tsconfig-paths/register";

enum Command {
  REBUILD_PLAYLIST = "REBUILD_PLAYLIST",
  SCHEDULE_PLAYLISTS = "SCHEDULE_PLAYLISTS",
}

async function rebuildPlaylistCommand() {
  const users = await usersService.getAllUsers();
  const userId = await search({
    message: "Select a user",
    source: () =>
      users.map((user) => ({
        name: user.spotifyUserId,
        value: user.id,
      })),
  });
  const playlistConfigs =
    await playlistConfigsService.getPlaylistConfigsByUserId(userId);
  const playlistConfig = await search({
    message: "Select a playlist",
    source: () => [
      ...playlistConfigs.map((config) => ({
        name: config.name,
        value: config,
      })),
      { name: "Exit", value: null },
    ],
  });

  if (playlistConfig) {
    await buildPlaylist(playlistConfig.id);
  }
}

async function schedulePlaylistsCommand() {
  await schedulePlaylists();
}

async function selectCommand(): Promise<Command | null> {
  return search({
    message: "What would you like to do?",
    source: () => [
      { name: "Rebuild a playlist", value: Command.REBUILD_PLAYLIST },
      { name: "Schedule playlists", value: Command.SCHEDULE_PLAYLISTS },
      { name: "Exit", value: null },
    ],
  });
}

async function main() {
  const command = await selectCommand();
  switch (command) {
    case Command.REBUILD_PLAYLIST:
      await rebuildPlaylistCommand();
      break;
    case Command.SCHEDULE_PLAYLISTS:
      await schedulePlaylistsCommand();
      break;
    default:
      process.exit(1);
  }
  main();
}

main();

process.on("uncaughtException", (error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    logger.info("👋 Bye!");
  } else {
    // Rethrow unknown errors
    throw error;
  }
});
