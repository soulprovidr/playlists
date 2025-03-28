export enum PlaylistConfigRepeat {
  NONE = "none",
  WEEKLY = "weekly",
}

export enum PlaylistSourceType {
  REDDIT = "reddit",
}

export interface PlaylistConfig {
  name: string;
  spotifyUserId: string;
  spotifyPlaylistId: string;
  sources: Array<{
    type: string;
    url: string;
  }>;
}
