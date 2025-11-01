import { search } from "@inquirer/prompts";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import * as usersService from "@modules/users/users.service";
import { buildPlaylist } from "@tasks/build-playlist";

import "tsconfig-paths/register";

enum Command {
  RESYNC = "RESYNC",
}

async function resync() {
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

async function selectCommand(): Promise<Command | null> {
  return search({
    message: "What would you like to do?",
    source: () => [
      { name: "Resync a playlist", value: Command.RESYNC },
      { name: "Exit", value: null },
    ],
  });
}

async function main() {
  console.log("Starting CLI...");
  const command = await selectCommand();
  switch (command) {
    case Command.RESYNC:
      await resync();
      break;
    default:
      process.exit(1);
  }
  main();
}

main();

process.on("uncaughtException", (error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("👋 Bye!");
  } else {
    // Rethrow unknown errors
    throw error;
  }
});
