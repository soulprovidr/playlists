import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "../migrations");

const createMigrationFile = (name: string) => {
  if (!name) {
    console.error("Please provide a name for the migration.");
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[-:.Z]/g, "");
  const filename = `${timestamp}_${name}.ts`;
  const filepath = path.join(migrationsDir, filename);

  const template = `
import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // migration code goes here...
}
  `;

  fs.writeFileSync(filepath, template);
  console.log(`Migration file created: ${filepath}`);
};

const args = process.argv.slice(2);
const migrationName = args[0];

createMigrationFile(migrationName);
