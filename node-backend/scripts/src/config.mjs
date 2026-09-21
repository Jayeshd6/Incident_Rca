export const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

export const SERVICE = "payment-service";
export const DB_SERVICE = "payments-db";
export const EXTERNAL_SERVICE = "fraud-detection-service";

export const SCENARIOS = {
  deployment: {
    date: "2026-08-24"
  },
  "db-saturation": {
    date: "2026-08-25"
  },
  "external-api": {
    date: "2026-08-26"
  },
  "memory-leak": {
    date: "2026-08-27"
  },
  "no-incident": {
    date: "2026-08-28"
  }
};