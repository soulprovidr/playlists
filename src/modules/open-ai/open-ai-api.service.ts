import { backOff } from "exponential-backoff";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { logger } from "@logger";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const openai = new OpenAI({ apiKey });

export async function getCompletion<T extends z.AnyZodObject>(
  prompt: string,
  schema: T,
): Promise<z.infer<T>> {
  const completion = await backOff(
    () =>
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(schema, "response"),
      }),
    { numOfAttempts: 5 },
  );

  const content = completion.choices[0].message.content?.trim();
  if (!content) {
    return [];
  }

  try {
    const parsedContent = JSON.parse(content) as z.infer<T>;
    return parsedContent;
  } catch (error) {
    logger.error({ err: error }, "Error parsing JSON");
    return [];
  }
}
