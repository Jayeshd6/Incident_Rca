import { z } from "zod";

const timestampSchema = z.string().refine(
  value => !Number.isNaN(Date.parse(value)),
  {
    message: "Invalid timestamp. Use ISO format."
  }
);

export const logEntrySchema = z.object({
  eventId: z.string().optional(),
  timestamp: timestampSchema,
  service: z.string().min(1),
  level: z.enum(["DEBUG", "INFO", "WARN", "ERROR", "FATAL"]),
  message: z.string().min(1),
  traceId: z.string().optional(),
  host: z.string().optional(),
  environment: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const metricPointSchema = z.object({
  eventId: z.string().optional(),
  timestamp: timestampSchema,
  service: z.string().min(1),
  metric: z.string().min(1),
  value: z.number().finite(),
  unit: z.string().optional(),
  labels: z.record(z.string(), z.string()).optional()
});

export const traceSpanSchema = z.object({
  eventId: z.string().optional(),
  traceId: z.string().min(1),
  spanId: z.string().min(1),
  parentSpanId: z.string().optional(),
  service: z.string().min(1),
  operation: z.string().min(1),
  startTime: timestampSchema,
  durationMs: z.number().nonnegative(),
  status: z.enum(["ok", "error"]),
  statusCode: z.number().int().min(100).max(599).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const deploymentEventSchema = z.object({
  eventId: z.string().optional(),
  timestamp: timestampSchema,
  service: z.string().min(1),
  eventType: z.enum([
    "deployment",
    "config_change",
    "restart",
    "scaling",
    "migration",
    "rollback"
  ]),
  version: z.string().optional(),
  commitId: z.string().optional(),
  deployedBy: z.string().optional(),
  environment: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const databaseEventSchema = z.object({
  eventId: z.string().optional(),
  timestamp: timestampSchema,
  service: z.string().min(1),
  eventType: z.enum([
    "slow_query",
    "connection_pool_exhaustion",
    "lock_timeout",
    "deadlock",
    "replication_lag",
    "failover",
    "high_cpu",
    "disk_pressure",
    "transaction_rollback",
    "other"
  ]),
  severity: z.enum(["info", "warning", "critical"]).optional(),
  message: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const apiFailureEventSchema = z.object({
  eventId: z.string().optional(),
  timestamp: timestampSchema,
  service: z.string().min(1),
  endpoint: z.string().min(1),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  statusCode: z.number().int().min(100).max(599),
  errorType: z.string().optional(),
  count: z.number().int().positive().optional(),
  dependency: z.string().optional(),
  traceId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const serviceDependencySchema = z.object({
  service: z.string().min(1),
  dependsOn: z.string().min(1),
  callType: z.enum(["http", "grpc", "db", "queue", "cache"]).optional(),
  environment: z.string().optional()
});

export const ingestLogsSchema = z.array(logEntrySchema).min(1);
export const ingestMetricsSchema = z.array(metricPointSchema).min(1);
export const ingestTracesSchema = z.array(traceSpanSchema).min(1);
export const ingestDeploymentsSchema = z.array(deploymentEventSchema).min(1);
export const ingestDatabaseEventsSchema = z.array(databaseEventSchema).min(1);
export const ingestApiFailuresSchema = z.array(apiFailureEventSchema).min(1);
export const ingestDependenciesSchema = z.array(serviceDependencySchema).min(1);

export type LogEntry = z.infer<typeof logEntrySchema>;
export type MetricPoint = z.infer<typeof metricPointSchema>;
export type TraceSpan = z.infer<typeof traceSpanSchema>;
export type DeploymentEvent = z.infer<typeof deploymentEventSchema>;
export type DatabaseEvent = z.infer<typeof databaseEventSchema>;
export type ApiFailureEvent = z.infer<typeof apiFailureEventSchema>;
export type ServiceDependency = z.infer<typeof serviceDependencySchema>;