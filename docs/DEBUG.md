# Debug Feature

This application includes a comprehensive debug page with real-time log streaming capabilities.

## Overview

The debug feature replaces all `console.log` statements with a structured logging library (pino) and provides a web-based interface to view logs in real-time.

## Components

### 1. Logger Module (`src/_logger.ts`)

The logger is built on top of **pino**, a fast and low-overhead logging library for Node.js.

**Features:**
- Structured JSON logging in production
- Pretty-printed colorized logs in development
- In-memory log buffer (last 1000 entries)
- Real-time event emission for streaming
- Multiple log levels: trace, debug, info, warn, error, fatal

**Usage:**
```typescript
import { logger } from "@logger";

// Simple info log
logger.info("User logged in");

// Log with variables
logger.info(`Processing ${count} items`);

// Error logging with error object
try {
  // some code
} catch (error) {
  logger.error({ err: error }, "Failed to process request");
}

// Debug logging (development only)
logger.debug("Detailed debug information");

// Warning
logger.warn("Something unexpected happened");
```

### 2. Debug API Routes (`src/api/debug/`)

Provides HTTP endpoints for accessing logs:

**Endpoints:**
- `GET /api/debug/logs/stream` - Server-Sent Events (SSE) stream for real-time logs
- `GET /api/debug/logs/all` - Get all buffered logs as JSON
- `DELETE /api/debug/logs` - Clear the log buffer

**SSE Message Format:**
```json
{
  "log": "{\"level\":30,\"time\":1234567890,\"msg\":\"Log message\"}"
}
```

Special messages:
- `{ "clear": true }` - Indicates logs were cleared
- `{ "keepalive": true }` - Keep-alive ping (every 15 seconds)

### 3. Debug Page (`src/client/features/debug/`)

A React-based web interface for viewing logs in real-time.

**Features:**
- Real-time log streaming via SSE
- Connection status indicator
- Auto-scroll toggle
- Download logs as text file
- Clear logs button
- Log count statistics
- Color-coded log levels
- Formatted timestamps

**Access:**
Navigate to `/debug` in your browser while the application is running.

## How It Works

1. **Log Capture:** When any part of the server code calls `logger.info()`, `logger.error()`, etc., the log is:
   - Written to stdout (visible in terminal)
   - Stored in an in-memory circular buffer (max 1000 entries)
   - Emitted as an event via Node.js EventEmitter

2. **Real-Time Streaming:** The SSE endpoint listens for log events and streams them to connected clients in real-time.

3. **Client Display:** The debug page connects to the SSE endpoint and displays logs as they arrive, with automatic formatting and color coding.

## Log Levels

Pino uses numeric log levels:

| Level | Name  | Description                    |
|-------|-------|--------------------------------|
| 10    | trace | Most verbose debugging info    |
| 20    | debug | Debug information              |
| 30    | info  | Informational messages         |
| 40    | warn  | Warning messages               |
| 50    | error | Error messages                 |
| 60    | fatal | Fatal errors                   |

In development mode, the log level is set to `debug` (20).
In production mode, the log level is set to `info` (30).

## Migration from console.log

All `console.log`, `console.error`, `console.warn`, etc. have been replaced with the appropriate logger methods:

**Before:**
```typescript
console.log("User logged in");
console.error("Failed to save:", error);
```

**After:**
```typescript
import { logger } from "@logger";

logger.info("User logged in");
logger.error({ err: error }, "Failed to save");
```

**Important:** When logging errors, always pass the error object as a separate parameter using the `{ err: error }` syntax. This allows pino to properly serialize the error with stack trace.

## Best Practices

1. **Use appropriate log levels:**
   - `trace`/`debug` for development debugging
   - `info` for general informational messages
   - `warn` for unexpected but recoverable situations
   - `error` for errors that need attention
   - `fatal` for critical errors that cause shutdown

2. **Include context:**
   ```typescript
   logger.info({ userId, playlistId }, "Building playlist");
   ```

3. **Use descriptive messages:**
   ```typescript
   // Good
   logger.error({ err: error }, "Failed to fetch playlist from Spotify API");
   
   // Bad
   logger.error({ err: error }, "Error");
   ```

4. **Avoid logging sensitive information:**
   - Never log passwords, API keys, or tokens
   - Be careful with user data (PII)

5. **Don't log in tight loops:**
   - Consider using counters or sampling for high-frequency events

## Development

When running in development mode (`NODE_ENV=development`):
- Logs are pretty-printed with colors in the terminal
- Log level is set to `debug`
- All debug messages are visible

When running in production mode (`NODE_ENV=production`):
- Logs are output as JSON (easily parseable)
- Log level is set to `info`
- Debug messages are suppressed

## Accessing the Debug Page

1. Start the development server:
   ```bash
   npm run dev:api    # Terminal 1
   npm run dev:client # Terminal 2
   ```

2. Navigate to `http://localhost:3001/debug`

3. You'll see:
   - Connection status (should show "Connected")
   - Total log count
   - Real-time log stream
   - Controls for auto-scroll, download, and clear

## Troubleshooting

**Logs not appearing:**
- Check the connection status indicator
- Verify the SSE endpoint is accessible at `/api/debug/logs/stream`
- Check browser console for errors
- Ensure the server is running

**SSE connection keeps dropping:**
- Check your reverse proxy configuration (if using one)
- Verify network stability
- Check for firewalls blocking long-lived connections

**Performance issues:**
- The log buffer is limited to 1000 entries
- High-frequency logging can impact performance
- Consider reducing log verbosity in production