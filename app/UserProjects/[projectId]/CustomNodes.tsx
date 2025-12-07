import React from "react";
import ClicksLineChart from "./ClicksLineChart";
import DevicesPieChart from "./DevicesPieChart";


export const ClicksGraphNode = React.memo(function ClicksGraphNode({ id, data }: { id: string, data: { projectId: string, timeFilter?: string, onRemoveNode: (id: string) => void } }) {
  return (
    <div style={{ width: 480, maxWidth: 480, position: "relative" }}>
      <button
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "rgba(30,30,30,0.7)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 36,
          height: 36,
          fontSize: 28,
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 10,
          lineHeight: "32px",
          textAlign: "center",
          padding: 0,
        }}
        onClick={() => data.onRemoveNode(id)}
        title="Remove widget"
      >×</button>
      <ClicksLineChart projectId={data.projectId} timeFilter={data.timeFilter} />
    </div>
  );
});

export const DevicesPieNode = React.memo(function DevicesPieNode({ id, data }: { id: string, data: { projectId: string, timeFilter?: string, onRemoveNode: (id: string) => void } }) {
  return (
    <div style={{ width: 320, maxWidth: 320, position: "relative" }}>
      <button
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "rgba(30,30,30,0.7)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 36,
          height: 36,
          fontSize: 28,
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 10,
          lineHeight: "32px",
          textAlign: "center",
          padding: 0,
        }}
        onClick={() => data.onRemoveNode(id)}
        title="Remove widget"
      >×</button>
      <DevicesPieChart projectId={data.projectId} timeFilter={data.timeFilter} />
    </div>
  );
});



// Memoized log item component for performance
const LogItem = React.memo(function LogItem({ log, expanded, onToggle }: { log: any, expanded: boolean, onToggle: () => void }) {
  return (
    <li 
      style={{ background: "#27272a", borderRadius: 8, padding: 8, fontSize: 13, cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <div>
        <span style={{ fontWeight: 600, color: "#c7d2fe" }}>{log.url}</span>
        <span style={{ marginLeft: 8, color: "#a3a3a3", fontSize: 11 }}>{log.timestamp?.slice(0, 19).replace("T", " ")}</span>
      </div>
      <div style={{ color: "#a3a3a3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11 }}>{log.user_agent}</div>
      <div style={{ color: "#737373", fontSize: 10 }}>Referrer: {log.referrer || "Direct"}</div>
      {expanded && (
        <div style={{ marginTop: 8, fontSize: 11, color: "#d4d4d8", display: "flex", flexDirection: "column", gap: 4 }}>
          {Object.entries(log).map(([key, value]) => (
            <div key={key} style={{ wordBreak: "break-all" }}>
              <span style={{ fontWeight: "bold", color: "#a78bfa" }}>{key}:</span> {String(value)}
            </div>
          ))}
        </div>
      )}
    </li>
  );
});

export const LogsWidgetNode = React.memo(function LogsWidgetNode({ id, data }: { id: string, data: { projectId: string, timeFilter?: string, onRemoveNode: (id: string) => void } }) {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedLogId, setExpandedLogId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchLogs() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from("page_visits")
        .select("*")
        .eq("project_id", data.projectId);
      
      if (data.timeFilter === "today") {
        query = query.gte("timestamp", `${today}T00:00:00`);
      }
      
      // Show more logs for lifetime view
      const limit = data.timeFilter === "today" ? 25 : 100;
      
      const { data: logsData } = await query
        .order("timestamp", { ascending: false })
        .limit(limit);
      setLogs(logsData || []);
      setLoading(false);
    }
    fetchLogs();
  }, [data.projectId, data.timeFilter]);

  const toggleLog = React.useCallback((logId: string) => {
    setExpandedLogId(prev => prev === logId ? null : logId);
  }, []);

  return (
    <div 
      style={{ 
        width: 400, 
        maxWidth: 400, 
        height: 600, 
        position: "relative", 
        background: "#18181b", 
        border: "2px solid #2a2f2f", 
        borderRadius: 12, 
        overflow: "hidden",
        willChange: "transform", // GPU acceleration
        cursor: "auto", // Show cursor over widget
      }}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <button
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(30,30,30,0.9)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 36,
          height: 36,
          fontSize: 28,
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 10,
          lineHeight: "32px",
          textAlign: "center",
          padding: 0,
        }}
        onClick={(e) => {
          e.stopPropagation();
          data.onRemoveNode(id);
        }}
        title="Remove widget"
      >×</button>
      <div style={{ padding: 16, height: "100%", overflowY: "auto", WebkitOverflowScrolling: "touch", contain: "layout style paint" }}>
        <h2 style={{ color: "#fff", fontWeight: "bold", fontSize: 20, marginBottom: 16 }}>Sessions</h2>
        {loading ? (
          <div style={{ color: "#a3a3a3" }}>Loading...</div>
        ) : logs.length === 0 ? (
          <div style={{ color: "#a3a3a3" }}>No sessions found...</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {logs.map(log => (
              <LogItem 
                key={log.id} 
                log={log} 
                expanded={expandedLogId === log.id} 
                onToggle={() => toggleLog(log.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

export const nodeTypes = {
  "clicks-graph": ClicksGraphNode,
  "devices-pie": DevicesPieNode,
  "logs-widget": LogsWidgetNode,
};