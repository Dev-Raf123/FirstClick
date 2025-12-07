"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { createClient } from "@/lib/supabase/client";

export default function ClicksLineChart({ projectId, timeFilter, data: propData }: { projectId: string, timeFilter?: string, data?: { date: string; clicks: number }[] }) {
  const [data, setData] = useState<{ date: string; clicks: number }[]>(propData || []);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from("page_visits")
        .select("id, timestamp")
        .eq("project_id", projectId);
      
      if (timeFilter === "today") {
        query = query.gte("timestamp", `${today}T00:00:00`);
      }
      
      const { data } = await query;

      if (timeFilter === "today") {
        // Group by hour for today's data
        const hourMap: Record<string, number> = {};
        data?.forEach((row: { created_at?: string; timestamp?: string }) => {
          const timestamp = row.created_at || row.timestamp;
          if (timestamp) {
            const hour = timestamp.slice(11, 13); // Extract hour (HH)
            const hourLabel = `${hour}:00`;
            hourMap[hourLabel] = (hourMap[hourLabel] || 0) + 1;
          }
        });
        
        // Create array with all 24 hours (fill missing hours with 0)
        const chartData = [];
        for (let i = 0; i < 24; i++) {
          const hourLabel = `${i.toString().padStart(2, '0')}:00`;
          chartData.push({
            date: hourLabel,
            clicks: hourMap[hourLabel] || 0
          });
        }
        setData(chartData);
      } else {
        // Group by day for lifetime data
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
    }
    fetchData();
  }, [projectId, timeFilter]);

  return (
    <div className="bg-neutral-900 border border-indigo-500 rounded p-4 w-full max-w-xl">
      <h4 className="text-indigo-300 font-semibold mb-2">
        {timeFilter === "today" ? "Clicks per Hour (Today)" : "Clicks per Day"}
      </h4>
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

// Usage example
// <ClicksLineChart projectId="your-project-id" />