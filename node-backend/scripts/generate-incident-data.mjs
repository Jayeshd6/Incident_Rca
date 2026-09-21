import { SCENARIOS } from "./src/config.mjs";
import { createDataStore } from "./src/store.mjs";
import { ingestAll } from "./src/ingest.mjs";

import {
  generateNormalLogs,
  generateNormalMetrics,
  generateNormalTraces
} from "./src/generators/normal.mjs";

import {
  generateIncidentMetrics,
  generateIncidentLogs,
  generateIncidentTraces,
  generateIncidentEvents,
  generateApiFailures
} from "./src/generators/incident.mjs";

const scenario = process.argv[2] || "deployment";

if (!SCENARIOS[scenario]) {
  console.error(`
Unknown scenario.

Use one of these:

node scripts/generate-incident-data.mjs deployment
node scripts/generate-incident-data.mjs db-saturation
node scripts/generate-incident-data.mjs external-api
node scripts/generate-incident-data.mjs memory-leak
node scripts/generate-incident-data.mjs no-incident
  `);
  process.exit(1);
}

const scenarioConfig = SCENARIOS[scenario];

const PRE_START = new Date(`${scenarioConfig.date}T13:30:00Z`);
const INCIDENT_START = new Date(`${scenarioConfig.date}T14:00:00Z`);
const END = new Date(`${scenarioConfig.date}T14:30:00Z`);

async function run() {
  console.log(`Generating incident data for scenario: ${scenario}`);

  const store = createDataStore();

  generateNormalLogs(store, PRE_START, INCIDENT_START);
  generateNormalMetrics(store, PRE_START, INCIDENT_START);
  generateNormalTraces(store, PRE_START, INCIDENT_START);

  if (scenario === "no-incident") {
    generateNormalLogs(store, INCIDENT_START, END);
    generateNormalMetrics(store, INCIDENT_START, END);
    generateNormalTraces(store, INCIDENT_START, END);
  } else {
    generateIncidentMetrics(store, scenario, INCIDENT_START, END);
    generateIncidentLogs(store, scenario, INCIDENT_START, END);
    generateIncidentTraces(store, scenario, INCIDENT_START, END);
    generateIncidentEvents(store, scenario, INCIDENT_START);
    generateApiFailures(store, scenario, INCIDENT_START, END);
  }

  await ingestAll(store);

  console.log("Incident data generation completed.");
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});