const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

const SERVICE = "payment-service";
const DB_SERVICE = "payments-db";
const EXTERNAL_SERVICE = "fraud-detection-service";

const START = new Date("2026-08-24T13:30:00Z");
const END = new Date("2026-08-24T14:30:00Z");

const logs = [];
const metrics = [];
const traces = [];
const apiFailures = [];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomIntBetween(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function chance(probability) {
  return Math.random() < probability;
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function addSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1000);
}

async function post(path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`POST ${path} failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function ingestDependencies() {
  const dependencies = [
    {
      service: SERVICE,
      dependsOn: DB_SERVICE,
      callType: "db",
      environment: "production"
    },
    {
      service: SERVICE,
      dependsOn: EXTERNAL_SERVICE,
      callType: "http",
      environment: "production"
    }
  ];

  await post("/ingest/dependencies", dependencies);
  console.log("Ingested dependencies:", dependencies.length);
}

function generateMetrics() {
  const metricConfigs = [
    {
      metric: "cpu_usage",
      unit: "percent",
      getValue: () => randomBetween(30, 45)
    },
    {
      metric: "memory_usage",
      unit: "percent",
      getValue: () => randomBetween(55, 65)
    },
    {
      metric: "api_latency",
      unit: "ms",
      getValue: () => randomBetween(180, 250)
    },
    {
      metric: "error_rate",
      unit: "percent",
      getValue: () => randomBetween(0.1, 0.8)
    },
    {
      metric: "request_rate",
      unit: "count",
      getValue: () => randomBetween(900, 1100)
    },
    {
      metric: "db_connections",
      unit: "count",
      getValue: () => randomBetween(20, 40)
    }
  ];

  let current = new Date(START);

  while (current <= END) {
    for (const config of metricConfigs) {
      metrics.push({
        timestamp: current.toISOString(),
        service: SERVICE,
        metric: config.metric,
        value: Number(config.getValue().toFixed(2)),
        unit: config.unit,
        labels: {
          source: "synthetic-normal"
        }
      });
    }

    current = addMinutes(current, 1);
  }
}

function generateLogs() {
  let current = new Date(START);

  const infoMessages = [
    "Payment request processed",
    "Health check completed",
    "Cache refreshed",
    "Transaction completed successfully"
  ];

  const warnMessages = [
    "Slow response from downstream service",
    "Retry attempt for external call"
  ];

  const errorMessages = [
    "Temporary network timeout",
    "Transient database timeout"
  ];

  while (current <= END) {
    const infoCount = randomIntBetween(1, 3);

    for (let i = 0; i < infoCount; i++) {
      logs.push({
        timestamp: addSeconds(current, randomIntBetween(0, 59)).toISOString(),
        service: SERVICE,
        level: "INFO",
        message: infoMessages[randomIntBetween(0, infoMessages.length - 1)],
        traceId: `trace-${randomId()}`,
        environment: "production"
      });
    }

    if (chance(0.10)) {
      logs.push({
        timestamp: addSeconds(current, randomIntBetween(0, 59)).toISOString(),
        service: SERVICE,
        level: "WARN",
        message: warnMessages[randomIntBetween(0, warnMessages.length - 1)],
        traceId: `trace-${randomId()}`,
        environment: "production"
      });
    }

    if (chance(0.03)) {
      logs.push({
        timestamp: addSeconds(current, randomIntBetween(0, 59)).toISOString(),
        service: SERVICE,
        level: "ERROR",
        message: errorMessages[randomIntBetween(0, errorMessages.length - 1)],
        traceId: `trace-${randomId()}`,
        environment: "production"
      });
    }

    current = addMinutes(current, 1);
  }
}

function generateTraces() {
  let current = new Date(START);

  while (current <= END) {
    const traceId = `trace-${randomId()}`;
    const parentSpanId = `span-${randomId()}`;
    const childSpanId = `span-${randomId()}`;

    traces.push({
      traceId,
      spanId: parentSpanId,
      service: SERVICE,
      operation: "POST /payments/create",
      startTime: current.toISOString(),
      durationMs: randomIntBetween(120, 250),
      status: "ok",
      statusCode: 200
    });

    traces.push({
      traceId,
      spanId: childSpanId,
      parentSpanId,
      service: DB_SERVICE,
      operation: "SELECT transactions",
      startTime: addSeconds(current, 0.05).toISOString(),
      durationMs: randomIntBetween(20, 60),
      status: "ok"
    });

    current = addMinutes(current, 5);
  }
}

function generateApiFailures() {
  const failureTimes = [
    addMinutes(START, randomIntBetween(5, 25)),
    addMinutes(START, randomIntBetween(30, 55))
  ];

  for (const timestamp of failureTimes) {
    apiFailures.push({
      timestamp: timestamp.toISOString(),
      service: SERVICE,
      endpoint: "/payments/create",
      method: "POST",
      statusCode: 500,
      errorType: "InternalServerError",
      count: 1,
      environment: "production"
    });
  }
}

async function run() {
  console.log("Generating normal baseline data...");

  generateMetrics();
  generateLogs();
  generateTraces();
  generateApiFailures();

  await ingestDependencies();

  const metricsResponse = await post("/ingest/metrics", metrics);
  console.log("Ingested metrics:", metricsResponse.accepted);

  const logsResponse = await post("/ingest/logs", logs);
  console.log("Ingested logs:", logsResponse.accepted);

  const tracesResponse = await post("/ingest/traces", traces);
  console.log("Ingested traces:", tracesResponse.accepted);

  const apiFailuresResponse = await post("/ingest/api-failures", apiFailures);
  console.log("Ingested API failures:", apiFailuresResponse.accepted);

  console.log("Normal baseline data generation completed.");
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
