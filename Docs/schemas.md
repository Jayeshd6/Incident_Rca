# Telemetry & Analysis Data Schemas

This document defines the data models and schemas used across the Incident Root Cause Analysis (RCA) system. It details the ingestion formats, internal database layouts, API structures for the Python Analysis Service, and the final Structured Incident Report.

---

## 1. Ingestion Schemas

These schemas define the payload structures accepted by the Node.js backend's ingestion endpoints. Zod schema validation is used to enforce these contracts.

### 1.1. Application Logs
*   **Endpoint:** `POST /ingest/logs`
*   **Description:** Represents application error messages, warning signals, or debug logs.

```typescript
import { z } from 'zod';

export const LogIngestSchema = z.object({
  timestamp: z.string().datetime(), // ISO 8601 string
  service: z.string().min(1),       // e.g., "payment-service"
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']),
  message: z.string(),
  traceId: z.string().optional(),   // Correlates log to specific request trace
  metadata: z.record(z.any()).optional(), // Contextual key-values (e.g. userId, ip)
});

export type LogIngest = z.infer<typeof LogIngestSchema>;
```

#### Example Payload
```json
{
  "timestamp": "2026-08-28T14:02:15.123Z",
  "service": "payment-service",
  "level": "ERROR",
  "message": "Connection timeout trying to reach database server at 10.0.0.5:5432",
  "traceId": "t-839f-29da-910a",
  "metadata": {
    "db_host": "10.0.0.5",
    "port": 5432,
    "timeout_ms": 5000
  }
}
```

---

### 1.2. Metrics
*   **Endpoint:** `POST /ingest/metrics`
*   **Description:** Numeric time-series values showing system health over time.

```typescript
export const MetricIngestSchema = z.object({
  timestamp: z.string().datetime(),
  service: z.string().min(1),
  metric_name: z.string().min(1), // e.g., "cpu_usage", "api_latency"
  value: z.number(),
  labels: z.record(z.string()).optional(), // e.g., { "host": "ip-10-0-1-5", "endpoint": "/charge" }
});

export type MetricIngest = z.infer<typeof MetricIngestSchema>;
```

#### Example Payload
```json
{
  "timestamp": "2026-08-28T14:02:00.000Z",
  "service": "checkout-service",
  "metric_name": "api_latency_ms",
  "value": 1250.4,
  "labels": {
    "host": "ip-10-0-2-12",
    "endpoint": "/checkout",
    "status": "200"
  }
}
```

---

### 1.3. Traces (Spans)
*   **Endpoint:** `POST /ingest/traces`
*   **Description:** Distributed tracing spans recording operations, execution hierarchy, and duration.

```typescript
export const SpanIngestSchema = z.object({
  traceId: z.string().min(1),
  spanId: z.string().min(1),
  parentSpanId: z.string().optional(),
  service: z.string().min(1),
  operationName: z.string().min(1),
  startTime: z.string().datetime(),  // Span start
  endTime: z.string().datetime(),    // Span end
  durationMs: z.number().nonnegative(),
  status: z.enum(['OK', 'ERROR']),
  errorMessage: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type SpanIngest = z.infer<typeof SpanIngestSchema>;
```

#### Example Payload
```json
{
  "traceId": "t-839f-29da-910a",
  "spanId": "s-payment-call",
  "parentSpanId": "s-checkout-root",
  "service": "payment-service",
  "operationName": "POST /charge",
  "startTime": "2026-08-28T14:02:10.100Z",
  "endTime": "2026-08-28T14:02:15.123Z",
  "durationMs": 5023.0,
  "status": "ERROR",
  "errorMessage": "TimeoutError: connection gateway failed",
  "metadata": {
    "http.method": "POST",
    "http.status_code": 504
  }
}
```

---

### 1.4. Deployments
*   **Endpoint:** `POST /ingest/deployments`
*   **Description:** Deployment change events indicating code releases or configuration rollouts.

```typescript
export const DeploymentIngestSchema = z.object({
  timestamp: z.string().datetime(),
  service: z.string().min(1),
  version: z.string().min(1),       // e.g., "v1.4.2" or "git-commit-hash"
  environment: z.enum(['production', 'staging', 'development']),
  status: z.enum(['success', 'failed', 'rolled_back']),
  deployedBy: z.string(),
  changelog: z.array(
    z.object({
      commitHash: z.string(),
      author: z.string(),
      message: z.string(),
    })
  ).optional(),
});

export type DeploymentIngest = z.infer<typeof DeploymentIngestSchema>;
```

