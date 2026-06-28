"use client";

import React from "react";
import { Card } from "../ui/Card";
import { DataTable } from "../ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Shield, Key, Database, Activity } from "lucide-react";

interface RbacItem {
  badgeId: string;
  name: string;
  role: string;
  districts: string;
  clearance: string;
}

const rbacData: RbacItem[] = [
  { badgeId: "KSP-8812", name: "Insp. Rajesh Sharma", role: "Crime Analyst Lead", districts: "Bengaluru City, Mysuru", clearance: "Level 4 (SCRB Admin)" },
  { badgeId: "KSP-1209", name: "DGP Sunil Kumar", role: "State Commissioner", districts: "Statewide (All Bounds)", clearance: "Level 5 (Full Read/Write)" },
  { badgeId: "KSP-4311", name: "SI Ramesh Patil", role: "Precinct Commander", districts: "Bengaluru East Zones", clearance: "Level 3 (District Investigator)" },
  { badgeId: "KSP-7711", name: "Const. Prasad K.", role: "Station Officer", districts: "Indiranagar Bounds Only", clearance: "Level 1 (Precinct Read)" }
];

export const AdminView = () => {
  // Columns
  const rbacColumns: ColumnDef<RbacItem>[] = [
    {
      accessorKey: "badgeId",
      header: "Badge ID",
      cell: info => <span className="font-mono text-text-accent font-bold">{info.getValue() as string}</span>
    },
    {
      accessorKey: "name",
      header: "Officer Name",
      cell: info => <span className="font-bold text-text-primary">{info.getValue() as string}</span>
    },
    {
      accessorKey: "role",
      header: "Role / Rank",
      cell: info => <span className="text-[0.75rem]">{info.getValue() as string}</span>
    },
    {
      accessorKey: "districts",
      header: "Scope Bounds",
      cell: info => <span className="text-text-secondary truncate">{info.getValue() as string}</span>
    },
    {
      accessorKey: "clearance",
      header: "Security Clearance",
      cell: info => (
        <span className="font-mono text-[0.625rem] font-bold text-severity-level1 bg-severity-level1/10 px-2 py-0.5 border border-severity-level1/20 rounded-sm">
          {info.getValue() as string}
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            Access Controls & System Audit Logs
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Configure role based access controls (RBAC) and review secure connection telemetry logs.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Left Side Menu List */}
        <div className="flex flex-col gap-3">
          <Card title="Admin Sections">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem]">
              <div className="p-3 bg-bg-surface-elevated border border-brand-primary rounded-sm flex items-center gap-2">
                <Key className="h-4 w-4 text-brand-accent shrink-0" />
                <span className="font-bold text-text-primary">RBAC ACCESS RULES</span>
              </div>
              <div className="p-3 bg-bg-surface border border-border-subtle hover:bg-bg-surface-elevated/40 rounded-sm flex items-center gap-2 cursor-pointer">
                <Database className="h-4 w-4 text-text-muted shrink-0" />
                <span className="font-bold text-text-secondary">SYSTEM CONTEXT SETTINGS</span>
              </div>
              <div className="p-3 bg-bg-surface border border-border-subtle hover:bg-bg-surface-elevated/40 rounded-sm flex items-center gap-2 cursor-pointer">
                <Activity className="h-4 w-4 text-text-muted shrink-0" />
                <span className="font-bold text-text-secondary">AUDIT FEED TELEMETRY</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side RBAC Credentials Table */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card
            title="Role Based Access Control (RBAC) Matrix"
            subtitle="Configured credentials and clearance boundaries for KSP intelligence database"
            headerAction={
              <div className="flex items-center gap-1 bg-severity-level1/10 text-severity-level1 px-2.5 py-0.5 border border-severity-level1/20 rounded-sm font-mono text-[0.5625rem] font-bold uppercase">
                <Shield className="h-3.5 w-3.5" /> SECURE MODULE
              </div>
            }
          >
            <DataTable columns={rbacColumns} data={rbacData} />
          </Card>

          {/* Audit Logs list */}
          <Card title="Access Logs (Recent Connection handoffs)">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem] text-text-secondary">
              <div className="flex justify-between border-b border-border-subtle pb-1.5">
                <span>12:01:29 IST — Officer KSP-8812 authenticated session via SCRB Node-04.</span>
                <span className="text-severity-level1 font-bold">SUCCESS</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-1.5">
                <span>11:54:10 IST — Query dispatched: 'Select * From cases where suspect = Vicky Gowda'.</span>
                <span className="text-severity-level1 font-bold">SUCCESS</span>
              </div>
              <div className="flex justify-between">
                <span>11:40:02 IST — Network handoff bridge connected to Whitefield control tower.</span>
                <span className="text-brand-accent font-bold">CONNECT</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
