import { db } from "../database";

export interface TimeRangeQuery {
  service: string;
  startTime: string;
  endTime: string;
  limit?: number | undefined;
}

export interface MetricQuery extends TimeRangeQuery {
  metric?: string | undefined;
}

export interface StoredLog {
  id: number;
  eventId?: string | undefined;
  timestamp: string;
  service: string;
  level: string;
  message: string;
  traceId?: string | undefined;
  host?: string | undefined;
  environment?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface StoredMetric {
  id: number;
  eventId?: string | undefined;
  timestamp: string;
  service: string;
  metric: string;
  value: number;
  unit?: string | undefined;
  labels?: Record<string, string> | undefined;
}

export interface StoredTraceSpan {
  id: number;
  eventId?: string | undefined;
  traceId: string;
  spanId: string;
  parentSpanId?: string | undefined;
  service: string;
  operation: string;
  startTime: string;
  durationMs: number;
  status: string;
  statusCode?: number | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface StoredDeploymentEvent {
  id: number;
  eventId?: string | undefined;
  timestamp: string;
  service: string;
  eventType: string;
  version?: string | undefined;
  commitId?: string | undefined;
  deployedBy?: string | undefined;
  environment?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface StoredDatabaseEvent {
  id: number;
  eventId?: string | undefined;
  timestamp: string;
  service: string;
  eventType: string;
  severity?: string | undefined;
  message?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface StoredApiFailureEvent {
  id: number;
  eventId?: string | undefined;
  timestamp: string;
  service: string;
  endpoint: string;
  method: string;
  statusCode: number;
  errorType?: string | undefined;
  count?: number | undefined;
  dependency?: string | undefined;
  traceId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface StoredServiceDependency {
  id: number;
  service: string;
  dependsOn: string;
  callType?: string | undefined;
  environment?: string | undefined;
}

const DEFAULT_LIMIT = 10000;

const parseJson = <T>(value: string | null): T | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

export const telemetryRepository = {
  getLogs(query: TimeRangeQuery): StoredLog[] {
    const limit = query.limit ?? DEFAULT_LIMIT;

    const rows = db.prepare(`
      SELECT *
      FROM logs
      WHERE service = @service
        AND timestamp >= @startTime
        AND timestamp <= @endTime
      ORDER BY timestamp ASC
      LIMIT @limit
    `).all({
      service: query.service,
      startTime: query.startTime,
      endTime: query.endTime,
      limit
    }) as any[];

    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId ?? undefined,
      timestamp: row.timestamp,
      service: row.service,
      level: row.level,
      message: row.message,
      traceId: row.traceId ?? undefined,
      host: row.host ?? undefined,
      environment: row.environment ?? undefined,
      metadata: parseJson<Record<string, unknown>>(row.metadata)
    }));
  },

  getMetrics(query: MetricQuery): StoredMetric[] {
    const limit = query.limit ?? DEFAULT_LIMIT;

    let sql = `
      SELECT *
      FROM metrics
      WHERE service = @service
        AND timestamp >= @startTime
        AND timestamp <= @endTime
    `;

    const params: Record<string, unknown> = {
      service: query.service,
      startTime: query.startTime,
      endTime: query.endTime,
      limit
    };

    if (query.metric) {
      sql += ` AND metric = @metric`;
      params.metric = query.metric;
    }

    sql += ` ORDER BY timestamp ASC LIMIT @limit`;

    const rows = db.prepare(sql).all(params) as any[];

    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId ?? undefined,
      timestamp: row.timestamp,
      service: row.service,
      metric: row.metric,
      value: row.value,
      unit: row.unit ?? undefined,
      labels: parseJson<Record<string, string>>(row.labels)
    }));
  },

  getTraceSpans(query: TimeRangeQuery): StoredTraceSpan[] {
    const limit = query.limit ?? DEFAULT_LIMIT;

    const rows = db.prepare(`
      SELECT *
      FROM traces
      WHERE service = @service
        AND startTime >= @startTime
        AND startTime <= @endTime
      ORDER BY startTime ASC
      LIMIT @limit
    `).all({
      service: query.service,
      startTime: query.startTime,
      endTime: query.endTime,
      limit
    }) as any[];

    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId ?? undefined,
      traceId: row.traceId,
      spanId: row.spanId,
      parentSpanId: row.parentSpanId ?? undefined,
      service: row.service,
      operation: row.operation,
      startTime: row.startTime,
      durationMs: row.durationMs,
      status: row.status,
      statusCode: row.statusCode ?? undefined,
      metadata: parseJson<Record<string, unknown>>(row.metadata)
    }));
  },

  getDeployments(query: TimeRangeQuery): StoredDeploymentEvent[] {
    const limit = query.limit ?? DEFAULT_LIMIT;

    const rows = db.prepare(`
      SELECT *
      FROM deployments
      WHERE service = @service
        AND timestamp >= @startTime
        AND timestamp <= @endTime
      ORDER BY timestamp ASC
      LIMIT @limit
    `).all({
      service: query.service,
      startTime: query.startTime,
      endTime: query.endTime,
      limit
    }) as any[];

    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId ?? undefined,
      timestamp: row.timestamp,
      service: row.service,
      eventType: row.eventType,
      version: row.version ?? undefined,
      commitId: row.commitId ?? undefined,
      deployedBy: row.deployedBy ?? undefined,
      environment: row.environment ?? undefined,
      metadata: parseJson<Record<string, unknown>>(row.metadata)
    }));
  },

  getDatabaseEvents(query: TimeRangeQuery): StoredDatabaseEvent[] {
    const limit = query.limit ?? DEFAULT_LIMIT;

    const rows = db.prepare(`
      SELECT *
      FROM database_events
      WHERE service = @service
        AND timestamp >= @startTime
        AND timestamp <= @endTime
      ORDER BY timestamp ASC
      LIMIT @limit
    `).all({
      service: query.service,
      startTime: query.startTime,
      endTime: query.endTime,
      limit
    }) as any[];

    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId ?? undefined,
      timestamp: row.timestamp,
      service: row.service,
      eventType: row.eventType,
      severity: row.severity ?? undefined,
      message: row.message ?? undefined,
      metadata: parseJson<Record<string, unknown>>(row.metadata)
    }));
  },

  getApiFailures(query: TimeRangeQuery): StoredApiFailureEvent[] {
    const limit = query.limit ?? DEFAULT_LIMIT;

    const rows = db.prepare(`
      SELECT *
      FROM api_failures
      WHERE service = @service
        AND timestamp >= @startTime
        AND timestamp <= @endTime
      ORDER BY timestamp ASC
      LIMIT @limit
    `).all({
      service: query.service,
      startTime: query.startTime,
      endTime: query.endTime,
      limit
    }) as any[];

    return rows.map(row => ({
      id: row.id,
      eventId: row.eventId ?? undefined,
      timestamp: row.timestamp,
      service: row.service,
      endpoint: row.endpoint,
      method: row.method,
      statusCode: row.statusCode,
      errorType: row.errorType ?? undefined,
      count: row.count ?? undefined,
      dependency: row.dependency ?? undefined,
      traceId: row.traceId ?? undefined,
      metadata: parseJson<Record<string, unknown>>(row.metadata)
    }));
  },

  getDependenciesByService(service: string): StoredServiceDependency[] {
    const rows = db.prepare(`
      SELECT *
      FROM service_dependencies
      WHERE service = @service
         OR dependsOn = @service
    `).all({
      service
    }) as any[];

    return rows.map(row => ({
      id: row.id,
      service: row.service,
      dependsOn: row.dependsOn,
      callType: row.callType ?? undefined,
      environment: row.environment ?? undefined
    }));
  }
};
