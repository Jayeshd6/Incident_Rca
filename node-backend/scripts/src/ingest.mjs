import { post } from "./http.mjs";
import { SERVICE, DB_SERVICE, EXTERNAL_SERVICE } from "./config.mjs";

export async function ingestAll(store) {
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

  const logsResponse = await post("/ingest/logs", store.logs);
  console.log("Ingested logs:", logsResponse.accepted);

  const metricsResponse = await post("/ingest/metrics", store.metrics);
  console.log("Ingested metrics:", metricsResponse.accepted);

  const tracesResponse = await post("/ingest/traces", store.traces);
  console.log("Ingested traces:", tracesResponse.accepted);

  const deploymentsResponse = await post("/ingest/deployments", store.deployments);
  console.log("Ingested deployments:", deploymentsResponse.accepted);

  const databaseEventsResponse = await post("/ingest/database-events", store.databaseEvents);
  console.log("Ingested database events:", databaseEventsResponse.accepted);

  const apiFailuresResponse = await post("/ingest/api-failures", store.apiFailures);
  console.log("Ingested API failures:", apiFailuresResponse.accepted);
}