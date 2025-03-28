import { env } from "@env";
import * as fs from "fs";

async function migrateClean(): Promise<void> {
  try {
    fs.rmSync(env.DATABASE_PATH);
    console.log(`Deleted database: ${env.DATABASE_PATH}`);
  } catch (e) {
    console.error(e);
  }
}

migrateClean();