#### Example Payload
```json
{
  "timestamp": "2026-08-28T14:00:00.000Z",
  "service": "payment-service",
  "version": "v1.8.9",
  "environment": "production",
  "status": "success",
  "deployedBy": "ci-cd-runner@company.com",
  "changelog": [
    {
      "commitHash": "8f83b2d",
      "author": "Alice Dev",
      "message": "refactor: optimize stripe payment timeout settings"
    }
  ]
}
```

---

### 1.5. Database Events
*   **Endpoint:** `POST /ingest/database-events`
*   **Description:** Database-level anomalies or structural events, such as slow queries, lock contention, or connection saturation.

```typescript
export const DatabaseEventIngestSchema = z.object({
  timestamp: z.string().datetime(),
  databaseName: z.string().min(1), // e.g., "users-db"
  eventType: z.enum(['slow_query', 'connection_pool_exhausted', 'lock_timeout', 'replication_lag']),
  query: z.string().optional(),     // The slow SQL query, if applicable
  durationMs: z.number().optional(), // Duration of the slow query or event lock duration
  message: z.string(),              // Natural language description of the alert
});

export type DatabaseEventIngest = z.infer<typeof DatabaseEventIngestSchema>;
```

#### Example Payload
```json
{
  "timestamp": "2026-08-28T14:01:45.000Z",
  "databaseName": "transactions-db",
  "eventType": "slow_query",
  "query": "SELECT * FROM transactions WHERE status = 'pending' FOR UPDATE;",
  "durationMs": 3500.0,
  "message": "Query took 3500ms exceeding threshold of 1000ms"
}
```

---

### 1.6. API Failures
*   **Endpoint:** `POST /ingest/api-failures`
*   **Description:** Tracks external/internal HTTP API calling failures and timeout events.

```typescript
export const ApiFailureIngestSchema = z.object({
  timestamp: z.string().datetime(),
  service: z.string().min(1),           // Caller service e.g., "checkout-service"
  endpoint: z.string().min(1),          // Target path called
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  statusCode: z.number().int(),         // Status code received e.g., 500, 504 (or 0 for network drop)
  errorType: z.enum(['timeout', 'http_error', 'network_error', 'dns_failure']),
  downstreamService: z.string().optional(), // Remote service name (if internal/third-party)
  message: z.string(),
});

export type ApiFailureIngest = z.infer<typeof ApiFailureIngestSchema>;
```

#### Example Payload
```json
{
  "timestamp": "2026-08-28T14:02:12.000Z",
  "service": "checkout-service",
  "endpoint": "/v1/charges",
  "method": "POST",
  "statusCode": 504,
  "errorType": "timeout",
  "downstreamService": "payment-service",
  "message": "Gateway timeout of 5000ms exceeded calling downstream service"
}
```

---

## 2. Relational Database Schema

The Node.js backend persists ingested telemetry inside a relational database (SQLite for development, PostgreSQL for production). Below is the SQL DDL mapping the tables.

```sql
-- 1. Logs Table
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    service VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    trace_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_logs_timestamp_service ON logs(service, timestamp);
CREATE INDEX idx_logs_trace_id ON logs(trace_id);

-- 2. Metrics Table
CREATE TABLE metrics (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    service VARCHAR(255) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    labels JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_metrics_query ON metrics(service, metric_name, timestamp);

-- 3. Traces (Spans) Table
CREATE TABLE spans (
    id SERIAL PRIMARY KEY,
    trace_id VARCHAR(255) NOT NULL,
    span_id VARCHAR(255) NOT NULL,
    parent_span_id VARCHAR(255),
    service VARCHAR(255) NOT NULL,
    operation_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_ms DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_spans_trace ON spans(trace_id);
CREATE INDEX idx_spans_query ON spans(service, start_time, end_time);

-- 4. Deployments Table
CREATE TABLE deployments (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    service VARCHAR(255) NOT NULL,
    version VARCHAR(255) NOT NULL,
    environment VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    deployed_by VARCHAR(255) NOT NULL,
    changelog JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_deployments_lookup ON deployments(service, timestamp DESC);

-- 5. Database Events Table
CREATE TABLE database_events (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    database_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    query TEXT,
    duration_ms DOUBLE PRECISION,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_db_events ON database_events(database_name, timestamp DESC);

-- 6. API Failures Table
CREATE TABLE api_failures (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    service VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    error_type VARCHAR(100) NOT NULL,
    downstream_service VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_api_failures ON api_failures(service, timestamp DESC);

-- 7. Incident Analysis Sessions Table
CREATE TABLE analysis_sessions (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_query TEXT NOT NULL,
    service VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'running', 'completed', 'failed'
    structured_report JSONB,      -- Houses the final Structured Incident Report
    explanation TEXT              -- Natural language summary generated by the LLM
);
```

