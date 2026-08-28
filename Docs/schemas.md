# Data Schemas

All timestamps use UTC ISO 8601 format.

Example:

```text
2026-08-24T14:00:00Z
```

## Common Fields

Required for all telemetry events:

```text
timestamp
service
```

Optional:

```text
eventId
environment
```

---

## 1. LogEntry

Required:

```text
timestamp
service
level
message
```

Optional:

```text
traceId
host
```

Allowed levels:

```text
DEBUG
INFO
WARN
ERROR
FATAL
```

Example:

```json
{
  "timestamp": "2026-08-24T14:02:10Z",
  "service": "payment-service",
  "level": "ERROR",
  "message": "Database connection timeout"
}
```

---

## 2. MetricPoint

Required:

```text
timestamp
service
metric
value
```

Optional:

```text
unit
labels
```

Example:

```json
{
  "timestamp": "2026-08-24T14:05:00Z",
  "service": "payment-service",
  "metric": "cpu_usage",
  "value": 94.2
}
```

---

## 3. TraceSpan

Required:

```text
traceId
spanId
service
operation
startTime
durationMs
status
```

Optional:

```text
parentSpanId
statusCode
```

Allowed status:

```text
ok
error
```

Example:

```json
{
  "traceId": "abc123",
  "spanId": "span-2",
  "service": "payment-service",
  "operation": "POST /payments/create",
  "startTime": "2026-08-24T14:02:00Z",
  "durationMs": 3200,
  "status": "error"
}
```

---

## 4. DeploymentEvent

Required:

```text
timestamp
service
eventType
version
```

Optional:

```text
commitId
deployedBy
environment
```

Allowed eventType:

```text
deployment
rollback
```

Example:

```json
{
  "timestamp": "2026-08-24T14:00:00Z",
  "service": "payment-service",
  "eventType": "deployment",
  "version": "v2.14.0"
}
```

---

## 5. DatabaseEvent

Required:

```text
timestamp
service
eventType
severity
```

Optional:

```text
message
metadata
```

Allowed eventType:

```text
slow_query
connection_pool_exhaustion
lock_timeout
replication_lag
other
```

Example:

```json
{
  "timestamp": "2026-08-24T14:06:00Z",
  "service": "payments-db",
  "eventType": "connection_pool_exhaustion",
  "severity": "critical"
}
```

---

## 6. ApiFailureEvent

Required:

```text
timestamp
service
endpoint
method
statusCode
```

Optional:

```text
errorType
count
```

Allowed method:

```text
GET
POST
PUT
DELETE
```

Example:

```json
{
  "timestamp": "2026-08-24T14:04:00Z",
  "service": "payment-service",
  "endpoint": "/payments/create",
  "method": "POST",
  "statusCode": 500
}
```

---

## 7. ServiceDependency

Required:

```text
service
dependsOn
```

Example:

```json
{
  "service": "payment-service",
  "dependsOn": "payments-db"
}
```

---

## 8. InvestigationRequest

Required:

```text
service
startTime
endTime
```

Example:

```json
{
  "service": "payment-service",
  "startTime": "2026-08-24T14:00:00Z",
  "endTime": "2026-08-24T14:30:00Z"
}
```

---

## 9. RootCauseResult

Required:

```text
cause
score
confidence
```

Optional:

```text
reasons
```

Allowed cause:

```text
deployment
memory_leak
database_saturation
external_api_failure
network_issue
configuration_drift
traffic_spike
dependency_failure
unknown
```

Allowed confidence:

```text
low
medium
high
```

Example:

```json
{
  "cause": "deployment",
  "score": 0.92,
  "confidence": "high",
  "reasons": [
    "Deployment occurred before incident start",
    "Error rate increased after deployment"
  ]
}
```

---

## 10. InvestigationResponse

Required:

```text
incidentWindow
anomalies
correlations
rankedRootCauses
explanation
```

Example:

```json
{
  "incidentWindow": {
    "service": "payment-service",
    "startTime": "2026-08-24T14:00:00Z",
    "endTime": "2026-08-24T14:30:00Z"
  },
  "anomalies": [],
  "correlations": [],
  "rankedRootCauses": [],
  "explanation": "The incident likely started after a deployment."
}
```

---

## Validation Rules

```text
Timestamps must be UTC ISO 8601
All telemetry events must include service
Metric value must be a number
Trace durationMs must be >= 0
Log level must be valid
Trace status must be ok or error
```
