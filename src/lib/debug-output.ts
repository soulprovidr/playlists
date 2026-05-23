import { env } from "@env";
import fs from "node:fs";
import path from "node:path";

export function writeDebugOutput(filename: string, data: unknown): void {
  if (!env.DEBUG_PLAYLISTS) {
    return;
  }

  const debugDir = path.resolve(process.cwd(), "debug");
  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }

  const filePath = path.join(debugDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}
