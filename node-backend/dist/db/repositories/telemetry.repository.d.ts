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
export declare const telemetryRepository: {
    getLogs(query: TimeRangeQuery): StoredLog[];
    getMetrics(query: MetricQuery): StoredMetric[];
    getTraceSpans(query: TimeRangeQuery): StoredTraceSpan[];
    getDeployments(query: TimeRangeQuery): StoredDeploymentEvent[];
    getDatabaseEvents(query: TimeRangeQuery): StoredDatabaseEvent[];
    getApiFailures(query: TimeRangeQuery): StoredApiFailureEvent[];
    getDependenciesByService(service: string): StoredServiceDependency[];
};
//# sourceMappingURL=telemetry.repository.d.ts.map