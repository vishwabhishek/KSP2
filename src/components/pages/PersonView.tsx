"use client";

import React, { useState } from "react";
import { suspectsList, SuspectItem } from "@/utils/mockData";
import { Card } from "../ui/Card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { User, ShieldAlert, Fingerprint, Eye, Award, CheckCircle } from "lucide-react";

export const PersonView = () => {
  const [selectedSuspect, setSelectedSuspect] = useState<SuspectItem>(suspectsList[0]);

  // Map the CDR data to Recharts format
  const cdrChartData = selectedSuspect.cdrHourlyDistribution.map((calls, hour) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    Calls: calls
  }));

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            SUSPECT DOSSIERS & BIOMETRICS
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Cross-reference biometric matching constants, fingerprint records, and cellular telemetry logs.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Side Selector Directory */}
        <div className="flex flex-col gap-3">
          <Card title="Suspect Registry">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem]">
              {suspectsList.map(s => {
                const isSelected = selectedSuspect.bookingId === s.bookingId;
                return (
                  <div
                    key={s.bookingId}
                    onClick={() => setSelectedSuspect(s)}
                    className={`p-3 border border-border-subtle rounded-sm cursor-pointer flex flex-col gap-1 ${
                      isSelected ? "bg-bg-surface-elevated border-brand-primary" : "bg-bg-surface hover:bg-bg-surface-elevated/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary uppercase">{s.name}</span>
                      <span
                        className={`text-[0.5625rem] font-bold px-1 rounded-xs ${
                          s.riskRating === "critical" ? "text-severity-level3 bg-severity-level3/10" : "text-brand-gold bg-brand-gold/10"
                        }`}
                      >
                        {s.riskRating.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-text-muted text-[0.625rem]">Alias: {s.alias}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Dossier Mugshot Card */}
          <Card title="Mugshot & Biometric Status">
            <div className="flex flex-col items-center gap-4 py-3 font-mono text-[0.6875rem]">
              {/* SVG silhouette placeholder */}
              <div className="h-32 w-28 bg-bg-surface-elevated border border-border-subtle rounded-sm flex items-center justify-center relative overflow-hidden">
                <User className="h-16 w-16 text-text-muted opacity-45" />
                <div className="absolute bottom-1 bg-severity-level4/70 border-t border-border-critical w-full text-center py-0.5 text-[0.5rem] font-bold text-text-primary tracking-widest uppercase">
                  WARRANT ACTIVE
                </div>
              </div>

              {/* Biometrics */}
              <div className="w-full flex flex-col gap-2.5 px-2 border-t border-border-subtle pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Fingerprint className="h-4 w-4 text-brand-primary" />
                    <span>FINGERPRINT:</span>
                  </div>
                  <span className="font-bold text-severity-level1 uppercase">Captured</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Eye className="h-4 w-4 text-brand-accent" />
                    <span>IRIS SCAN INDEX:</span>
                  </div>
                  <span
                    className={`font-bold uppercase ${
                      selectedSuspect.irisScanStatus === "Captured" ? "text-severity-level1" : "text-brand-gold"
                    }`}
                  >
                    {selectedSuspect.irisScanStatus}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side CDR Analysis charts and linkages */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card
            title={`${selectedSuspect.name.toUpperCase()} — ACTIVE ANALYTICS`}
            subtitle={`Booking Reference ID: ${selectedSuspect.bookingId}`}
            borderAccent={selectedSuspect.riskRating === "critical" ? "critical" : "left"}
          >
            {/* Grid metrics details */}
            <div className="grid grid-cols-2 gap-4 font-mono text-[0.6875rem] mb-4">
              <div className="bg-bg-surface-elevated/40 p-3 rounded-sm border border-border-subtle flex flex-col gap-1">
                <span className="text-text-muted uppercase text-[0.5625rem]">last active sector:</span>
                <span className="text-[0.75rem] font-bold text-text-primary uppercase">{selectedSuspect.lastKnownLocation}</span>
              </div>
              <div className="bg-bg-surface-elevated/40 p-3 rounded-sm border border-border-subtle flex flex-col gap-1">
                <span className="text-text-muted uppercase text-[0.5625rem]">warrant authority:</span>
                <span className="text-[0.75rem] font-bold text-border-critical uppercase">{selectedSuspect.warrantStatus} WARRANT</span>
              </div>
            </div>

            {/* CDR Hourly record chart */}
            <div className="border border-border-subtle rounded-md bg-bg-surface-elevated/20 p-4 mb-4">
              <h4 className="font-mono text-[0.6875rem] font-bold text-text-secondary uppercase mb-2">
                Cellular Call Volume (24 Hour CDR Tower Log)
              </h4>
              <div className="w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cdrChartData} margin={{ left: -30, right: 10, top: 10, bottom: 0 }}>
                    <XAxis dataKey="hour" stroke="#6b7280" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#121826",
                        borderColor: "#1f293d",
                        color: "#f3f4f6",
                        fontFamily: "monospace",
                        fontSize: "10px"
                      }}
                    />
                    <Bar dataKey="Calls" fill="#2563eb" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Suspect connections tags */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.625rem] text-text-muted uppercase font-bold">Known Link Associations:</span>
              <div className="flex flex-wrap gap-2">
                {selectedSuspect.associations.map((assoc, i) => (
                  <span
                    key={i}
                    className="font-mono text-[0.625rem] font-bold px-2.5 py-1 bg-bg-surface border border-border-subtle hover:border-border-focus rounded-sm text-text-primary flex items-center gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-border-critical" />
                    <span>{assoc.name}</span>
                    <span className="text-text-muted text-[0.5625rem] font-normal">({assoc.type})</span>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
