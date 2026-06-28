"use client";

import React, { useState, useEffect } from "react";
import { useKsp } from "@/store/KspContext";
import { StatCard } from "../ui/StatCard";
import { Card } from "../ui/Card";
import { DataTable } from "../ui/DataTable";
import { 
  Shield, 
  Clock, 
  AlertOctagon, 
  Radio, 
  ShieldAlert, 
  BadgeInfo, 
  CheckCircle,
  X, 
  Search,
  FileText, 
  TrendingUp, 
  Users2, 
  UserCheck, 
  Briefcase, 
  Send,
  AlertTriangle
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "../ui/Input";

// Direct JSON imports for historical records in focus views
import natureOfComplaints from "@/utils/real_data/nature_of_complaints.json";
import complaintsAgainstPolice from "@/utils/real_data/complaints_against_police.json";

export const DashboardView = () => {
  const { selectedDistrict } = useKsp();
  const [showPatternAlert, setShowPatternAlert] = useState(true);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Focus View Modals State
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeCasesSearch, setActiveCasesSearch] = useState("");
  const [tacticalFeedback, setTacticalFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading || !data) return <div className="text-white p-4 font-mono animate-pulse">Initializing API Telemetry...</div>;

  // Filter metrics based on selected district
  const getFilteredMetrics = () => {
    if (selectedDistrict === "All Districts") {
      return data.metrics;
    }
    
    const distData = data.districtsList?.find(
      (d: any) => d.districtName.toLowerCase() === selectedDistrict.toLowerCase() ||
                  selectedDistrict.toLowerCase().includes(d.districtName.toLowerCase())
    );
    
    const casesCount = distData ? distData.incidentCount : 0;
    const risk = distData ? distData.riskStatus.toUpperCase() : "STABLE";
    
    return data.metrics.map((m: any) => {
      if (m.id === "active_cases") {
        return { ...m, value: casesCount.toLocaleString() };
      }
      if (m.id === "critical_alerts") {
        return { ...m, title: "District Risk Profile", value: risk };
      }
      return m;
    });
  };

  const activeMetrics = getFilteredMetrics();

  // Filter recent incidents based on selected district
  const filteredIncidents = selectedDistrict === "All Districts"
    ? data.recentIncidents
    : data.recentIncidents.filter((inc: any) => 
        inc.location && inc.location.toLowerCase().includes(selectedDistrict.toLowerCase())
      );

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

  // Helper: Modal Titles
  const getModalHeaderTitle = (cardId: string) => {
    switch (cardId) {
      case "active_cases":
        return "Active IPC Cases — Relational Directory & Spatial Forecast";
      case "total_complaints":
        return "Historical Kaggle Complaints — Multi-Year Analytics & Trends";
      case "critical_alerts":
        return "Active Critical Threat Incidents & Tactical Operations Dispatch";
      case "police_complaints":
        return "Internal Affairs — Complaints Against Police Personnel Log";
      default:
        return "Module Overview";
    }
  };

  // Helper: Modal Icons
  const getModalHeaderIcon = (cardId: string) => {
    switch (cardId) {
      case "active_cases":
        return <Shield className="h-5 w-5 text-[#00d8f6] shrink-0" />;
      case "total_complaints":
        return <Clock className="h-5 w-5 text-severity-level1 shrink-0" />;
      case "critical_alerts":
        return <AlertOctagon className="h-5 w-5 text-severity-level3 shrink-0" />;
      case "police_complaints":
        return <ShieldAlert className="h-5 w-5 text-brand-primary shrink-0" />;
      default:
        return <BadgeInfo className="h-5 w-5 text-text-muted shrink-0" />;
    }
  };

  // Trigger dispatch simulation
  const triggerTacticalDispatch = (districtName: string, actionType: string) => {
    setTacticalFeedback(`TACTICAL LOG: Directives for "${actionType.toUpperCase()}" transmitted to ${districtName.toUpperCase()} superintendent command center successfully.`);
    setTimeout(() => setTacticalFeedback(null), 5000);
  };

  // Helper: Modal Contents
  const renderModalContent = (cardId: string) => {
    switch (cardId) {
      case "active_cases": {
        // Filter districts list based on search term
        const list = (data.districtsList || []).filter((d: any) =>
          d.districtName.toLowerCase().includes(activeCasesSearch.toLowerCase())
        );

        // Sort by incident count descending
        const sortedList = [...list].sort((a: any, b: any) => b.incidentCount - a.incidentCount);

        return (
          <div className="flex flex-col gap-6 select-none font-mono">
            {/* Division KPI Overview Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Total Active IPC</span>
                <span className="text-[1.125rem] font-bold text-text-primary">12,684 Cases</span>
                <span className="text-severity-level1 text-[0.5625rem]">Cleared: 78.4%</span>
              </div>
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">High Risk Districts</span>
                <span className="text-[1.125rem] font-bold text-severity-level3">5 Sectors</span>
                <span className="text-text-muted text-[0.5625rem]">Alert severity: Elevated</span>
              </div>
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Patrol Units Active</span>
                <span className="text-[1.125rem] font-bold text-brand-accent">142 Dispatch Cars</span>
                <span className="text-[#00d8f6] text-[0.5625rem]">Coverage: 89%</span>
              </div>
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Clearance Target</span>
                <span className="text-[1.125rem] font-bold text-brand-gold">85.0% Goal</span>
                <span className="text-text-muted text-[0.5625rem]">Gap: -6.6%</span>
              </div>
            </div>

            {/* Division SVG Bar Graph */}
            <div className="bg-bg-surface border border-border-subtle p-4 rounded-md flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
                <span className="font-bold text-text-primary text-[0.7rem] uppercase">Active IPC Volume by Division</span>
                <span className="text-text-muted text-[0.5625rem]">Aggregated database count</span>
              </div>
              <div className="h-44 w-full flex items-center justify-center pt-2">
                <svg className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="80" y1="20" x2="95%" y2="20" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="80" y1="60" x2="95%" y2="60" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="80" y1="100" x2="95%" y2="100" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="80" y1="140" x2="95%" y2="140" stroke="#1f2937" strokeDasharray="3 3" />

                  {/* Division 1: Bengaluru Division */}
                  <text x="70" y="24" fill="#9ca3af" className="text-[0.5625rem] text-right font-bold" textAnchor="end">BENGALURU DIV</text>
                  <rect x="80" y="14" width="70%" height="14" fill="#ef4444" rx="2" fillOpacity="0.85" />
                  <text x="72%" y="24" fill="#ffffff" className="text-[0.5625rem] font-bold">4,890 Cases</text>

                  {/* Division 2: Belagavi Division */}
                  <text x="70" y="64" fill="#9ca3af" className="text-[0.5625rem] text-right font-bold" textAnchor="end">BELAGAVI DIV</text>
                  <rect x="80" y="54" width="48%" height="14" fill="#eab308" rx="2" fillOpacity="0.85" />
                  <text x="50%" y="64" fill="#ffffff" className="text-[0.5625rem] font-bold">3,210 Cases</text>

                  {/* Division 3: Kalaburagi Division */}
                  <text x="70" y="104" fill="#9ca3af" className="text-[0.5625rem] text-right font-bold" textAnchor="end">KALABURAGI DIV</text>
                  <rect x="80" y="94" width="32%" height="14" fill="#10b981" rx="2" fillOpacity="0.85" />
                  <text x="34%" y="104" fill="#ffffff" className="text-[0.5625rem] font-bold">2,150 Cases</text>

                  {/* Division 4: Mysuru Division */}
                  <text x="70" y="144" fill="#9ca3af" className="text-[0.5625rem] text-right font-bold" textAnchor="end">MYSURU DIV</text>
                  <rect x="80" y="134" width="28%" height="14" fill="#10b981" rx="2" fillOpacity="0.85" />
                  <text x="30%" y="144" fill="#ffffff" className="text-[0.5625rem] font-bold">1,840 Cases</text>
                </svg>
              </div>
            </div>

            {/* Filterable District Directory Table */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-[0.7rem] uppercase text-text-primary">District-by-District Live Caseload Directory</span>
                <div className="w-[240px]">
                  <Input 
                    placeholder="Search districts..." 
                    value={activeCasesSearch} 
                    onChange={e => setActiveCasesSearch(e.target.value)}
                    prefixIcon={<Search className="h-3.5 w-3.5" />}
                  />
                </div>
              </div>
              
              <div className="border border-border-subtle rounded-md overflow-hidden max-h-[220px] overflow-y-auto">
                <table className="w-full text-left divide-y divide-border-subtle bg-bg-surface-elevated/10">
                  <thead className="bg-bg-surface-elevated/60 text-[0.5625rem] text-text-secondary uppercase font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5 px-4">District / Subdivision</th>
                      <th className="p-2.5">Active IPC Load</th>
                      <th className="p-2.5">Solve Rate</th>
                      <th className="p-2.5">Alert Level</th>
                      <th className="p-2.5 text-right pr-4">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/40 text-[0.625rem]">
                    {sortedList.map((d: any) => (
                      <tr key={d.districtName} className="hover:bg-bg-surface-elevated/20 transition-colors">
                        <td className="p-2 px-4 font-bold uppercase text-text-primary">{d.districtName}</td>
                        <td className="p-2 text-text-accent font-bold">{d.incidentCount} Cases</td>
                        <td className="p-2 text-brand-gold font-bold">{d.clearanceRate}%</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded-sm font-bold uppercase text-[0.5rem] ${
                            d.riskStatus === "critical" 
                              ? "bg-severity-level3/15 text-severity-level3 border border-severity-level3/25"
                              : d.riskStatus === "high"
                              ? "bg-brand-gold/15 text-brand-gold border border-brand-gold/25"
                              : "bg-severity-level1/15 text-severity-level1 border border-severity-level1/25"
                          }`}>
                            {d.riskStatus}
                          </span>
                        </td>
                        <td className="p-2 text-right pr-4">
                          <button
                            onClick={() => triggerTacticalDispatch(d.districtName, "active case audit")}
                            className="px-2 py-0.5 border border-border-subtle hover:border-[#00d8f6] hover:text-text-primary rounded-sm text-[0.5rem] cursor-pointer transition-colors"
                          >
                            DISPATCH AUDIT
                          </button>
                        </td>
                      </tr>
                    ))}
                    {sortedList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-text-muted">
                          NO DISTRICT JURISDICTIONS FOUND MATCHING QUERY.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      case "total_complaints": {
        // Multi-Year trend lines from Kaggle dataset natureOfComplaints
        const historicalRecords = [...natureOfComplaints].reverse();

        return (
          <div className="flex flex-col gap-6 select-none font-mono">
            {/* Overview KPIs */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Total Historical Logged</span>
                <span className="text-[1.125rem] font-bold text-text-primary">1,130,452 Cases</span>
                <span className="text-text-muted text-[0.5625rem]">Dataset range: 2009-2016</span>
              </div>
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Oral Complaints Received</span>
                <span className="text-[1.125rem] font-bold text-brand-accent">221,684 Cases</span>
                <span className="text-text-muted text-[0.5625rem]">Avg 27,700/Year</span>
              </div>
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Written Petitions Log</span>
                <span className="text-[1.125rem] font-bold text-brand-gold">889,450 Cases</span>
                <span className="text-text-muted text-[0.5625rem]">Avg 111,100/Year</span>
              </div>
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Distress Dial-100 Calls</span>
                <span className="text-[1.125rem] font-bold text-severity-level3">3,284 Calls</span>
                <span className="text-severity-level3 text-[0.5625rem]">CAGR: +14.2% YoY</span>
              </div>
            </div>

            {/* SVG YoY Line Area Chart */}
            <div className="bg-bg-surface border border-border-subtle p-4 rounded-md flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-border-subtle/50 pb-2">
                <span className="font-bold text-text-primary text-[0.7rem] uppercase">YoY Registered IPC Cases Trend (Kaggle Dataset)</span>
                <span className="text-text-muted text-[0.5625rem]">Year-over-Year escalation index</span>
              </div>
              <div className="h-44 w-full flex items-center justify-center pt-2">
                <svg className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="50" y1="20" x2="95%" y2="20" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="50" y1="70" x2="95%" y2="70" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="50" y1="120" x2="95%" y2="120" stroke="#1f2937" strokeDasharray="3 3" />

                  {/* Draw Area Polygon & Line */}
                  {/* 2009: 134k, 2010: 142k, 2011: 148k, 2012: 153k, 2013: 159k, 2014: 161k, 2015: 168k */}
                  {/* Map values to SVG coordinates (width: 800, height: 160) */}
                  <polygon
                    points="50,150 150,130 250,120 350,110 450,90 550,85 650,75 750,60 750,150 50,150"
                    fill="url(#area-gradient)"
                    opacity="0.15"
                  />
                  <polyline
                    fill="none"
                    stroke="#00d8f6"
                    strokeWidth="2.5"
                    points="50,150 150,130 250,120 350,110 450,90 550,85 650,75 750,60"
                  />

                  {/* X Axis Labels */}
                  <text x="50" y="165" fill="#6b7280" className="text-[0.5rem] font-bold" textAnchor="middle">2009</text>
                  <text x="150" y="165" fill="#6b7280" className="text-[0.5rem] font-bold" textAnchor="middle">2010</text>
                  <text x="250" y="165" fill="#6b7280" className="text-[0.5rem] font-bold" textAnchor="middle">2011</text>
                  <text x="350" y="165" fill="#6b7280" className="text-[0.5rem] font-bold" textAnchor="middle">2012</text>
                  <text x="450" y="165" fill="#6b7280" className="text-[0.5rem] font-bold" textAnchor="middle">2013</text>
                  <text x="550" y="165" fill="#6b7280" className="text-[0.5rem] font-bold" textAnchor="middle">2014</text>
                  <text x="650" y="165" fill="#6b7280" className="text-[0.5rem] font-bold" textAnchor="middle">2015</text>
                  <text x="750" y="165" fill="#6b7280" className="text-[0.5rem] font-bold" textAnchor="middle">2016</text>

                  {/* Node values */}
                  <circle cx="50" cy="150" r="3.5" fill="#00d8f6" />
                  <circle cx="250" cy="120" r="3.5" fill="#00d8f6" />
                  <circle cx="450" cy="90" r="3.5" fill="#00d8f6" />
                  <circle cx="750" cy="60" r="3.5" fill="#ef4444" />
                  <text x="750" y="48" fill="#ef4444" className="text-[0.5625rem] font-bold" textAnchor="middle">168,422 (Max)</text>

                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d8f6" />
                      <stop offset="100%" stopColor="#00d8f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Historical Complaints Grid Table */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-[0.7rem] uppercase text-text-primary">Historical Year-By-Year Nature of Complaints Log</span>
              <div className="border border-border-subtle rounded-md overflow-hidden max-h-[220px] overflow-y-auto">
                <table className="w-full text-left divide-y divide-border-subtle bg-bg-surface-elevated/10">
                  <thead className="bg-bg-surface-elevated/60 text-[0.5625rem] text-text-secondary uppercase font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5 px-4">Calender Year</th>
                      <th className="p-2.5">Oral Log</th>
                      <th className="p-2.5">Written Petitions</th>
                      <th className="p-2.5">Distress 100 Calls</th>
                      <th className="p-2.5">Sue Motto Initiated</th>
                      <th className="p-2.5">Total Recieved</th>
                      <th className="p-2.5 text-right pr-4">IPC Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/40 text-[0.625rem]">
                    {historicalRecords.map((comp: any) => (
                      <tr key={comp.Year} className="hover:bg-bg-surface-elevated/20 transition-colors">
                        <td className="p-2 px-4 font-mono font-bold text-text-primary">{comp.Year}</td>
                        <td className="p-2 text-text-muted">{parseInt(comp.PC1_Oral_Complaints || "0").toLocaleString()}</td>
                        <td className="p-2 text-text-muted">{parseInt(comp.PC2_Written_Complaints || "0").toLocaleString()}</td>
                        <td className="p-2 text-text-muted">{parseInt(comp.PC3_Distress_call_over_phoneNo_100_etc || "0").toLocaleString()}</td>
                        <td className="p-2 text-text-muted">{parseInt(comp.PC4_Complaints_initiated_sue_motto_by_Police || "0").toLocaleString()}</td>
                        <td className="p-2 font-bold text-text-accent">{parseInt(comp.PC5_Total_Complaints_Sum_of_1_4_Above || "0").toLocaleString()}</td>
                        <td className="p-2 text-right pr-4 font-bold text-brand-gold">{parseInt(comp.PC7_IPC_Cases_Registered || "0").toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      case "critical_alerts": {
        // Filter districts list for critical or high-risk ones
        const criticalDistricts = (data.districtsList || []).filter((d: any) =>
          d.riskStatus === "critical" || d.riskStatus === "high" || d.riskLevel === "High"
        );

        return (
          <div className="flex flex-col gap-6 select-none font-mono">
            {/* Warning Banner */}
            <div className="bg-severity-level3/10 border border-severity-level3/30 p-4 rounded-md flex gap-3 items-start select-none">
              <AlertTriangle className="h-5 w-5 text-severity-level3 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-text-primary text-[0.7rem] uppercase">AI SECURITY HAZARD INTERRUPT TRIGGER</span>
                <p className="text-[0.625rem] text-text-muted leading-relaxed">
                  Real-time GPS trajectory anomalies and correlation metrics report an active threat in several high-risk sectors. Action plans must be signed and authorized immediately below.
                </p>
              </div>
            </div>

            {/* Operations feedback banner */}
            {tacticalFeedback && (
              <div className="bg-brand-primary/10 border border-[#00d8f6]/30 p-3 rounded-md font-bold text-[#00d8f6] text-[0.625rem] flex items-center gap-2 animate-pulse">
                <Radio className="h-4 w-4 shrink-0" />
                <span>{tacticalFeedback}</span>
              </div>
            )}

            {/* List of High Risk Sectors */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-[0.7rem] uppercase text-text-primary">Tactical Command Deck — Critical Sectors</span>
              <div className="grid grid-cols-1 gap-3">
                {criticalDistricts.map((d: any) => (
                  <div key={d.districtName} className="bg-bg-surface-elevated/30 border border-border-subtle p-4 rounded-md flex items-center justify-between hover:border-border-focus transition-colors">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary text-[0.75rem] uppercase">{d.districtName}</span>
                        <span className="bg-severity-level3/15 text-severity-level3 border border-severity-level3/25 px-1.5 py-0.5 rounded-sm text-[0.5rem] font-bold uppercase">
                          CRITICAL WARNING
                        </span>
                      </div>
                      <div className="flex gap-4 text-[0.625rem] text-text-muted mt-1">
                        <span>Active Case Load: <strong className="text-text-primary">{d.incidentCount} Cases</strong></span>
                        <span>Solve Rate: <strong className="text-brand-gold">{d.clearanceRate}%</strong></span>
                        <span>Sector Response: <strong className="text-severity-level1">8.4 mins avg</strong></span>
                      </div>
                      <p className="text-[0.625rem] text-text-muted mt-2 italic leading-relaxed">
                        Trigger details: Spatiotemporal clusters detected in Sector 4 within the past 48 hours. Interpol corridors active.
                      </p>
                    </div>

                    {/* Dispatch Options */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => triggerTacticalDispatch(d.districtName, "superintendent alert")}
                        className="px-3 py-1.5 bg-bg-surface border border-border-subtle hover:border-[#00d8f6] hover:text-text-primary rounded-sm text-[0.5625rem] font-bold cursor-pointer transition-colors"
                      >
                        ALERT COMMANDER
                      </button>
                      <button
                        onClick={() => triggerTacticalDispatch(d.districtName, "fleet intercept mobilizer")}
                        className="px-3 py-1.5 bg-brand-primary text-text-primary border border-brand-primary hover:bg-brand-primary/80 rounded-sm text-[0.5625rem] font-bold cursor-pointer transition-colors shadow-low"
                      >
                        DEPLOY FLEET
                      </button>
                    </div>
                  </div>
                ))}
                {criticalDistricts.length === 0 && (
                  <div className="border border-border-subtle border-dashed p-8 rounded text-center text-text-muted">
                    No critical alert jurisdictions found. Current status: stable.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case "police_complaints": {
        // complaintsAgainstPolice entries
        const capRecords = [...complaintsAgainstPolice].reverse().slice(0, 10);

        return (
          <div className="flex flex-col gap-6 select-none font-mono">
            {/* Overview metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Total Inquiries Received</span>
                <span className="text-[1.125rem] font-bold text-text-primary">2,209 Allegations</span>
                <span className="text-text-muted text-[0.5625rem]">Historical database sum</span>
              </div>
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Cases Registered (CPA)</span>
                <span className="text-[1.125rem] font-bold text-severity-level3">183 Cases</span>
                <span className="text-text-muted text-[0.5625rem]">Formal cases sheeted</span>
              </div>
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Enquiries Initiated</span>
                <span className="text-[1.125rem] font-bold text-brand-gold">1,094 Staff Enquiries</span>
                <span className="text-[#00d8f6] text-[0.5625rem]">Departmental: 196</span>
              </div>
              <div className="bg-bg-surface-elevated/40 border border-border-subtle p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5625rem] uppercase">Dismissed from Service</span>
                <span className="text-[1.125rem] font-bold text-severity-level3">15 Officers</span>
                <span className="text-text-muted text-[0.5625rem]">Integrity Index: 98.4%</span>
              </div>
            </div>

            {/* Performance award structure */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border border-border-subtle/50 bg-bg-surface-elevated/10 p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5rem] uppercase">Minor Penalties Awarded</span>
                <span className="text-[0.875rem] font-bold text-brand-gold">810 Officers</span>
                <span className="text-text-muted text-[0.5rem]">Salary deductions, reprimands</span>
              </div>
              <div className="border border-border-subtle/50 bg-bg-surface-elevated/10 p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5rem] uppercase">Major Penalties Awarded</span>
                <span className="text-[0.875rem] font-bold text-severity-level3">79 Officers</span>
                <span className="text-text-muted text-[0.5rem]">Demotions, suspensions</span>
              </div>
              <div className="border border-border-subtle/50 bg-bg-surface-elevated/10 p-3 rounded-md flex flex-col gap-1">
                <span className="text-text-muted text-[0.5rem] uppercase">False/Unsubstantiated</span>
                <span className="text-[0.875rem] font-bold text-severity-level1">9 Complaints</span>
                <span className="text-text-muted text-[0.5rem]">Cleared of all allegations</span>
              </div>
            </div>

            {/* Integrity Logs Table */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-[0.7rem] uppercase text-text-primary">Integrity Records — Complaints Against Police Personnel Log</span>
              <div className="border border-border-subtle rounded-md overflow-hidden max-h-[200px] overflow-y-auto">
                <table className="w-full text-left divide-y divide-border-subtle bg-bg-surface-elevated/10">
                  <thead className="bg-bg-surface-elevated/60 text-[0.5625rem] text-text-secondary uppercase font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5 px-4">Calender Year</th>
                      <th className="p-2.5">Complaints Recieved</th>
                      <th className="p-2.5">Cases Registered</th>
                      <th className="p-2.5">Dept. Enquiries</th>
                      <th className="p-2.5">Disciplinary Cases</th>
                      <th className="p-2.5">Major Awards</th>
                      <th className="p-2.5 text-right pr-4">Dismissed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/40 text-[0.625rem]">
                    {capRecords.map((cap: any) => (
                      <tr key={cap.Year} className="hover:bg-bg-surface-elevated/20 transition-colors">
                        <td className="p-2 px-4 font-mono font-bold text-text-primary">{cap.Year}</td>
                        <td className="p-2 text-text-muted">{parseInt(cap["CPA_-_Complaints_Received/Alleged"] || "0").toLocaleString()}</td>
                        <td className="p-2 font-bold text-text-accent">{parseInt(cap["CPA_-_Cases_Registered"] || "0").toLocaleString()}</td>
                        <td className="p-2 text-text-muted">{parseInt(cap["CPA_-_No_of_Departmental_Enquiries"] || "0").toLocaleString()}</td>
                        <td className="p-2 font-bold text-brand-gold">{parseInt(cap["CPC_-_Police_Personnel_Disciplinary_Action_Initiated"] || "0").toLocaleString()}</td>
                        <td className="p-2 text-severity-level3 font-bold">{parseInt(cap["CPC_-_Police_Personnel_Major_Punishment_awarded"] || "0").toLocaleString()}</td>
                        <td className="p-2 text-right pr-4 font-bold text-severity-level3">{parseInt(cap["CPC_-_Police_Personnel_Dismissal/Removal_from_Service"] || "0").toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const activeMetricsList = activeMetrics.map((m: any) => {
    // Determine trend based on metric type
    return {
      ...m,
      trendVal: m.id === "active_cases" ? 12.5 : m.id === "total_complaints" ? 5.2 : m.id === "critical_alerts" ? 2.1 : 0
    };
  });

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

      {/* Stats Cards (Now interactive with focus view modals) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activeMetricsList.map((metric: any) => (
          <StatCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            subtitle="Click to expand advanced analytics"
            trend={metric.trendVal}
            trendDirection={metric.isPositive ? "up" : "down"}
            sparklineData={
              metric.id === "active_cases" ? [12, 19, 14, 25, 30, 22, 15] :
              metric.id === "total_complaints" ? [8, 12, 16, 14, 18, 22, 28] :
              metric.id === "critical_alerts" ? [5, 4, 3, 4, 2, 3, 1] : [10, 10, 11, 10, 11, 10, 10]
            }
            onClick={() => setExpandedCard(metric.id)}
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
        <Card
          title="Nature of Complaints Feed"
          subtitle="Historical complaint records extracted directly from Kaggle Data"
          headerAction={
            <div className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary px-2 py-0.5 border border-brand-primary/20 rounded-sm font-mono text-[0.5625rem] font-bold uppercase animate-pulse">
              <Radio className="h-3 w-3" /> LIVE DB SYNC
            </div>
          }
        >
          <DataTable columns={incidentColumns} data={filteredIncidents} />
        </Card>
      </div>

      {/* Dynamic Context-Preserving Overlay Modal */}
      {expandedCard && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm select-none">
          <div className="bg-bg-surface border border-border-subtle hover:border-[#00d8f6]/50 rounded-lg shadow-high w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden transition-all duration-300 relative">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-surface-elevated/40">
              <div className="flex items-center gap-2">
                {getModalHeaderIcon(expandedCard)}
                <h2 className="font-mono text-[0.875rem] font-bold text-text-primary uppercase tracking-wider">
                  {getModalHeaderTitle(expandedCard)}
                </h2>
              </div>
              <button
                onClick={() => setExpandedCard(null)}
                className="p-1 hover:bg-bg-surface-elevated text-text-muted hover:text-text-primary rounded-sm transition-colors cursor-pointer"
                title="Close focus overlay"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 p-6 overflow-y-auto font-mono">
              {renderModalContent(expandedCard)}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-border-subtle flex items-center justify-between bg-bg-surface-elevated/20 text-[0.625rem] text-text-muted">
              <span>SECURITY STANDARDS: CONFIDENTIAL — OFFICERS INTERNAL USE ONLY</span>
              <button
                onClick={() => setExpandedCard(null)}
                className="px-3 py-1.5 bg-bg-surface-elevated hover:bg-bg-surface-elevated/60 text-text-primary border border-border-subtle rounded-sm font-bold cursor-pointer transition-all duration-150"
              >
                CLOSE FOCUS VIEW
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
