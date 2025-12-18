import { env } from "@env";
import { logger } from "@logger";
import fs from "fs";

async function migrateClean() {
  try {
    fs.rmSync(env.DATABASE_PATH);
    logger.info(`Deleted database: ${env.DATABASE_PATH}`);
  } catch (e) {
    logger.error(e);
  }
}

migrateClean();
