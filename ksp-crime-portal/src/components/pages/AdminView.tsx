"use client";

import React, { useState } from "react";
import { useKsp } from "@/store/KspContext";
import { Card } from "../ui/Card";
import { DataTable } from "../ui/DataTable";
import { Button } from "../ui/Button";
import { ColumnDef } from "@tanstack/react-table";
import { Shield, Key, Database, Activity, Upload, Loader2, PlayCircle } from "lucide-react";

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
  const { activityLogs, logActivity } = useKsp();
  const [activeSection, setActiveSection] = useState<"rbac" | "context" | "telemetry">("rbac");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "System initialized.",
    "Ready for data context ingestion."
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      addLog(`Selected file: ${selected.name} (${(selected.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    addLog(`Initiating CSV Ingestion for ${file.name}...`);
    logActivity(`Initiated CSV Ingestion for dataset: ${file.name}`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload?action=csv", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        addLog(`Ingestion success: ${data.message || "Records imported."}`);
        setFile(null);
      } else {
        addLog(`Ingestion error: ${data.message || "Failed to parse CSV."}`);
      }
    } catch (e: any) {
      addLog(`Network error: ${e.message || "Connection refused."}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTriggerPipeline = async () => {
    setIsPipelineRunning(true);
    addLog("Dispatched run signal for AI Entity Extraction Pipeline...");
    logActivity("Dispatched run signal for AI Entity Extraction Pipeline");
    try {
      const res = await fetch("/api/upload?action=pipeline", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        addLog(`Pipeline status: ${data.message}`);
      } else {
        addLog(`Pipeline trigger failed: ${data.message}`);
      }
    } catch (e: any) {
      addLog(`Network error: ${e.message || "Connection refused."}`);
    } finally {
      setIsPipelineRunning(false);
    }
  };

  // Columns for RBAC
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
            Access Controls & System Administration
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Configure access rules, upload raw reporting spreadsheets, and manage AI pipeline telemetry logs.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Left Side Menu List */}
        <div className="flex flex-col gap-3">
          <Card title="Admin Sections">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem]">
              <button
                onClick={() => setActiveSection("rbac")}
                className={`w-full text-left p-3 border rounded-sm flex items-center gap-2 cursor-pointer transition-colors ${
                  activeSection === "rbac"
                    ? "bg-bg-surface-elevated border-brand-primary text-text-primary font-bold"
                    : "bg-bg-surface border-border-subtle text-text-secondary hover:bg-bg-surface-elevated/40"
                }`}
              >
                <Key className={`h-4 w-4 shrink-0 ${activeSection === "rbac" ? "text-brand-accent" : "text-text-muted"}`} />
                <span className="uppercase">RBAC ACCESS RULES</span>
              </button>
              
              <button
                onClick={() => setActiveSection("context")}
                className={`w-full text-left p-3 border rounded-sm flex items-center gap-2 cursor-pointer transition-colors ${
                  activeSection === "context"
                    ? "bg-bg-surface-elevated border-brand-primary text-text-primary font-bold"
                    : "bg-bg-surface border-border-subtle text-text-secondary hover:bg-bg-surface-elevated/40"
                }`}
              >
                <Database className={`h-4 w-4 shrink-0 ${activeSection === "context" ? "text-brand-accent" : "text-text-muted"}`} />
                <span className="uppercase">SYSTEM CONTEXT SETTINGS</span>
              </button>

              <button
                onClick={() => setActiveSection("telemetry")}
                className={`w-full text-left p-3 border rounded-sm flex items-center gap-2 cursor-pointer transition-colors ${
                  activeSection === "telemetry"
                    ? "bg-bg-surface-elevated border-brand-primary text-text-primary font-bold"
                    : "bg-bg-surface border-border-subtle text-text-secondary hover:bg-bg-surface-elevated/40"
                }`}
              >
                <Activity className={`h-4 w-4 shrink-0 ${activeSection === "telemetry" ? "text-brand-accent" : "text-text-muted"}`} />
                <span className="uppercase">AUDIT FEED TELEMETRY</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Right Side Panels */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {activeSection === "rbac" && (
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
          )}

          {activeSection === "context" && (
            <Card
              title="Data Ingestion & Pipeline Configuration"
              subtitle="Ingest manual Excel/CSV files and trigger the AI entity extraction pipeline to resolve data silos"
              headerAction={
                <div className="flex items-center gap-1.5 text-[0.625rem] font-mono text-brand-accent font-bold uppercase">
                  <Database className="h-4 w-4" /> INTEGRATED INGESTION ENGINE
                </div>
              }
            >
              <div className="flex flex-col gap-4 font-mono text-[0.6875rem] mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Zone */}
                  <div className="border border-dashed border-border-subtle p-5 rounded-sm bg-bg-surface-elevated/20 flex flex-col items-center justify-center gap-3 text-center">
                    <Upload className="h-8 w-8 text-text-muted" />
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-text-primary uppercase">UPLOAD CSV RECORD DATASET</span>
                      <span className="text-[0.625rem] text-text-muted">Import manual reports, crime logs or Excel tables</span>
                    </div>
                    <label className="bg-brand-primary text-text-primary px-3 py-1.5 border border-brand-primary rounded-sm font-bold uppercase cursor-pointer hover:bg-brand-primary/95 text-[0.625rem]">
                      SELECT CSV FILE
                      <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                    </label>
                    {file && (
                      <div className="text-brand-accent font-bold mt-1 text-[0.625rem]">
                        READY: {file.name}
                      </div>
                    )}
                  </div>

                  {/* Actions / Run Pipeline Card */}
                  <div className="border border-border-subtle p-4 rounded-sm bg-bg-surface flex flex-col gap-3 justify-center">
                    <div className="flex flex-col gap-1 border-b border-border-subtle pb-2">
                      <span className="font-bold text-text-primary uppercase">PIPELINE EXECUTION COMMANDS</span>
                      <span className="text-[0.625rem] text-text-muted">Process SQLite incidents and map to Neo4j graph nodes.</span>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-1">
                      <Button
                        variant="primary"
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> INGESTING CSV...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" /> COMMIT & INGEST CSV DATASET
                          </>
                        )}
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={handleTriggerPipeline}
                        disabled={isPipelineRunning}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        {isPipelineRunning ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> EXTRACTING ENTITIES...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" /> EXECUTE AI RESOLUTION PIPELINE
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Log telemetry console */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-border-subtle pb-1">
                    <span className="font-bold text-text-secondary uppercase">Ingestion Console Telemetry Log</span>
                    <button onClick={() => setLogs([])} className="text-[0.625rem] text-text-muted hover:text-text-primary uppercase">
                      Clear Console
                    </button>
                  </div>
                  <div className="h-[200px] border border-border-subtle bg-bg-base p-3 rounded-sm font-mono text-[0.625rem] text-text-secondary overflow-y-auto flex flex-col-reverse gap-1 select-text">
                    {logs.map((log, index) => (
                      <div key={index} className="border-b border-border-subtle/20 pb-1.5 last:border-0">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === "telemetry" && (
            <Card 
              title="Access Logs (Recent Connection handoffs)"
              subtitle="Real-time session logging and command audits for compliance checking"
            >
              <div className="flex flex-col gap-2.5 font-mono text-[0.6875rem] text-text-secondary mt-2 max-h-[400px] overflow-y-auto pr-1">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border-subtle/50 pb-2 mb-1 gap-2 last:border-0 last:pb-0 last:mb-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[#00d8f6] font-bold text-[0.625rem]">{log.timestamp}</span>
                      <span className="text-text-muted text-[0.625rem]">[{log.badgeId}]</span>
                      <span className="text-text-primary font-bold">{log.officerName}</span>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto gap-3">
                      <span className="text-text-secondary italic text-right flex-1">{log.action}</span>
                      <span className="text-emerald-400 font-bold uppercase text-[0.55rem] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">LOGGED</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
