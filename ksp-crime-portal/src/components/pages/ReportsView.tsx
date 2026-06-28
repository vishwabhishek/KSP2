"use client";

import React, { useState, useMemo } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { FileSpreadsheet, Eye, Download, ShieldCheck, Printer, CheckSquare, Square, FileText } from "lucide-react";
import { districtsList, suspectsList, casesList } from "@/utils/mockData";

export const ReportsView = () => {
  const [reportTemplate, setReportTemplate] = useState<"standard" | "intelligence">("standard");
  
  // Sandbox Compile Checklist Modules
  const [includeSna, setIncludeSna] = useState<boolean>(true);
  const [includeSpatial, setIncludeSpatial] = useState<boolean>(true);
  const [includeForecast, setIncludeForecast] = useState<boolean>(true);

  // Dynamic calculations for the briefing text
  const highRiskCount = useMemo(() => {
    return districtsList.filter(d => d.riskLevel === "High").length;
  }, []);

  const transitCorridors = useMemo(() => {
    const list: string[] = [];
    suspectsList.forEach(sus => {
      const districts = new Set<string>();
      sus.cases.forEach(caseId => {
        const c = casesList.find(item => item.id === caseId);
        if (c && c.district) districts.add(c.district);
      });
      if (districts.size > 1) {
        list.push(`${sus.name} (${Array.from(districts).join(" ⟷ ")})`);
      }
    });
    return list;
  }, []);

  const totalUnassigned = useMemo(() => {
    return casesList.filter(c => c.status === "unassigned").length;
  }, []);

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            INTELLIGENCE REPORT GENERATOR
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Compile spatial crime corridors, social suspect connections, and forecasting models into secure briefings.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Side: Briefing Options & Compile Modules */}
        <div className="flex flex-col gap-4">
          <Card title="Briefing Template Class">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem]">
              <button
                onClick={() => setReportTemplate("standard")}
                className={`w-full text-left p-3 border border-border-subtle rounded-sm cursor-pointer flex items-center gap-2.5 ${
                  reportTemplate === "standard" ? "bg-bg-surface-elevated border-brand-primary" : "bg-bg-surface hover:bg-bg-surface-elevated/40"
                }`}
              >
                <FileSpreadsheet className="h-4.5 w-4.5 text-brand-accent shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-text-primary uppercase">Operations Overview</span>
                  <span className="text-[0.5625rem] text-text-muted">General district metrics summary</span>
                </div>
              </button>

              <button
                onClick={() => setReportTemplate("intelligence")}
                className={`w-full text-left p-3 border border-border-subtle rounded-sm cursor-pointer flex items-center gap-2.5 ${
                  reportTemplate === "intelligence" ? "bg-bg-surface-elevated border-brand-primary" : "bg-bg-surface hover:bg-bg-surface-elevated/40"
                }`}
              >
                <FileText className="h-4.5 w-4.5 text-brand-accent shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-text-primary uppercase">Relational Threat Dossier</span>
                  <span className="text-[0.5625rem] text-text-muted">Target link digests & spatial stories</span>
                </div>
              </button>
            </div>
          </Card>

          {/* Report Compile Sandbox Module Checklist */}
          <Card title="Report Compile Modules">
            <div className="flex flex-col gap-3 font-mono text-[0.6875rem]">
              <span className="text-[0.5625rem] text-text-muted uppercase font-bold tracking-wider">
                Select sections to append:
              </span>

              <button
                onClick={() => setIncludeSna(!includeSna)}
                className="flex items-center gap-2.5 text-left text-text-primary hover:text-text-accent transition-colors"
              >
                {includeSna ? (
                  <CheckSquare className="h-4.5 w-4.5 text-brand-primary shrink-0" />
                ) : (
                  <Square className="h-4.5 w-4.5 text-text-muted shrink-0" />
                )}
                <div className="flex flex-col">
                  <span className="font-bold">SUSPECT COHESION INDEX</span>
                  <span className="text-[0.5625rem] text-text-muted">SNA target links & density metrics</span>
                </div>
              </button>

              <button
                onClick={() => setIncludeSpatial(!includeSpatial)}
                className="flex items-center gap-2.5 text-left text-text-primary hover:text-text-accent transition-colors"
              >
                {includeSpatial ? (
                  <CheckSquare className="h-4.5 w-4.5 text-brand-primary shrink-0" />
                ) : (
                  <Square className="h-4.5 w-4.5 text-text-muted shrink-0" />
                )}
                <div className="flex flex-col">
                  <span className="font-bold">GEOSPATIAL TRANSIT CORRIDORS</span>
                  <span className="text-[0.5625rem] text-text-muted">Cross-border suspect mobility vectors</span>
                </div>
              </button>

              <button
                onClick={() => setIncludeForecast(!includeForecast)}
                className="flex items-center gap-2.5 text-left text-text-primary hover:text-text-accent transition-colors"
              >
                {includeForecast ? (
                  <CheckSquare className="h-4.5 w-4.5 text-brand-primary shrink-0" />
                ) : (
                  <Square className="h-4.5 w-4.5 text-text-muted shrink-0" />
                )}
                <div className="flex flex-col">
                  <span className="font-bold">STATISTICAL FORECASTS</span>
                  <span className="text-[0.5625rem] text-text-muted">Temporal threat forecasting alerts</span>
                </div>
              </button>
            </div>
          </Card>

          <Card title="Secure Certification">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem] text-text-secondary leading-relaxed">
              <div className="flex items-center gap-1.5 text-severity-level1">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="font-bold">CRYPTOGRAPHIC BLOCKCHAIN BLOCK</span>
              </div>
              <p className="text-[0.625rem]">
                Reports generated are secured with a SHA-256 integrity signature registered at Inspector Sharma's terminal node.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Side: Report Preview Panel (Live Updates) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card
            title="Executive Briefing Preview"
            subtitle="Live sandbox rendering reflecting compiled selections"
            headerAction={
              <div className="flex items-center gap-2">
                <Button size="sm"><Printer className="h-3.5 w-3.5 mr-1" /> PRINT</Button>
                <Button size="sm" variant="primary"><Download className="h-3.5 w-3.5 mr-1" /> DOWNLOAD</Button>
              </div>
            }
          >
            {/* Document Body */}
            <div className="flex-1 border border-border-subtle bg-bg-surface p-6 font-sans text-text-primary rounded-sm overflow-auto text-[0.75rem] flex flex-col gap-4 max-h-[500px] select-text">
              
              {/* Report Header */}
              <div className="flex flex-col gap-1 border-b border-border-subtle pb-4 text-center font-mono">
                <span className="text-[0.875rem] font-bold tracking-wider text-text-primary">KARNATAKA STATE POLICE</span>
                <span className="text-[0.625rem] text-text-secondary uppercase">STATE CRIME RECORDS BUREAU (SCRB) — OFFICIAL INTELLIGENCE DIGEST</span>
                <span className="text-[0.5625rem] text-text-muted mt-1">GEN DATE: 2026-06-28 18:22:10 IST • SECURITY-TOKEN #KSP-SEC-8821</span>
              </div>

              {/* Template Section */}
              {reportTemplate === "standard" ? (
                <div className="flex flex-col gap-2">
                  <h3 className="font-mono text-[0.6875rem] font-bold uppercase border-b border-border-subtle/50 pb-1 text-brand-accent">
                    1. JURISDICTION METRICS STATUS SUMMARY
                  </h3>
                  <p className="leading-relaxed text-text-secondary text-[0.7rem]">
                    General incident caseload remains high, with {highRiskCount} districts classified under critical high-threat warning flags (exceeding 5,000 cognizable crimes). The average case clearance factor registers at 74.2% across major cities. A total of {totalUnassigned} major cases remain unassigned to investigation bureaus.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <h3 className="font-mono text-[0.6875rem] font-bold uppercase border-b border-border-subtle/50 pb-1 text-brand-accent">
                    1. TARGET INTELLIGENCE SYNOPSIS
                  </h3>
                  <p className="leading-relaxed text-text-secondary text-[0.7rem]">
                    Bureaus are tracking key suspect Vikram Gowda (Alias: Vicky Bhai), booking ID: KSP-9087-A.
                    Warrant status: ACTIVE (Theft / Conspiracy). Suspect shows a high relational connection weight to Karan R. Kumar (Munna) and vehicle transport networks.
                  </p>
                </div>
              )}

              {/* Module: Suspect Cohesion */}
              {includeSna && (
                <div className="flex flex-col gap-2 border-t border-border-subtle/40 pt-3 mt-2">
                  <h3 className="font-mono text-[0.6875rem] font-bold uppercase border-b border-border-subtle/50 pb-1 text-brand-accent flex items-center justify-between">
                    <span>2. STRUCTURAL COHESION (SOCIAL NETWORK ANALYTICS)</span>
                    <span className="text-[0.5625rem] text-severity-level1 font-bold">MODULE ACTIVE</span>
                  </h3>
                  <p className="leading-relaxed text-text-secondary text-[0.7rem]">
                    Social network mapping algorithms detected a prominent clique centering around suspect Vicky Bhai. Analysis of cellular GSM handoffs identifies frequent communication vectors to co-conspirator Munna. Association graph highlights:
                  </p>
                  <ul className="list-disc pl-5 text-[0.6875rem] text-text-muted font-mono flex flex-col gap-1">
                    <li>Core suspect: Vikram Gowda (Degree centrality: 0.85)</li>
                    <li>Logistic support coordinate: Karan R. Kumar (Munna)</li>
                    <li>Asset linkage: Luxury Sedan KA-03-MR-9801</li>
                  </ul>
                </div>
              )}

              {/* Module: Spatial Transit Corridors */}
              {includeSpatial && (
                <div className="flex flex-col gap-2 border-t border-border-subtle/40 pt-3 mt-2">
                  <h3 className="font-mono text-[0.6875rem] font-bold uppercase border-b border-border-subtle/50 pb-1 text-brand-accent flex items-center justify-between">
                    <span>3. GEOSPATIAL TRANSIT CORRIDOR MAPPING</span>
                    <span className="text-[0.5625rem] text-severity-level1 font-bold">MODULE ACTIVE</span>
                  </h3>
                  <p className="leading-relaxed text-text-secondary text-[0.7rem]">
                    Relational spatial projections map key criminal movement pipelines. A significant cross-border corridor is identified linking Bengalur City and Chikkaballapura. Details below:
                  </p>
                  <div className="bg-bg-surface-elevated/50 p-2.5 rounded-sm border border-border-subtle font-mono text-[0.625rem] flex flex-col gap-1.5">
                    {transitCorridors.length > 0 ? (
                      transitCorridors.map((corr, idx) => (
                        <div key={idx} className="flex justify-between items-center text-text-secondary">
                          <span className="font-bold text-brand-gold">VECTOR #{idx + 1}:</span>
                          <span>{corr}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-text-muted">No active multi-district suspect transits calculated.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Module: Forecasting Alerts */}
              {includeForecast && (
                <div className="flex flex-col gap-2 border-t border-border-subtle/40 pt-3 mt-2">
                  <h3 className="font-mono text-[0.6875rem] font-bold uppercase border-b border-border-subtle/50 pb-1 text-brand-accent flex items-center justify-between">
                    <span>4. STATISTICAL FORECASTING FORENSICS</span>
                    <span className="text-[0.5625rem] text-severity-level1 font-bold">MODULE ACTIVE</span>
                  </h3>
                  <p className="leading-relaxed text-text-secondary text-[0.7rem]">
                    Autoregressive temporal simulation models predict a **+14.2%** escalation factor in IT Act / Cyber incidents in the upcoming 72 hours if patrol coefficients remain at baseline values. Hotspots are projected near Sector 4 tech corridors.
                  </p>
                </div>
              )}

              {/* Footer signature */}
              <div className="mt-8 border-t border-border-subtle/40 pt-4 flex justify-between font-mono text-[0.5625rem] text-text-muted">
                <span>COMPILED BY: INSP. SHARMA (LEAD ANALYST)</span>
                <span>CRYPT-INTEGRITY HASH: SHA256/f9e8a7d6c5b4</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
