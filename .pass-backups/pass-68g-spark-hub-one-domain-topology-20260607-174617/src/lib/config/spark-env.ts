import { z } from 'zod';

const ClientEnvSchema = z.object({
  PUBLIC_SPARK_API_URL: z.string().url().optional().default('http://localhost:8787'),
  PUBLIC_SPARK_HUB_URL: z.string().url().optional().default('https://spark.user.cloudjkt01.com/hub'),
  PUBLIC_SPARK_APP_URL: z.string().url().optional().default('http://localhost:5173'),
  PUBLIC_SPARK_APP_NAME: z.string().optional().default('Karyra Spark'),
  PUBLIC_SPARK_MODE: z.enum(['local', 'preview', 'production']).optional().default('local')
});

export const sparkEnv = ClientEnvSchema.parse({
  PUBLIC_SPARK_API_URL: import.meta.env.PUBLIC_SPARK_API_URL,
  PUBLIC_SPARK_HUB_URL: import.meta.env.PUBLIC_SPARK_HUB_URL,
  PUBLIC_SPARK_APP_URL: import.meta.env.PUBLIC_SPARK_APP_URL,
  PUBLIC_SPARK_APP_NAME: import.meta.env.PUBLIC_SPARK_APP_NAME,
  PUBLIC_SPARK_MODE: import.meta.env.PUBLIC_SPARK_MODE
});
