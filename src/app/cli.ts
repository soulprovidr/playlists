import { search } from "@inquirer/prompts";
import playlistConfigs from "../../data/playlists.json";
import { buildPlaylist } from "./build-playlist";
import { PlaylistConfig } from "./validators";

enum Command {
  RESYNC = "RESYNC",
}

class Cli {
  private async resync() {
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
      await buildPlaylist(playlistConfig as PlaylistConfig);
    }
  }

  private async selectCommand(): Promise<Command | null> {
    return search({
      message: "What would you like to do?",
      source: () => [
        { name: "Resync a playlist", value: Command.RESYNC },
        { name: "Exit", value: null },
      ],
    });
  }

  async start() {
    const command = await this.selectCommand();
    switch (command) {
      case Command.RESYNC:
        await this.resync();
        break;
      default:
        process.exit(1);
    }
  }
}

export const cli = new Cli();
