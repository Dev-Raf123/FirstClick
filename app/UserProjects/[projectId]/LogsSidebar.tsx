"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogsSidebar({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      const supabase = createClient();
      const { data } = await supabase
        .from("page_visits")
        .select("*")
        .eq("project_id", projectId)
        .order("timestamp", { ascending: false })
        .limit(50);
      setLogs(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(data || [])) {
          return data || [];
        }
        return prev;
      });
      setLoading(false);
    }
    fetchLogs();
  }, [projectId]);

  return (
    <aside className="fixed left-0 top-0 h-full w-80 bg-neutral-900 border-r border-neutral-800 p-4 overflow-y-auto z-50">
      <h2 className="text-white font-bold text-xl mb-4">Sessions</h2>
      {loading ? (
        <div className="text-neutral-400">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-neutral-400">No sessions found...</div>
      ) : (
        <ul className="space-y-3">
          {logs.map(log => {
            const expanded = expandedLogId === log.id;
            return (
              <li key={log.id} className="bg-neutral-800 rounded p-2 text-sm cursor-pointer" onClick={() => setExpandedLogId(expanded ? null : log.id)}>
                <div>
                  <span className="font-semibold text-indigo-200">{log.url}</span>
                  <span className="ml-2 text-neutral-400">{log.timestamp?.slice(0, 19).replace("T", " ")}</span>
                </div>
                <div className="text-neutral-400 truncate">{log.user_agent}</div>
                <div className="text-neutral-500 text-xs">Referrer: {log.referrer || "Direct"}</div>
                {expanded && (
                  <div className="mt-2 text-xs text-neutral-300 space-y-1">
                    {Object.entries(log).map(([key, value]) => (
                      <div key={key}><span className="font-bold text-indigo-400">{key}:</span> {String(value)}</div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}