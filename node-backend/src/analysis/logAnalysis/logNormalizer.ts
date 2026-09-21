import { StoredLog } from "../../db/repositories/telemetry.repository";

export interface NormalizedLog {
  id: number;
  timestamp: string;
  service: string;
  level: string;
  originalMessage: string;
  normalizedMessage: string;
  errorSignature: string;
  exceptionType?: string | undefined;
  traceId?: string | undefined;
  host?: string | undefined;
  environment?: string | undefined;
}

export function normalizeMessage(message: string): string {
  if (!message) {
    return "";
  }

  let normalized = message.trim();

  // Replace emails with <email>
  normalized = normalized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    "<email>"
  );

  // Replace UUIDs with <uuid>
  normalized = normalized.replace(
    /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
    "<uuid>"
  );

  // Replace IP addresses with <ip>
  normalized = normalized.replace(
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    "<ip>"
  );

  // Replace standalone numbers with <num>
  normalized = normalized.replace(/\b\d+\b/g, "<num>");

  // Collapse multiple spaces into one space and trim
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

export function extractExceptionType(message: string): string | undefined {
  if (!message) {
    return undefined;
  }

  // Detect words ending with Error, Exception, Failure, Timeout
  const match = message.match(/\b[A-Za-z0-9_]*(?:Error|Exception|Failure|Timeout)\b/);
  return match ? match[0] : undefined;
}

export function createErrorSignature(normalizedMessage: string): string {
  if (!normalizedMessage) {
    return "";
  }

  return normalizedMessage.toLowerCase().trim().slice(0, 120);
}

export function normalizeLog(log: StoredLog): NormalizedLog {
  const normalizedMsg = normalizeMessage(log.message);
  const exceptionType = extractExceptionType(log.message);
  const errorSignature = createErrorSignature(normalizedMsg);

  return {
    id: log.id,
    timestamp: log.timestamp,
    service: log.service,
    level: log.level,
    originalMessage: log.message,
    normalizedMessage: normalizedMsg,
    errorSignature,
    exceptionType,
    traceId: log.traceId,
    host: log.host,
    environment: log.environment
  };
}

export function normalizeLogs(logs: StoredLog[]): NormalizedLog[] {
  return logs.map(normalizeLog);
}
