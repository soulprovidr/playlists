import { useEffect, useRef, useState } from "react";
import { Header } from "../../components/Layout/Header";

interface LogEntry {
  log?: string;
  clear?: boolean;
  keepalive?: boolean;
}

export const DebugView = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to SSE endpoint
    const eventSource = new EventSource("/api/debug/logs/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: LogEntry = JSON.parse(event.data);

        if (data.clear) {
          setLogs([]);
        } else if (data.log) {
          setLogs((prev) => [...prev, data.log as string]);
        }
        // Ignore keepalive messages
      } catch (error) {
        console.error("Failed to parse log event:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      // Will auto-reconnect
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleClearLogs = async () => {
    try {
      await fetch("/api/debug/logs", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen flex-col bg-base-200">
      {/* Header */}
      <Header>
        <div className="flex items-center gap-2">
          <div
            className={`badge ${isConnected ? "badge-success" : "badge-error"} gap-2`}
          >
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-success-content" : "bg-error-content"}`}
            />
            {isConnected ? "Connected" : "Disconnected"}
          </div>
          <label className="label cursor-pointer gap-2">
            <span className="label-text">Auto-scroll</span>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
          </label>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleDownloadLogs}
            disabled={logs.length === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
          <button
            className="btn btn-error btn-sm"
            onClick={handleClearLogs}
            disabled={logs.length === 0}
          >
            Clear
          </button>
        </div>
      </Header>

      {/* Logs Container */}
      <div className="flex-1 overflow-hidden p-4 mt-16">
        <div className="h-full overflow-y-auto rounded-lg bg-base-300 p-4 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-base-content/50">
              No logs yet. Waiting for server activity...
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <LogLine key={index} log={log} />
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface LogLineProps {
  log: string;
}

const LogLine = ({ log }: LogLineProps) => {
  // Try to parse JSON log format (pino outputs JSON)
  try {
    const parsed = JSON.parse(log);
    const level = parsed.level;
    const time = parsed.time ? new Date(parsed.time).toLocaleTimeString() : "";
    const msg = parsed.msg || "";

    // Determine color based on level
    let levelColor = "text-base-content";
    let levelName = "INFO";

    if (level >= 60) {
      levelColor = "text-error";
      levelName = "FATAL";
    } else if (level >= 50) {
      levelColor = "text-error";
      levelName = "ERROR";
    } else if (level >= 40) {
      levelColor = "text-warning";
      levelName = "WARN";
    } else if (level >= 30) {
      levelColor = "text-info";
      levelName = "INFO";
    } else if (level >= 20) {
      levelColor = "text-success";
      levelName = "DEBUG";
    } else {
      levelColor = "text-base-content/50";
      levelName = "TRACE";
    }

    return (
      <div className="flex gap-2">
        <span className="text-base-content/50">{time}</span>
        <span className={`font-bold ${levelColor}`}>{levelName}</span>
        <span className="text-base-content">{msg}</span>
      </div>
    );
  } catch {
    // If not JSON, display as-is
    return <div className="text-base-content">{log}</div>;
  }
};
