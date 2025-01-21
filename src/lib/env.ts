import { ZodObject, z } from "zod";

export interface EnvSchema extends ZodObject<{}> {}

export type Env<TEnvSchema extends EnvSchema> = z.infer<TEnvSchema>;

export const createEnv = <TEnvSchema extends EnvSchema>(
  envSchema: TEnvSchema,
): Env<TEnvSchema> => {
  return envSchema.parse(process.env);
};
