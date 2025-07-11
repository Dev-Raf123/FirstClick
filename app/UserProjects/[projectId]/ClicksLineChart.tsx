"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { createClient } from "@/lib/supabase/client";

export default function ClicksLineChart({ projectId }: { projectId: string }) {
  const [data, setData] = useState<{ date: string; clicks: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase
        .from("page_visits")
        .select("id, timestamp") // Use the correct timestamp field name
        .eq("project_id", projectId);

      console.log("Supabase data:", data);

      // Group by day
      const dayMap: Record<string, number> = {};
      data?.forEach((row: { created_at?: string; timestamp?: string }) => {
        const day = (row.created_at || row.timestamp)?.slice(0, 10);
        if (day) dayMap[day] = (dayMap[day] || 0) + 1;
      });
      const chartData = Object.entries(dayMap)
        .map(([date, clicks]) => ({ date, clicks }))
        .sort((a, b) => a.date.localeCompare(b.date));
      setData(chartData);
    }
    fetchData();
  }, [projectId]);

  return (
    <div className="bg-neutral-900 border border-indigo-500 rounded p-4 w-full max-w-xl">
      <h4 className="text-indigo-300 font-semibold mb-2">Clicks per Day</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}