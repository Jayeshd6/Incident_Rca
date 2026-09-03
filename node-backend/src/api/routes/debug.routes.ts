import { Router } from "express";
import { z } from "zod";
import { telemetryRepository } from "../../db/repositories/telemetry.repository";

const router = Router();

const timestampSchema = z.string().refine(
  value => !Number.isNaN(Date.parse(value)),
  {
    message: "Invalid timestamp. Use ISO format."
  }
);

const querySchema = z.object({
  service: z.string().min(1),
  startTime: timestampSchema,
  endTime: timestampSchema
});

router.get("/telemetry", (req, res) => {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten()
    });
  }

  const { service, startTime, endTime } = parsed.data;

  const logs = telemetryRepository.getLogs({
    service,
    startTime,
    endTime
  });

  const metrics = telemetryRepository.getMetrics({
    service,
    startTime,
    endTime
  });

  const traces = telemetryRepository.getTraceSpans({
    service,
    startTime,
    endTime
  });

  const deployments = telemetryRepository.getDeployments({
    service,
    startTime,
    endTime
  });

  const databaseEvents = telemetryRepository.getDatabaseEvents({
    service,
    startTime,
    endTime
  });

  const apiFailures = telemetryRepository.getApiFailures({
    service,
    startTime,
    endTime
  });

  const dependencies = telemetryRepository.getDependenciesByService(service);

  return res.json({
    query: parsed.data,
    counts: {
      logs: logs.length,
      metrics: metrics.length,
      traces: traces.length,
      deployments: deployments.length,
      databaseEvents: databaseEvents.length,
      apiFailures: apiFailures.length
    },
    dependencyCount: dependencies.length
  });
});

export default router;
