# MVP Scope

## Project Goal

Build an AI Incident Response and Root Cause Analysis system that can investigate
incidents using telemetry data and explain probable root causes.

## Target Users

- Backend engineers
- SREs
- On-call engineers
- DevOps engineers

## Example User Queries

- "Why did payment-service fail between 14:00 and 14:30?"
- "What caused high latency in checkout-service?"
- "Was the incident related to a deployment?"
- "Which dependency caused payment-service timeouts?"

## Inputs

The system will ingest:

1. Application logs
2. Metrics
3. Traces
4. Deployment events
5. Database events
6. API failure events

## Core Features

### 1. Telemetry Ingestion

The system will accept structured telemetry data through APIs.

Endpoints:

- POST /ingest/logs
- POST /ingest/metrics
- POST /ingest/traces
- POST /ingest/deployments
- POST /ingest/database-events
- POST /ingest/api-failures

### 2. Log Analysis

The system will:

- Parse logs
- Normalize logs
- Group similar errors
- Detect error spikes
- Identify new error signatures

### 3. Metric Anomaly Detection

The system will detect abnormal behavior in metrics such as:

- CPU usage
- Memory usage
- API latency
- Error rate
- Database connections

Methods:

- Z-score
- IQR
- Moving average deviation
- Isolation Forest
- One-Class SVM

### 4. Time-Series Analysis

The system will detect:

- Sudden spikes
- Gradual increases
- Change points
- Metric correlations

### 5. Deployment Correlation

The system will check whether an incident started shortly after a deployment.

Example:

```text
14:00 → deployment
14:03 → error rate increases
14:05 → latency increases
```

### 6. Database Event Correlation

The system will analyze database-related signals such as:

- Slow queries
- Connection pool exhaustion
- Lock timeouts
- Replication lag

### 7. API Failure Correlation

The system will analyze:

- HTTP 500 increases
- Timeout increases
- External API failures
- Endpoint failure spikes

### 8. Trace Analysis

The system will analyze simplified trace spans to detect:

- Slow spans
- Failed spans
- Slow dependencies

### 9. Root Cause Ranking

The system will rank possible root causes such as:

- Deployment
- Memory leak
- Database saturation
- External API failure
- Network issue
- Configuration change
- Traffic spike
- Dependency failure

Ranking will use:

- Temporal correlation
- Anomaly scores
- Log evidence
- Metric evidence
- Deployment proximity
- Dependency impact

### 10. LLM Explanation

The LLM will:

- Understand the user query
- Decide which tools to call
- Explain structured analysis results

The LLM will not:

- Guess root causes
- Invent logs
- Invent metrics
- Invent deployments
