import {
  PlaylistSourceConfig,
  PlaylistSourceType,
} from "@modules/playlist-sources/playlist-sources.types";

export interface ValidateUrlRequest {
  url: string;
}

export interface ValidateUrlResponse {
  valid: boolean;
  type?: PlaylistSourceType;
  config?: PlaylistSourceConfig;
  error?: string;
}
