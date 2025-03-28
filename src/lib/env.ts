import { z } from "zod";

export type Env<TEnvSchema extends z.AnyZodObject> = z.infer<TEnvSchema>;

export function createEnv<TEnvSchema extends z.AnyZodObject>(
  envSchema: TEnvSchema,
): Env<TEnvSchema> {
  return envSchema.parse(process.env);
}
