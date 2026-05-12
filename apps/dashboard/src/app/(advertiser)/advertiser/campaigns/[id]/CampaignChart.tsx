"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface Event {
  event_type: string;
  occurred_at: string;
}

export function CampaignChart({ events }: { events: Event[] }) {
  const chartData = useMemo(() => {
    const byDay: Record<string, { date: string; impressions: number; clicks: number }> = {};
    events.forEach((e) => {
      const day = e.occurred_at.split("T")[0] ?? e.occurred_at;
      if (!byDay[day]) byDay[day] = { date: day, impressions: 0, clicks: 0 };
      if (e.event_type === "impression") byDay[day]!.impressions++;
      if (e.event_type === "click") byDay[day]!.clicks++;
    });
    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  if (chartData.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-fg">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="impressionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0066FF" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: "#9AA5B4", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#9AA5B4", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#0D1629", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
          labelStyle={{ color: "#9AA5B4" }}
          itemStyle={{ color: "#fff" }}
        />
        <Legend wrapperStyle={{ color: "#9AA5B4", fontSize: 12 }} />
        <Area type="monotone" dataKey="impressions" stroke="#0066FF" fill="url(#impressionGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="clicks" stroke="#10B981" fill="url(#clickGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
