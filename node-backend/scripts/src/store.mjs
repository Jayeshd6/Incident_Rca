import { randomId } from "./utils.mjs";

export function createDataStore() {
  const logs = [];
  const metrics = [];
  const traces = [];
  const deployments = [];
  const databaseEvents = [];
  const apiFailures = [];

  function pushMetric(timestamp, service, metric, value, unit, source) {
    metrics.push({
      timestamp: timestamp.toISOString(),
      service,
      metric,
      value: Number(value.toFixed(2)),
      unit,
      labels: {
        source
      }
    });
  }

  function pushLog(timestamp, service, level, message) {
    logs.push({
      timestamp: timestamp.toISOString(),
      service,
      level,
      message,
      traceId: `trace-${randomId()}`,
      environment: "production"
    });
  }

  function pushTraceSpan(span) {
    traces.push(span);
  }

  function pushDeployment(event) {
    deployments.push(event);
  }

  function pushDatabaseEvent(event) {
    databaseEvents.push(event);
  }

  function pushApiFailure(event) {
    apiFailures.push(event);
  }

  return {
    logs,
    metrics,
    traces,
    deployments,
    databaseEvents,
    apiFailures,
    pushMetric,
    pushLog,
    pushTraceSpan,
    pushDeployment,
    pushDatabaseEvent,
    pushApiFailure
  };
}