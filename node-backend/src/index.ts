import express from "express";
import cors from "cors";
import { config } from "./core/config";
import ingestRoutes from "./api/routes/ingest.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "node-backend"
  });
});

app.get("/health/python", async (req, res) => {
  try {
    const response = await fetch(`${config.PYTHON_ANALYSIS_URL}/health`);
    const data = await response.json();

    res.json({
      message: "Python service is reachable",
      pythonService: data
    });
  } catch (error) {
    res.status(500).json({
      error: "Python service is not reachable"
    });
  }
});

app.use("/ingest", ingestRoutes);

app.listen(config.NODE_PORT, () => {
  console.log(`Node backend running on port ${config.NODE_PORT}`);
});