import Database from "better-sqlite3";
import { join } from "path";

const dataDir = process.env.DATA_DIR || process.cwd();
const db = new Database(join(dataDir, "data.db"));

db.exec(`
	CREATE TABLE IF NOT EXISTS photos (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		data BLOB NOT NULL,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)
`);

const deleteOld = db.prepare(
  "DELETE FROM photos WHERE created_at < datetime('now', '-24 hours')",
);

function cleanup() {
  deleteOld.run();
}

cleanup();
setInterval(cleanup, 60 * 60 * 1000);

export default db;
