import { db } from "../database";
const DEFAULT_LIMIT = 10000;
const parseJson = (value) => {
    if (!value) {
        return undefined;
    }
    try {
        return JSON.parse(value);
    }
    catch {
        return undefined;
    }
};
export const telemetryRepository = {
    getLogs(query) {
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
        });
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
            metadata: parseJson(row.metadata)
        }));
    },
    getMetrics(query) {
        const limit = query.limit ?? DEFAULT_LIMIT;
        let sql = `
      SELECT *
      FROM metrics
      WHERE service = @service
        AND timestamp >= @startTime
        AND timestamp <= @endTime
    `;
        const params = {
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
        const rows = db.prepare(sql).all(params);
        return rows.map(row => ({
            id: row.id,
            eventId: row.eventId ?? undefined,
            timestamp: row.timestamp,
            service: row.service,
            metric: row.metric,
            value: row.value,
            unit: row.unit ?? undefined,
            labels: parseJson(row.labels)
        }));
    },
    getTraceSpans(query) {
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
        });
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
            metadata: parseJson(row.metadata)
        }));
    },
    getDeployments(query) {
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
        });
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
            metadata: parseJson(row.metadata)
        }));
    },
    getDatabaseEvents(query) {
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
        });
        return rows.map(row => ({
            id: row.id,
            eventId: row.eventId ?? undefined,
            timestamp: row.timestamp,
            service: row.service,
            eventType: row.eventType,
            severity: row.severity ?? undefined,
            message: row.message ?? undefined,
            metadata: parseJson(row.metadata)
        }));
    },
    getApiFailures(query) {
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
        });
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
            metadata: parseJson(row.metadata)
        }));
    },
    getDependenciesByService(service) {
        const rows = db.prepare(`
      SELECT *
      FROM service_dependencies
      WHERE service = @service
         OR dependsOn = @service
    `).all({
            service
        });
        return rows.map(row => ({
            id: row.id,
            service: row.service,
            dependsOn: row.dependsOn,
            callType: row.callType ?? undefined,
            environment: row.environment ?? undefined
        }));
    }
};
//# sourceMappingURL=telemetry.repository.js.map