---

## 3. Python Analysis Service API Schemas

The Python service (FastAPI) performs specialized calculations. Data frames are sent from Node.js as JSON, processed in Python, and returned. Below are the Pydantic schemas.

### 3.1. Datatypes

```python
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class MetricDataPoint(BaseModel):
    timestamp: datetime
    value: float
```

### 3.2. Anomaly Detection
*   **Endpoint:** `POST /analyze/anomalies`
*   **Description:** Takes a time-series and runs statistical (e.g. Z-score, IQR) or ML (e.g. Isolation Forest) models to identify outliers.

```python
class AnomalyDetectionRequest(BaseModel):
    time_series: List[MetricDataPoint]
    method: str = "z_score"  # options: "z_score", "iqr", "isolation_forest", "one_class_svm"
    parameters: Dict[str, Any] = {} # e.g. {"threshold": 3.0, "contamination": 0.05}

class Anomaly(BaseModel):
    timestamp: datetime
    value: float
    anomaly_score: float  # Score from the model
    is_anomaly: bool

class AnomalyDetectionResponse(BaseModel):
    anomalies: List[Anomaly]
    summary: Dict[str, Any] # e.g. {"total_points": 100, "anomaly_count": 5}
```

### 3.3. Time-Series Correlation
*   **Endpoint:** `POST /analyze/correlation`
*   **Description:** Computes the mathematical correlation (with lag) between two metrics.

```python
class CorrelationRequest(BaseModel):
    series_a: List[MetricDataPoint]
    series_b: List[MetricDataPoint]
    method: str = "pearson" # options: "pearson", "spearman", "cross_correlation"

class CorrelationResponse(BaseModel):
    correlation_coefficient: float # -1.0 to 1.0
    time_lag_seconds: float       # Shift needed to maximize correlation
    p_value: float                # Statistical significance
    confidence: str               # "high", "medium", "low"
```

### 3.4. Change-Point Detection
*   **Endpoint:** `POST /analyze/changepoints`
*   **Description:** Detects sudden shifts in mean or variance of a metric using offline segmentations (e.g. ruptures library).

```python
class ChangePointRequest(BaseModel):
    time_series: List[MetricDataPoint]
    penalty: float = 1.0
    model: str = "l2" # options: "l2", "rbf", "normal"

class ChangePointResponse(BaseModel):
    change_points: List[datetime] # List of timestamps where a shift occurred
    segments: List[Dict[str, Any]] # Metrics within each segment: {"start": t1, "end": t2, "mean": val}
```

---

## 4. Evidence & Root Cause Ranking Schemas

The Node.js Orchestrator collects individual observations ("Evidence") from ingestion logs, traces, database events, and Python anomalies. It runs a deterministic formula to aggregate them into ranked hypotheses.

### 4.1. TypeScript Interfaces

```typescript
export type EvidenceSource = 'log' | 'metric' | 'trace' | 'deployment' | 'database' | 'api_failure';

export interface Evidence {
  id: string;             // Format: "ev_<source>_<uuid>"
  source: EvidenceSource;
  timestamp: string;      // ISO 8601 when the anomaly occurred
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;     // Value between 0.0 and 1.0 indicating signal strength
  message: string;        // Human readable description (e.g., "Error rate spiked to 12%")
  metadata: {
    service: string;
    metricName?: string;
    anomalyScore?: number;
    errorSignature?: string;
    deploymentVersion?: string;
    sqlQuery?: string;
    endpoint?: string;
    traceId?: string;
    [key: string]: any;   // Extensible for other metadata
  };
}

export interface RootCauseHypothesis {
  rank: number;
  category: 'Deployment' | 'Memory Leak' | 'Database Saturation' | 'External API Failure' | 'Dependency Failure' | 'Traffic Spike' | 'Configuration Drift';
  score: number;          // Aggregated root cause probability (0.0 to 1.0)
  confidence: number;     // Combined confidence score of underlying evidence
  reason: string;         // Human explanation of the hypothesis (e.g., "Service deployment 'v1.2.3' occurred 3 mins before error spikes")
  evidenceIds: string[];  // Array of Evidence.id linking back to the raw findings
}

export interface StructuredIncidentReport {
  incidentId: string;
  queryContext: {
    service: string;
    timeframe: {
      start: string;
      end: string;
    };
    originalQuery: string;
  };
  rankedRootCauses: RootCauseHypothesis[];
  evidenceList: Evidence[];
}
```
