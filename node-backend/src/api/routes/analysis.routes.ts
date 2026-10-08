import { Router } from "express";
import { z } from "zod";
import { telemetryRepository } from "../../db/repositories/telemetry.repository";
import { normalizeLogs } from "../../analysis/logAnalysis/logNormalizer";
import { groupErrorLogs } from "../../analysis/logAnalysis/logGrouper";
import { detectLogSpike } from "../../analysis/logAnalysis/logSpikeDetector";

const router = Router();

const timestampSchema = z.string().refine(
  value => !Number.isNaN(Date.parse(value)),
  {
    message: "Invalid timestamp. Use ISO format."
  }
);

const querySchema = z.object({
  service: z.string().min(1, "service is required"),
  startTime: timestampSchema,
  endTime: timestampSchema,
  limit: z.coerce
    .number()
    .int("limit must be an integer")
    .positive("limit must be a positive integer")
    .max(1000, "limit cannot exceed 1000")
    .optional()
});

const logGroupsQuerySchema = z.object({
  service: z.string().min(1, "service is required"),
  startTime: timestampSchema,
  endTime: timestampSchema,
  limit: z.coerce
    .number()
    .int("limit must be an integer")
    .positive("limit must be a positive integer")
    .max(100, "limit cannot exceed 100")
    .default(20)
});

const logEvidenceQuerySchema = z.object({
  service: z.string().min(1, "service is required"),
  startTime: timestampSchema,
  endTime: timestampSchema
});

router.get("/logs/normalized", (req, res) => {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten()
    });
  }

  const { service, startTime, endTime, limit } = parsed.data;

  const logs = telemetryRepository.getLogs({
    service,
    startTime,
    endTime,
    limit
  });

  const normalizedLogs = normalizeLogs(logs);

  return res.json({
    query: parsed.data,
    count: normalizedLogs.length,
    sample: normalizedLogs.slice(0, 20)
  });
});

router.get("/logs/groups", (req, res) => {
  const parsed = logGroupsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten()
    });
  }

  const { service, startTime, endTime, limit } = parsed.data;

  const logs = telemetryRepository.getLogs({
    service,
    startTime,
    endTime
  });

  const normalizedLogs = normalizeLogs(logs);
  const groups = groupErrorLogs(normalizedLogs);

  return res.json({
    query: parsed.data,
    count: groups.length,
    groups: groups.slice(0, limit)
  });
});

router.get("/logs/evidence", (req, res) => {
  const parsed = logEvidenceQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten()
    });
  }

  const evidence = detectLogSpike(parsed.data);

  return res.json({
    query: parsed.data,
    evidence
  });
});

export default router;


