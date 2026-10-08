import { telemetryRepository } from "../../db/repositories/telemetry.repository";
import { normalizeLogs } from "./logNormalizer";
import { groupErrorLogs } from "./logGrouper";

export interface LogEvidence {
  tool: string;
  service: string;
  errorSpike: boolean;
  errorCountBefore: number;
  errorCountDuring: number;
  errorIncreaseRatio: number;
  newErrorSignatures: string[];
  topErrorSignatures: string[];
  anomalyScore: number;
}

export function detectLogSpike(input: {
  service: string;
  startTime: string;
  endTime: string;
}): LogEvidence {
  // 1. Calculate incident window duration
  const startMs = new Date(input.startTime).getTime();
  const endMs = new Date(input.endTime).getTime();
  const durationMs = endMs - startMs;

  // 2. Calculate baseline window
  const baselineStartMs = startMs - durationMs;
  const baselineEndMs = startMs;

  const baselineStartTime = new Date(baselineStartMs).toISOString();
  const baselineEndTime = new Date(baselineEndMs).toISOString();

  // 3. Fetch logs for baseline window
  const baselineLogs = telemetryRepository.getLogs({
    service: input.service,
    startTime: baselineStartTime,
    endTime: baselineEndTime
  });

  // 4. Fetch logs for incident window
  const incidentLogs = telemetryRepository.getLogs({
    service: input.service,
    startTime: input.startTime,
    endTime: input.endTime
  });

  // 5. Normalize logs for both windows
  const baselineNormalized = normalizeLogs(baselineLogs);
  const incidentNormalized = normalizeLogs(incidentLogs);

  // 6. Group error logs for both windows
  const baselineGroups = groupErrorLogs(baselineNormalized);
  const incidentGroups = groupErrorLogs(incidentNormalized);

  // 7. Calculate error counts (total ERROR and FATAL logs)
  const errorCountBefore = baselineGroups.reduce((sum, g) => sum + g.count, 0);
  const errorCountDuring = incidentGroups.reduce((sum, g) => sum + g.count, 0);

  // 8. Calculate error increase ratio rounded to 2 decimal places
  const rawRatio = errorCountDuring / Math.max(errorCountBefore, 1);
  const errorIncreaseRatio = Number(rawRatio.toFixed(2));

  // 9. Find new error signatures
  const baselineSignatures = new Set(baselineGroups.map(g => g.errorSignature));
  const newErrorSignatures = incidentGroups
    .map(g => g.errorSignature)
    .filter(sig => !baselineSignatures.has(sig));

  // 10. Find top 5 error signatures from incident window
  const topErrorSignatures = incidentGroups
    .slice(0, 5)
    .map(g => g.errorSignature);

  // 11. Calculate anomalyScore between 0 and 1
  let score = 0;

  if (errorCountDuring > errorCountBefore) {
    score += Math.min(0.7, errorIncreaseRatio / 10);
  }

  if (newErrorSignatures.length > 0) {
    score += 0.2;
  }

  if (errorCountDuring >= 20) {
    score += 0.1;
  }

  score = Math.min(1, score);
  const anomalyScore = Number(score.toFixed(2));

  // 12. Set errorSpike
  const errorSpike = anomalyScore >= 0.5;

  // 13. Return evidence
  return {
    tool: "log_analysis",
    service: input.service,
    errorSpike,
    errorCountBefore,
    errorCountDuring,
    errorIncreaseRatio,
    newErrorSignatures,
    topErrorSignatures,
    anomalyScore
  };
}
