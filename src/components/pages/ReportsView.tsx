"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { FileSpreadsheet, Eye, Download, ShieldCheck, Printer } from "lucide-react";

export const ReportsView = () => {
  const [reportTemplate, setReportTemplate] = useState("daily");

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            EXECUTIVE BRIEFING GENERATOR
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Compile performance graphs, active suspect details, and incident logs into PDF reports.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Side Templates selection */}
        <div className="flex flex-col gap-3">
          <Card title="Briefing Templates">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem]">
              <button
                onClick={() => setReportTemplate("daily")}
                className={`w-full text-left p-3 border border-border-subtle rounded-sm cursor-pointer flex items-center gap-2 ${
                  reportTemplate === "daily" ? "bg-bg-surface-elevated border-brand-primary" : "bg-bg-surface hover:bg-bg-surface-elevated/40"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 text-brand-accent shrink-0" />
                <span className="font-bold text-text-primary uppercase">Daily Operations Briefing</span>
              </button>

              <button
                onClick={() => setReportTemplate("intelligence")}
                className={`w-full text-left p-3 border border-border-subtle rounded-sm cursor-pointer flex items-center gap-2 ${
                  reportTemplate === "intelligence" ? "bg-bg-surface-elevated border-brand-primary" : "bg-bg-surface hover:bg-bg-surface-elevated/40"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4 text-brand-accent shrink-0" />
                <span className="font-bold text-text-primary uppercase">SCRB Suspect Link Digest</span>
              </button>
            </div>
          </Card>

          <Card title="Secure Certification">
            <div className="flex flex-col gap-3.5 font-mono text-[0.6875rem] text-text-secondary leading-relaxed">
              <div className="flex items-center gap-1.5 text-severity-level1">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="font-bold">SIGNED CERTIFICATE</span>
              </div>
              <p className="text-[0.625rem]">
                Briefings are automatically appended with Inspector Sharma's cryptographic digital signature block.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Side Report Preview panel */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card
            title="Executive Briefing Preview (Draft)"
            subtitle="Secure document rendering sandbox"
            headerAction={
              <div className="flex items-center gap-2">
                <Button size="sm"><Printer className="h-3.5 w-3.5 mr-1" /> PRINT</Button>
                <Button size="sm" variant="primary"><Download className="h-3.5 w-3.5 mr-1" /> DOWNLOAD PDF</Button>
              </div>
            }
          >
            {/* Document body text */}
            <div className="flex-1 border border-border-subtle bg-bg-surface p-6 font-sans text-text-primary rounded-sm overflow-auto text-[0.75rem] flex flex-col gap-4 max-h-[420px] select-text">
              <div className="flex flex-col gap-1 border-b border-border-subtle pb-4 text-center font-mono">
                <span className="text-[0.875rem] font-bold tracking-wider">KARNATAKA STATE POLICE (KSP)</span>
                <span className="text-[0.625rem] text-text-secondary uppercase">STATE CRIME RECORDS BUREAU (SCRB) — INTERNAL USE ONLY</span>
                <span className="text-[0.5625rem] text-text-muted mt-1">GEN TIME: 2026-06-26 11:59:25 IST • CERT-ID #KSP-8812</span>
              </div>

              {reportTemplate === "daily" ? (
                <>
                  <h3 className="font-mono text-[0.6875rem] font-bold uppercase border-b border-border-subtle/50 pb-1 mt-2 text-brand-accent">
                    1. DAILY OPERATIONS METRICS SUMMARY
                  </h3>
                  <p className="leading-relaxed text-text-secondary">
                    Active case files logged across Bengalur East zones remain at 148 FIRs. Average latency response times
                    for 911 dispatches registered at 4.8 minutes, showing normal metrics. 
                  </p>

                  <h3 className="font-mono text-[0.6875rem] font-bold uppercase border-b border-border-subtle/50 pb-1 mt-2 text-brand-accent">
                    2. ACTIVE THREAT HOTSPOTS Flagged
                  </h3>
                  <p className="leading-relaxed text-text-secondary">
                    A coordinated theft cluster pattern was flagged in Sector 4 parking grid East. CCTV plate matches
                    triggered surveillance units for plate KA-03-MR-9801. Target Vicky Bhai has been associated.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-mono text-[0.6875rem] font-bold uppercase border-b border-border-subtle/50 pb-1 mt-2 text-brand-accent">
                    1. SUSPECT DENSITY ASSOCIATION LINK REPORT
                  </h3>
                  <p className="leading-relaxed text-text-secondary">
                    Primary Target: Vikram Gowda (Alias: Vicky Bhai). Booking ID: KSP-9087-A.
                    Warrant Status: ACTIVE (Theft / Assault / Conspiracy). 
                  </p>

                  <h3 className="font-mono text-[0.6875rem] font-bold uppercase border-b border-border-subtle/50 pb-1 mt-2 text-brand-accent">
                    2. KNOWN ASSOCIATES MATRIX
                  </h3>
                  <p className="leading-relaxed text-text-secondary">
                    Co-accused Karan R. Kumar (Munna) registered vehicle logistics connections. Tower Indira-04 logged cellular GSM handoff logs placing targets in Indiranagar Sector 2 boundaries.
                  </p>
                </>
              )}

              <div className="mt-8 border-t border-border-subtle/40 pt-4 flex justify-between font-mono text-[0.625rem] text-text-muted">
                <span>COMPILED BY: INSP. SHARMA</span>
                <span>AUTHENTICATED BY: SCRB BLOCKCHAIN NODE</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
