import { z } from "zod";

export type Env<TEnvSchema extends z.ZodObject<z.ZodRawShape>> = z.infer<TEnvSchema>;

export function createEnv<TEnvSchema extends z.ZodObject<z.ZodRawShape>>(
  envSchema: TEnvSchema,
): Env<TEnvSchema> {
  return envSchema.parse(process.env);
}
