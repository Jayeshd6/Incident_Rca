import { SERVICE, DB_SERVICE } from "../config.mjs";
import {
  randomBetween,
  randomIntBetween,
  chance,
  randomId,
  addMinutes,
  addSeconds
} from "../utils.mjs";

export function generateNormalLogs(store, start, end) {
  let current = new Date(start);

  const infoMessages = [
    "Payment request processed",
    "Health check completed",
    "Transaction completed successfully"
  ];

  while (current < end) {
    const infoCount = randomIntBetween(1, 2);

    for (let i = 0; i < infoCount; i++) {
      store.pushLog(
        addSeconds(current, randomIntBetween(0, 59)),
        SERVICE,
        "INFO",
        infoMessages[randomIntBetween(0, infoMessages.length - 1)]
      );
    }

    if (chance(0.08)) {
      store.pushLog(
        addSeconds(current, randomIntBetween(0, 59)),
        SERVICE,
        "WARN",
        "Slow response from downstream service"
      );
    }

    if (chance(0.02)) {
      store.pushLog(
        addSeconds(current, randomIntBetween(0, 59)),
        SERVICE,
        "ERROR",
        "Temporary network timeout"
      );
    }

    current = addMinutes(current, 1);
  }
}

export function generateNormalMetrics(store, start, end) {
  let current = new Date(start);

  while (current < end) {
    store.pushMetric(current, SERVICE, "cpu_usage", randomBetween(30, 45), "percent", "synthetic-normal");
    store.pushMetric(current, SERVICE, "memory_usage", randomBetween(55, 65), "percent", "synthetic-normal");
    store.pushMetric(current, SERVICE, "api_latency", randomBetween(180, 250), "ms", "synthetic-normal");
    store.pushMetric(current, SERVICE, "error_rate", randomBetween(0.1, 0.8), "percent", "synthetic-normal");
    store.pushMetric(current, SERVICE, "request_rate", randomBetween(900, 1100), "count", "synthetic-normal");
    store.pushMetric(current, SERVICE, "db_connections", randomBetween(20, 40), "count", "synthetic-normal");

    current = addMinutes(current, 1);
  }
}

export function generateNormalTraces(store, start, end) {
  let current = new Date(start);

  while (current < end) {
    const traceId = `trace-${randomId()}`;
    const parentSpanId = `span-${randomId()}`;

    store.pushTraceSpan({
      traceId,
      spanId: parentSpanId,
      service: SERVICE,
      operation: "POST /payments/create",
      startTime: current.toISOString(),
      durationMs: randomIntBetween(120, 250),
      status: "ok",
      statusCode: 200
    });

    store.pushTraceSpan({
      traceId,
      spanId: `span-${randomId()}`,
      parentSpanId,
      service: DB_SERVICE,
      operation: "SELECT transactions",
      startTime: addSeconds(current, 1).toISOString(),
      durationMs: randomIntBetween(20, 60),
      status: "ok"
    });

    current = addMinutes(current, 5);
  }
}
export function generateNormalApiFailures(store, start, end) {
  const firstFailure = addMinutes(start, randomIntBetween(5, 25));
  const secondFailure = addMinutes(start, randomIntBetween(30, 55));

  const failureTimes = [firstFailure, secondFailure];

  for (const timestamp of failureTimes) {
    store.pushApiFailure({
      timestamp: timestamp.toISOString(),
      service: SERVICE,
      endpoint: "/payments/create",
      method: "POST",
      statusCode: 500,
      errorType: "InternalServerError",
      count: 1
    });
  }
}