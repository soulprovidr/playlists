import { RedditSourceConfig } from "../playlist-sources.types";

export interface RedditValidationResult {
  valid: boolean;
  config?: RedditSourceConfig;
  error?: string;
}
