"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { crimeTrendData } from "@/utils/mockData";
import { Calendar, Filter, BarChart3, TrendingUp } from "lucide-react";

export const AnalyticsView = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="flex flex-col gap-4 flex-1 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex flex-col gap-1 select-none">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            EXPLORATORY CRIME ANALYTICS
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Aggregated analytical reporting metrics for IPC crime distribution trends.
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button className="flex items-center gap-1.5 px-3 py-1 bg-bg-surface-elevated border border-border-subtle hover:border-border-focus text-text-secondary hover:text-text-primary rounded-sm transition-colors text-[0.6875rem] font-bold">
            <Calendar className="h-3.5 w-3.5" /> LAST 7 DAYS
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-bg-surface-elevated border border-border-subtle hover:border-border-focus text-text-secondary hover:text-text-primary rounded-sm transition-colors text-[0.6875rem] font-bold">
            <Filter className="h-3.5 w-3.5" /> FILTERS
          </button>
        </div>
      </div>

      {/* Top row - trend distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Multi-line Trend */}
        <Card
          title="Crime Trend Distribution (Daily Counts)"
          subtitle="IPC classified incidents mapped across the previous week"
          headerAction={
            <div className="flex items-center gap-1 text-brand-accent font-mono text-[0.625rem] font-bold">
              <TrendingUp className="h-3.5 w-3.5" /> +14.2% WEEKLY INTRUSION
            </div>
          }
        >
          <div className="w-full h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={crimeTrendData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#1f293d" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121826",
                    borderColor: "#1f293d",
                    color: "#f3f4f6",
                    fontFamily: "monospace",
                    fontSize: "11px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "monospace", color: "#9ca3af" }} />
                <Line type="monotone" dataKey="Theft" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Assault" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Fraud" stroke="#00d8f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Cyber" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Aggregated categories stack */}
        <Card
          title="Temporal Density Stack (Case Load Volume)"
          subtitle="Proportional loading density of crime vectors over time scale"
        >
          <div className="w-full h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crimeTrendData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#1f293d" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121826",
                    borderColor: "#1f293d",
                    color: "#f3f4f6",
                    fontFamily: "monospace",
                    fontSize: "11px"
                  }}
                />
                <Area type="monotone" dataKey="Theft" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                <Area type="monotone" dataKey="Fraud" stackId="1" stroke="#00d8f6" fill="#00d8f6" fillOpacity={0.1} />
                <Area type="monotone" dataKey="Cyber" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom row - crime categories bar representation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2" title="Daily Crime Aggregations By Classification" subtitle="Incident summaries grouped by offense parameters">
          <div className="w-full h-[240px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crimeTrendData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#1f293d" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121826",
                    borderColor: "#1f293d",
                    color: "#f3f4f6",
                    fontFamily: "monospace",
                    fontSize: "11px"
                  }}
                />
                <Bar dataKey="Theft" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Fraud" fill="#00d8f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Cyber" fill="#a855f7" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Diagnostic Ratios Card */}
        <Card title="Diagnostic Ratios" subtitle="Calculated security efficiency constants">
          <div className="flex flex-col gap-3 py-2 font-mono">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-[0.625rem] text-text-secondary uppercase">Average Case Solver index:</span>
              <span className="text-[0.75rem] font-bold text-severity-level1">74.2%</span>
            </div>
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-[0.625rem] text-text-secondary uppercase">Cyber Intrusion Response:</span>
              <span className="text-[0.75rem] font-bold text-brand-accent">2.4 Hours</span>
            </div>
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-[0.625rem] text-text-secondary uppercase">Property Recovery Ratio:</span>
              <span className="text-[0.75rem] font-bold text-brand-gold">48.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[0.625rem] text-text-secondary uppercase">Recidivism Constant:</span>
              <span className="text-[0.75rem] font-bold text-severity-level3">12.1%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
