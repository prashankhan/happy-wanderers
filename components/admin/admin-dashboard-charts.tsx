"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDataPoint {
  date: string;
  label: string;
  bookings: number;
  revenue: number;
}

interface AdminDashboardChartsProps {
  data: ChartDataPoint[];
}

export function AdminDashboardCharts({ data }: AdminDashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-brand-heading">Bookings (Last 7 Days)</h3>
        <p className="mt-1 text-xs text-brand-muted">Number of confirmed bookings per day</p>
        <div className="mt-4 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                itemStyle={{ color: "#f97316" }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#bookingsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-sm border border-brand-border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-brand-heading">Revenue (Last 7 Days)</h3>
        <p className="mt-1 text-xs text-brand-muted">Daily revenue from confirmed bookings</p>
        <div className="mt-4 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
