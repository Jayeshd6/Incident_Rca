import Database, { type Database as DatabaseInstance } from "better-sqlite3";
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

export const db: DatabaseInstance = new Database(dbPath);

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

  CREATE TABLE IF NOT EXISTS traces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT,
    traceId TEXT NOT NULL,
    spanId TEXT NOT NULL,
    parentSpanId TEXT,
    service TEXT NOT NULL,
    operation TEXT NOT NULL,
    startTime TEXT NOT NULL,
    durationMs REAL NOT NULL,
    status TEXT NOT NULL,
    statusCode INTEGER,
    metadata TEXT
  );

  CREATE TABLE IF NOT EXISTS deployments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT,
    timestamp TEXT NOT NULL,
    service TEXT NOT NULL,
    eventType TEXT NOT NULL,
    version TEXT,
    commitId TEXT,
    deployedBy TEXT,
    environment TEXT,
    metadata TEXT
  );

  CREATE TABLE IF NOT EXISTS database_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT,
    timestamp TEXT NOT NULL,
    service TEXT NOT NULL,
    eventType TEXT NOT NULL,
    severity TEXT,
    message TEXT,
    metadata TEXT
  );

  CREATE TABLE IF NOT EXISTS api_failures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT,
    timestamp TEXT NOT NULL,
    service TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    statusCode INTEGER NOT NULL,
    errorType TEXT,
    count INTEGER,
    dependency TEXT,
    traceId TEXT,
    metadata TEXT
  );

  CREATE TABLE IF NOT EXISTS service_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service TEXT NOT NULL,
    dependsOn TEXT NOT NULL,
    callType TEXT,
    environment TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_logs_service_timestamp
  ON logs(service, timestamp);

  CREATE INDEX IF NOT EXISTS idx_metrics_service_metric_timestamp
  ON metrics(service, metric, timestamp);

  CREATE INDEX IF NOT EXISTS idx_traces_service_startTime
  ON traces(service, startTime);

  CREATE INDEX IF NOT EXISTS idx_traces_traceId
  ON traces(traceId);

  CREATE INDEX IF NOT EXISTS idx_deployments_service_timestamp
  ON deployments(service, timestamp);

  CREATE INDEX IF NOT EXISTS idx_database_events_service_timestamp
  ON database_events(service, timestamp);

  CREATE INDEX IF NOT EXISTS idx_api_failures_service_timestamp
  ON api_failures(service, timestamp);
`);
