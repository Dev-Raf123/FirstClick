"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";

const COLORS = ["#6366f1", "#10b981", "#f59e42"];

function categorizeDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("android") || ua.includes("iphone")) return "Mobile";
  if (ua.includes("ipad")) return "Tablet";
  if (ua.includes("windows") && !ua.includes("linux")) return "PC";
  return "Other";
}

export default function DevicesPieChart({ projectId }: { projectId: string }) {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase
        .from("page_visits")
        .select("user_agent, project_id")
        .eq("project_id", projectId);

      const counts: Record<string, number> = {};
      data?.forEach((row: { user_agent?: string }) => {
        const category = categorizeDevice(row.user_agent || "");
        counts[category] = (counts[category] || 0) + 1;
      });

      const chartData = ["Mobile", "PC", "Tablet"].map(name => ({
        name,
        value: counts[name] || 0,
      })).filter(d => d.value > 0);

      setData(chartData);
    }
    fetchData();
  }, [projectId]);

  return (
    <div className="bg-neutral-900 border border-indigo-500 rounded p-4 w-full max-w-xs">
      <h4 className="text-indigo-300 font-semibold mb-2">Devices</h4>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            fill="#8884d8"
            label
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}