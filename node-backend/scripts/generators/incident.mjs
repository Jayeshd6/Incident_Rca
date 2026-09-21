import { SERVICE, DB_SERVICE, EXTERNAL_SERVICE } from "../config.mjs";
import {
  randomBetween,
  randomIntBetween,
  chance,
  randomId,
  addMinutes,
  addSeconds
} from "../utils.mjs";

export function generateIncidentMetrics(store, scenario, incidentStart, end) {
  // Move your existing incident metric logic here.
  // Use store.pushMetric(...)
}

export function generateIncidentLogs(store, scenario, incidentStart, end) {
  // Move your existing incident log logic here.
  // Use store.pushLog(...)
}

export function generateIncidentTraces(store, scenario, incidentStart, end) {
  // Move your existing incident trace logic here.
  // Use store.pushTraceSpan(...)
}

export function generateIncidentEvents(store, scenario, incidentStart) {
  // Move your deployment and database event logic here.
  // Use store.pushDeployment(...)
  // Use store.pushDatabaseEvent(...)
}

export function generateApiFailures(store, scenario, incidentStart, end) {
  // Move your API failure logic here.
  // Use store.pushApiFailure(...)
}