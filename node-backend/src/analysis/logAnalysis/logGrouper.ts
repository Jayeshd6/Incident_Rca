import { NormalizedLog } from "./logNormalizer";

export interface LogErrorGroup {
  errorSignature: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  sampleMessage: string;
  exceptionType?: string | undefined;
  level: string;
}

export function groupErrorLogs(normalizedLogs: NormalizedLog[]): LogErrorGroup[] {
  const groupMap = new Map<string, LogErrorGroup>();

  for (const log of normalizedLogs) {
    const levelUpper = log.level ? log.level.toUpperCase() : "";

    // 1. Only include logs where level is ERROR or FATAL
    if (levelUpper !== "ERROR" && levelUpper !== "FATAL") {
      continue;
    }

    const signature = log.errorSignature;
    const existing = groupMap.get(signature);

    if (!existing) {
      const newGroup: LogErrorGroup = {
        errorSignature: signature,
        count: 1,
        firstSeen: log.timestamp,
        lastSeen: log.timestamp,
        sampleMessage: log.originalMessage,
        level: levelUpper === "FATAL" ? "FATAL" : "ERROR"
      };

      if (log.exceptionType) {
        newGroup.exceptionType = log.exceptionType;
      }

      groupMap.set(signature, newGroup);
    } else {
      existing.count += 1;

      // 4. Track firstSeen using the earliest timestamp
      if (Date.parse(log.timestamp) < Date.parse(existing.firstSeen)) {
        existing.firstSeen = log.timestamp;
      }

      // 5. Track lastSeen using the latest timestamp
      if (Date.parse(log.timestamp) > Date.parse(existing.lastSeen)) {
        existing.lastSeen = log.timestamp;
      }

      // 7. Keep exceptionType if available
      if (!existing.exceptionType && log.exceptionType) {
        existing.exceptionType = log.exceptionType;
      }

      // 8. If any log in the group is FATAL, level should be FATAL
      if (levelUpper === "FATAL") {
        existing.level = "FATAL";
      }
    }
  }

  // 10. Sort groups by count descending
  const groups = Array.from(groupMap.values());
  groups.sort((a, b) => b.count - a.count);

  // 11. Return the array of LogErrorGroup
  return groups;
}
