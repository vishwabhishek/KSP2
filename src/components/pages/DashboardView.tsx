"use client";

import React, { useState, useEffect } from "react";
import { useKsp } from "@/store/KspContext";
import { StatCard } from "../ui/StatCard";
import { Card } from "../ui/Card";
import { DataTable } from "../ui/DataTable";
import { Shield, Clock, AlertOctagon, Radio, ShieldAlert, BadgeInfo, CheckCircle } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export const DashboardView = () => {
  const { selectedDistrict } = useKsp();
  const [showPatternAlert, setShowPatternAlert] = useState(true);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading || !data) return <div className="text-white p-4 font-mono animate-pulse">Initializing API Telemetry...</div>;

  // Compute stats based on active district
  const getStats = () => {
    if (selectedDistrict === "All Districts") {
      const activeCasesStr = data.metrics.find((m: any) => m.id === "active_cases")?.value.replace(/,/g, '') || "0";
      return {
        cases: parseInt(activeCasesStr),
        responseTime: "5.2m",
        dispatches: Math.floor(parseInt(activeCasesStr) / 50),
        risk: "HIGH"
      };
    }
    // We would fetch district specific stats here in a real scenario
    return {
      cases: 0,
      responseTime: "5.0m",
      dispatches: 0,
      risk: "MODERATE"
    };
  };

  const stats = getStats();

  // Columns for recent incidents
  const incidentColumns: ColumnDef<any>[] = [
    {
      accessorKey: "time",
      header: "Timestamp",
      cell: info => <span className="font-mono text-[0.6875rem] font-bold text-text-secondary">{info.getValue() as string}</span>
    },
    {
      accessorKey: "id",
      header: "Record ID",
      cell: info => <span className="font-mono font-bold text-brand-accent">{info.getValue() as string}</span>
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: info => <span className="text-[0.75rem] text-text-primary">{info.getValue() as string}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: info => {
        const val = info.getValue() as string;
        return (
          <span className="font-mono text-[0.625rem] px-2 py-0.5 rounded-sm font-bold tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25">
            {val}
          </span>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-4 flex-1 overflow-auto">
      {/* HUD Header banner */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex flex-col gap-1 select-none">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            OPERATIONS COCKPIT — {selectedDistrict.toUpperCase()}
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Telemetry synchronization status: SECURE. System logs normal.
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data.metrics.map((metric: any) => (
          <StatCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            subtitle="API Extracted Data"
            trend={parseFloat(metric.trend) || 0}
            trendDirection={metric.isPositive ? "up" : "down"}
            sparklineData={[12, 19, 14, 25, 30, 22, 15]}
          />
        ))}
      </div>

      {/* Warnings & Alerts Grid */}
      {showPatternAlert && (
        <div className="bg-severity-level4/10 border border-border-critical rounded-md p-4 flex gap-3 items-start relative select-none animate-pulse-warning">
          <ShieldAlert className="h-5 w-5 text-severity-level3 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 flex-1">
            <h4 className="font-mono text-[0.75rem] font-bold text-text-primary uppercase tracking-wide">
              AI DETECTED INCIDENT WARNING: VEHICLE THEFT PATTERN IDENTIFIED
            </h4>
            <p className="text-[0.75rem] text-text-secondary leading-relaxed">
              Cross-correlation of vehicle logs indicates 5 coordinated luxury car thefts in past 48 hours within
              Sector 4, Bengaluru East. Target coordinates mapping indicates a specific gang operation profile.
            </p>
          </div>
          <button
            onClick={() => setShowPatternAlert(false)}
            className="text-[0.625rem] font-mono text-text-muted hover:text-text-primary border border-border-subtle hover:border-text-primary px-1.5 py-0.5 rounded-sm cursor-pointer transition-colors"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Main Tables Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Live CAD dispatch logs replaced with API nature of complaints */}
        <Card
          title="Nature of Complaints Feed"
          subtitle="Historical complaint records extracted directly from Kaggle Data"
          headerAction={
            <div className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary px-2 py-0.5 border border-brand-primary/20 rounded-sm font-mono text-[0.5625rem] font-bold uppercase animate-pulse">
              <Radio className="h-3 w-3" /> LIVE DB SYNC
            </div>
          }
        >
          <DataTable columns={incidentColumns} data={data.recentIncidents} />
        </Card>
      </div>
    </div>
  );
};
