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
  metadata: z.record(z.unknown()).optional()
});

export const metricPointSchema = z.object({
  eventId: z.string().optional(),
  timestamp: timestampSchema,
  service: z.string().min(1),
  metric: z.string().min(1),
  value: z.number().finite(),
  unit: z.string().optional(),
  labels: z.record(z.string()).optional()
});

export const ingestLogsSchema = z.array(logEntrySchema).min(1);
export const ingestMetricsSchema = z.array(metricPointSchema).min(1);

export type LogEntry = z.infer<typeof logEntrySchema>;
export type MetricPoint = z.infer<typeof metricPointSchema>;