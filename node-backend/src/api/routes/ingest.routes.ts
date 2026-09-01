import { Router } from "express";
import { db } from "../../db/database";
import {
  ingestLogsSchema,
  ingestMetricsSchema,
  LogEntry,
  MetricPoint
} from "../../schemas/telemetry.schema";

const router = Router();

router.post("/logs", (req, res) => {
  const parsed = ingestLogsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid log payload",
      details: parsed.error.flatten()
    });
  }

  const insert = db.prepare(`
    INSERT INTO logs (
      eventId,
      timestamp,
      service,
      level,
      message,
      traceId,
      host,
      environment,
      metadata
    ) VALUES (
      @eventId,
      @timestamp,
      @service,
      @level,
      @message,
      @traceId,
      @host,
      @environment,
      @metadata
    )
  `);

  const insertMany = db.transaction((logs: LogEntry[]) => {
    for (const log of logs) {
      insert.run({
        eventId: log.eventId ?? null,
        timestamp: log.timestamp,
        service: log.service,
        level: log.level,
        message: log.message,
        traceId: log.traceId ?? null,
        host: log.host ?? null,
        environment: log.environment ?? null,
        metadata: log.metadata ? JSON.stringify(log.metadata) : null
      });
    }
  });

  insertMany(parsed.data);

  return res.json({
    accepted: parsed.data.length
  });
});

router.post("/metrics", (req, res) => {
  const parsed = ingestMetricsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid metric payload",
      details: parsed.error.flatten()
    });
  }

  const insert = db.prepare(`
    INSERT INTO metrics (
      eventId,
      timestamp,
      service,
      metric,
      value,
      unit,
      labels
    ) VALUES (
      @eventId,
      @timestamp,
      @service,
      @metric,
      @value,
      @unit,
      @labels
    )
  `);

  const insertMany = db.transaction((metrics: MetricPoint[]) => {
    for (const metric of metrics) {
      insert.run({
        eventId: metric.eventId ?? null,
        timestamp: metric.timestamp,
        service: metric.service,
        metric: metric.metric,
        value: metric.value,
        unit: metric.unit ?? null,
        labels: metric.labels ? JSON.stringify(metric.labels) : null
      });
    }
  });

  insertMany(parsed.data);

  return res.json({
    accepted: parsed.data.length
  });
});

export default router;
