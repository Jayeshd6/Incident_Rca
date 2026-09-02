import { Router } from "express";
import { db } from "../../db/database";
import {
  ingestLogsSchema,
  ingestMetricsSchema,
  ingestTracesSchema,
  ingestDeploymentsSchema,
  ingestDatabaseEventsSchema,
  ingestApiFailuresSchema,
  ingestDependenciesSchema,
  LogEntry,
  MetricPoint,
  TraceSpan,
  DeploymentEvent,
  DatabaseEvent,
  ApiFailureEvent,
  ServiceDependency
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

router.post("/traces", (req, res) => {
  const parsed = ingestTracesSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid trace payload",
      details: parsed.error.flatten()
    });
  }

  const insert = db.prepare(`
    INSERT INTO traces (
      eventId,
      traceId,
      spanId,
      parentSpanId,
      service,
      operation,
      startTime,
      durationMs,
      status,
      statusCode,
      metadata
    ) VALUES (
      @eventId,
      @traceId,
      @spanId,
      @parentSpanId,
      @service,
      @operation,
      @startTime,
      @durationMs,
      @status,
      @statusCode,
      @metadata
    )
  `);

  const insertMany = db.transaction((traces: TraceSpan[]) => {
    for (const trace of traces) {
      insert.run({
        eventId: trace.eventId ?? null,
        traceId: trace.traceId,
        spanId: trace.spanId,
        parentSpanId: trace.parentSpanId ?? null,
        service: trace.service,
        operation: trace.operation,
        startTime: trace.startTime,
        durationMs: trace.durationMs,
        status: trace.status,
        statusCode: trace.statusCode ?? null,
        metadata: trace.metadata ? JSON.stringify(trace.metadata) : null
      });
    }
  });

  insertMany(parsed.data);

  return res.json({
    accepted: parsed.data.length
  });
});

router.post("/deployments", (req, res) => {
  const parsed = ingestDeploymentsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid deployment payload",
      details: parsed.error.flatten()
    });
  }

  const insert = db.prepare(`
    INSERT INTO deployments (
      eventId,
      timestamp,
      service,
      eventType,
      version,
      commitId,
      deployedBy,
      environment,
      metadata
    ) VALUES (
      @eventId,
      @timestamp,
      @service,
      @eventType,
      @version,
      @commitId,
      @deployedBy,
      @environment,
      @metadata
    )
  `);

  const insertMany = db.transaction((deployments: DeploymentEvent[]) => {
    for (const d of deployments) {
      insert.run({
        eventId: d.eventId ?? null,
        timestamp: d.timestamp,
        service: d.service,
        eventType: d.eventType,
        version: d.version ?? null,
        commitId: d.commitId ?? null,
        deployedBy: d.deployedBy ?? null,
        environment: d.environment ?? null,
        metadata: d.metadata ? JSON.stringify(d.metadata) : null
      });
    }
  });

  insertMany(parsed.data);

  return res.json({
    accepted: parsed.data.length
  });
});

router.post("/database-events", (req, res) => {
  const parsed = ingestDatabaseEventsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid database event payload",
      details: parsed.error.flatten()
    });
  }

  const insert = db.prepare(`
    INSERT INTO database_events (
      eventId,
      timestamp,
      service,
      eventType,
      severity,
      message,
      metadata
    ) VALUES (
      @eventId,
      @timestamp,
      @service,
      @eventType,
      @severity,
      @message,
      @metadata
    )
  `);

  const insertMany = db.transaction((events: DatabaseEvent[]) => {
    for (const ev of events) {
      insert.run({
        eventId: ev.eventId ?? null,
        timestamp: ev.timestamp,
        service: ev.service,
        eventType: ev.eventType,
        severity: ev.severity ?? null,
        message: ev.message ?? null,
        metadata: ev.metadata ? JSON.stringify(ev.metadata) : null
      });
    }
  });

  insertMany(parsed.data);

  return res.json({
    accepted: parsed.data.length
  });
});

router.post("/api-failures", (req, res) => {
  const parsed = ingestApiFailuresSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid api failure payload",
      details: parsed.error.flatten()
    });
  }

  const insert = db.prepare(`
    INSERT INTO api_failures (
      eventId,
      timestamp,
      service,
      endpoint,
      method,
      statusCode,
      errorType,
      count,
      dependency,
      traceId,
      metadata
    ) VALUES (
      @eventId,
      @timestamp,
      @service,
      @endpoint,
      @method,
      @statusCode,
      @errorType,
      @count,
      @dependency,
      @traceId,
      @metadata
    )
  `);

  const insertMany = db.transaction((failures: ApiFailureEvent[]) => {
    for (const f of failures) {
      insert.run({
        eventId: f.eventId ?? null,
        timestamp: f.timestamp,
        service: f.service,
        endpoint: f.endpoint,
        method: f.method,
        statusCode: f.statusCode,
        errorType: f.errorType ?? null,
        count: f.count ?? 1,
        dependency: f.dependency ?? null,
        traceId: f.traceId ?? null,
        metadata: f.metadata ? JSON.stringify(f.metadata) : null
      });
    }
  });

  insertMany(parsed.data);

  return res.json({
    accepted: parsed.data.length
  });
});

router.post("/dependencies", (req, res) => {
  const parsed = ingestDependenciesSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid dependency payload",
      details: parsed.error.flatten()
    });
  }

  const insert = db.prepare(`
    INSERT INTO service_dependencies (
      service,
      dependsOn,
      callType,
      environment
    ) VALUES (
      @service,
      @dependsOn,
      @callType,
      @environment
    )
  `);

  const insertMany = db.transaction((deps: ServiceDependency[]) => {
    for (const dep of deps) {
      insert.run({
        service: dep.service,
        dependsOn: dep.dependsOn,
        callType: dep.callType ?? null,
        environment: dep.environment ?? null
      });
    }
  });

  insertMany(parsed.data);

  return res.json({
    accepted: parsed.data.length
  });
});

export default router;

