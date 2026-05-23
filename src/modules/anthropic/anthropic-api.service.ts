import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 5,
});

export async function getCompletion<T extends z.ZodObject<z.ZodRawShape>>(
  prompt: string,
  schema: T,
): Promise<z.infer<T>> {
  const response = await client.messages.parse({
    model: "claude-haiku-4-5",
    max_tokens: 8096,
    messages: [{ role: "user", content: prompt }],
    output_config: { format: zodOutputFormat(schema) },
  });

  if (!response.parsed_output) {
    throw new Error("No structured output returned");
  }

  return response.parsed_output;
}
