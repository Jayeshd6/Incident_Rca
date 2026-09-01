import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, "../../data");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "incident_rca.db");

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT,
    timestamp TEXT NOT NULL,
    service TEXT NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    traceId TEXT,
    host TEXT,
    environment TEXT,
    metadata TEXT
  );

  CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT,
    timestamp TEXT NOT NULL,
    service TEXT NOT NULL,
    metric TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    labels TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_logs_service_timestamp
  ON logs(service, timestamp);

  CREATE INDEX IF NOT EXISTS idx_metrics_service_metric_timestamp
  ON metrics(service, metric, timestamp);
`);
