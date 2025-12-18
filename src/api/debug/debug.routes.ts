import { clearLogs, getLogs, logEmitter, logger } from "@logger";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

export const debugRoutes = new Hono()
  .get("/logs/stream", (c) => {
    logger.debug("[Debug] Client connected to log stream");

    return streamSSE(c, async (stream) => {
      let isActive = true;

      // Send initial logs
      const logs = getLogs();
      logger.debug(`[Debug] Sending ${logs.length} initial logs to client`);
      for (const log of logs) {
        if (!isActive) break;
        await stream.writeSSE({
          data: JSON.stringify({ log }),
        });
      }

      // Listen for new logs
      const onLog = async (log: string) => {
        if (isActive) {
          await stream.writeSSE({
            data: JSON.stringify({ log }),
          });
        }
      };

      const onClear = async () => {
        if (isActive) {
          await stream.writeSSE({
            data: JSON.stringify({ clear: true }),
          });
        }
      };

      logEmitter.on("log", onLog);
      logEmitter.on("clear", onClear);

      // Cleanup on abort
      stream.onAbort(() => {
        isActive = false;
        logEmitter.off("log", onLog);
        logEmitter.off("clear", onClear);
        logger.debug("[Debug] Client disconnected from log stream");
      });

      // Keep stream open with periodic keep-alive
      while (isActive) {
        await stream.writeSSE({
          data: JSON.stringify({ keepalive: true }),
        });
        await stream.sleep(15000); // 15 seconds
      }
    });
  })
  .get("/logs/all", (c) => {
    const logs = getLogs();
    logger.info(`[Debug] Returning ${logs.length} logs`);
    return c.json({ logs, count: logs.length });
  })
  .delete("/logs", (c) => {
    clearLogs();
    logger.info("[Debug] Logs cleared");
    return c.json({ success: true });
  });
