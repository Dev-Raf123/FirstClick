"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Define the PageVisit type
interface PageVisit {
  id: string;
  url?: string;
  timestamp: string;
  user_agent?: string;
  referrer?: string | null;
}

export default function LogWidget({ projectId }: { projectId: string }) {
  const [logs, setLogs] = useState<PageVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const supabase = createClient();
      const { data } = await supabase
        .from("page_visits")
        .select("id, url, timestamp, user_agent, referrer")
        .eq("project_id", projectId)
        .order("timestamp", { ascending: false })
        .limit(20);
      setLogs(data || []);
      setLoading(false);
    }
    fetchLogs();
  }, [projectId]);

  return (
    <div className="bg-neutral-900 border border-indigo-500 rounded p-4 w-full max-w-2xl overflow-x-auto" style={{ minWidth: 400 }}>
      <h4 className="text-indigo-300 font-semibold mb-2">Recent Logs</h4>
      {loading ? (
        <div className="text-neutral-400">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-neutral-400">No logs yet.</div>
      ) : (
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-indigo-400 border-b border-neutral-700">
              <th className="py-1 pr-2">Time</th>
              <th className="py-1 pr-2">URL</th>
              <th className="py-1 pr-2">Referrer</th>
              <th className="py-1 pr-2">Device</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-neutral-800">
                <td className="py-1 pr-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="py-1 pr-2">{log.url}</td>
                <td className="py-1 pr-2">{log.referrer || <span className="text-neutral-500">-</span>}</td>
                <td className="py-1 pr-2">{log.user_agent?.split(")")[0] + ")"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}