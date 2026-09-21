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
export declare function normalizeMessage(message: string): string;
export declare function extractExceptionType(message: string): string | undefined;
export declare function createErrorSignature(normalizedMessage: string): string;
export declare function normalizeLog(log: StoredLog): NormalizedLog;
export declare function normalizeLogs(logs: StoredLog[]): NormalizedLog[];
//# sourceMappingURL=logNormalizer.d.ts.map