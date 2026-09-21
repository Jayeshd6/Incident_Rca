import { z } from "zod";
export declare const logEntrySchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    service: z.ZodString;
    level: z.ZodEnum<{
        DEBUG: "DEBUG";
        ERROR: "ERROR";
        FATAL: "FATAL";
        INFO: "INFO";
        WARN: "WARN";
    }>;
    message: z.ZodString;
    traceId: z.ZodOptional<z.ZodString>;
    host: z.ZodOptional<z.ZodString>;
    environment: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const metricPointSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    service: z.ZodString;
    metric: z.ZodString;
    value: z.ZodNumber;
    unit: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export declare const traceSpanSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    traceId: z.ZodString;
    spanId: z.ZodString;
    parentSpanId: z.ZodOptional<z.ZodString>;
    service: z.ZodString;
    operation: z.ZodString;
    startTime: z.ZodString;
    durationMs: z.ZodNumber;
    status: z.ZodEnum<{
        error: "error";
        ok: "ok";
    }>;
    statusCode: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const deploymentEventSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    service: z.ZodString;
    eventType: z.ZodEnum<{
        config_change: "config_change";
        deployment: "deployment";
        migration: "migration";
        restart: "restart";
        rollback: "rollback";
        scaling: "scaling";
    }>;
    version: z.ZodOptional<z.ZodString>;
    commitId: z.ZodOptional<z.ZodString>;
    deployedBy: z.ZodOptional<z.ZodString>;
    environment: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const databaseEventSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    service: z.ZodString;
    eventType: z.ZodEnum<{
        connection_pool_exhaustion: "connection_pool_exhaustion";
        deadlock: "deadlock";
        disk_pressure: "disk_pressure";
        failover: "failover";
        high_cpu: "high_cpu";
        lock_timeout: "lock_timeout";
        other: "other";
        replication_lag: "replication_lag";
        slow_query: "slow_query";
        transaction_rollback: "transaction_rollback";
    }>;
    severity: z.ZodOptional<z.ZodEnum<{
        critical: "critical";
        info: "info";
        warning: "warning";
    }>>;
    message: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const apiFailureEventSchema: z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    service: z.ZodString;
    endpoint: z.ZodString;
    method: z.ZodEnum<{
        DELETE: "DELETE";
        GET: "GET";
        PATCH: "PATCH";
        POST: "POST";
        PUT: "PUT";
    }>;
    statusCode: z.ZodNumber;
    errorType: z.ZodOptional<z.ZodString>;
    count: z.ZodOptional<z.ZodNumber>;
    dependency: z.ZodOptional<z.ZodString>;
    traceId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const serviceDependencySchema: z.ZodObject<{
    service: z.ZodString;
    dependsOn: z.ZodString;
    callType: z.ZodOptional<z.ZodEnum<{
        cache: "cache";
        db: "db";
        grpc: "grpc";
        http: "http";
        queue: "queue";
    }>>;
    environment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ingestLogsSchema: z.ZodArray<z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    service: z.ZodString;
    level: z.ZodEnum<{
        DEBUG: "DEBUG";
        ERROR: "ERROR";
        FATAL: "FATAL";
        INFO: "INFO";
        WARN: "WARN";
    }>;
    message: z.ZodString;
    traceId: z.ZodOptional<z.ZodString>;
    host: z.ZodOptional<z.ZodString>;
    environment: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>>;
export declare const ingestMetricsSchema: z.ZodArray<z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    service: z.ZodString;
    metric: z.ZodString;
    value: z.ZodNumber;
    unit: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>>;
export declare const ingestTracesSchema: z.ZodArray<z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    traceId: z.ZodString;
    spanId: z.ZodString;
    parentSpanId: z.ZodOptional<z.ZodString>;
    service: z.ZodString;
    operation: z.ZodString;
    startTime: z.ZodString;
    durationMs: z.ZodNumber;
    status: z.ZodEnum<{
        error: "error";
        ok: "ok";
    }>;
    statusCode: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>>;
export declare const ingestDeploymentsSchema: z.ZodArray<z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    service: z.ZodString;
    eventType: z.ZodEnum<{
        config_change: "config_change";
        deployment: "deployment";
        migration: "migration";
        restart: "restart";
        rollback: "rollback";
        scaling: "scaling";
    }>;
    version: z.ZodOptional<z.ZodString>;
    commitId: z.ZodOptional<z.ZodString>;
    deployedBy: z.ZodOptional<z.ZodString>;
    environment: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>>;
export declare const ingestDatabaseEventsSchema: z.ZodArray<z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    service: z.ZodString;
    eventType: z.ZodEnum<{
        connection_pool_exhaustion: "connection_pool_exhaustion";
        deadlock: "deadlock";
        disk_pressure: "disk_pressure";
        failover: "failover";
        high_cpu: "high_cpu";
        lock_timeout: "lock_timeout";
        other: "other";
        replication_lag: "replication_lag";
        slow_query: "slow_query";
        transaction_rollback: "transaction_rollback";
    }>;
    severity: z.ZodOptional<z.ZodEnum<{
        critical: "critical";
        info: "info";
        warning: "warning";
    }>>;
    message: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>>;
export declare const ingestApiFailuresSchema: z.ZodArray<z.ZodObject<{
    eventId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    service: z.ZodString;
    endpoint: z.ZodString;
    method: z.ZodEnum<{
        DELETE: "DELETE";
        GET: "GET";
        PATCH: "PATCH";
        POST: "POST";
        PUT: "PUT";
    }>;
    statusCode: z.ZodNumber;
    errorType: z.ZodOptional<z.ZodString>;
    count: z.ZodOptional<z.ZodNumber>;
    dependency: z.ZodOptional<z.ZodString>;
    traceId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>>;
export declare const ingestDependenciesSchema: z.ZodArray<z.ZodObject<{
    service: z.ZodString;
    dependsOn: z.ZodString;
    callType: z.ZodOptional<z.ZodEnum<{
        cache: "cache";
        db: "db";
        grpc: "grpc";
        http: "http";
        queue: "queue";
    }>>;
    environment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>>;
export type LogEntry = z.infer<typeof logEntrySchema>;
export type MetricPoint = z.infer<typeof metricPointSchema>;
export type TraceSpan = z.infer<typeof traceSpanSchema>;
export type DeploymentEvent = z.infer<typeof deploymentEventSchema>;
export type DatabaseEvent = z.infer<typeof databaseEventSchema>;
export type ApiFailureEvent = z.infer<typeof apiFailureEventSchema>;
export type ServiceDependency = z.infer<typeof serviceDependencySchema>;
//# sourceMappingURL=telemetry.schema.d.ts.map