import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_PORT: z.coerce.number().default(4000),
  PYTHON_ANALYSIS_URL: z.string().default('http://localhost:8000'),
});

export const config = envSchema.parse(process.env);