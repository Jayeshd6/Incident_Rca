import { Router } from "express";
import { z } from "zod";
import { telemetryRepository } from "../../db/repositories/telemetry.repository";
import { normalizeLogs } from "../../analysis/logAnalysis/logNormalizer";

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

export default router;
