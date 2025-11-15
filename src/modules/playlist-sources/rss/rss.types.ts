import { RssSourceConfig } from "../playlist-sources.types";

export interface RssValidationResult {
  valid: boolean;
  config?: RssSourceConfig;
  error?: string;
}
