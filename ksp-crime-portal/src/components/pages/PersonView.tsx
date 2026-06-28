"use client";

import React, { useState, useMemo } from "react";
import { suspectsList, SuspectItem } from "@/utils/mockData";
import { Card } from "../ui/Card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { User, ShieldAlert, Fingerprint, Eye, Award, CheckCircle, Brain, Share2, Clock, MapPin, Zap } from "lucide-react";

interface BehavioralMetrics {
  moDescription: string;
  entryMethod: string;
  targetSelection: string;
  temporalSignature: string;
  consistencyScore: number;
  recidivismRisk: string;
}

interface SyndicateData {
  syndicateName: string;
  role: string;
  associatedCell: string;
  connectionStrength: number;
  threatTier: string;
  coAccusedCount: number;
}

const suspectBehavioralMap: Record<string, BehavioralMetrics> = {
  "KSP-9087-A": {
    moDescription: "Key duplicate cloning and electromagnetic immobilizer bypass. Leverages keyless frequency spoofing transmitters to unlock and ignite vehicles without physical key access.",
    entryMethod: "RF signal capturing and frequency replay spoofing",
    targetSelection: "High-value luxury sedans parked in unattended corporate tech park slots",
    temporalSignature: "Midnight / Night Hours (01:00 AM - 03:30 AM)",
    consistencyScore: 92,
    recidivismRisk: "CRITICAL (Repeat Offender)"
  },
  "KSP-4311-B": {
    moDescription: "Chassis number grinding, frame tampering, and vehicle dismantling staging. Processes stolen vehicles inside underground garage grids for parting out or resale with falsified registry papers.",
    entryMethod: "Chassis stamp over-striking and mechanical key bypass",
    targetSelection: "Commercial transit vehicles and older sedan lines with physical tumblers",
    temporalSignature: "Afternoon / Twilight Hours (02:00 PM - 06:30 PM)",
    consistencyScore: 76,
    recidivismRisk: "MODERATE"
  }
};

const suspectSyndicateMap: Record<string, SyndicateData> = {
  "KSP-9087-A": {
    syndicateName: "Deccan Cross-Border Cartel (Gowda Cell)",
    role: "Ring Leader / Principal Planner",
    associatedCell: "Bangalore North Auto Theft Ring",
    connectionStrength: 89,
    threatTier: "Tier 1 (High Threat)",
    coAccusedCount: 3
  },
  "KSP-4311-B": {
    syndicateName: "Deccan Cross-Border Cartel (Kalasipalyam Sub-cell)",
    role: "Logistics Specialist / Master Technician",
    associatedCell: "Kalasipalyam Scrap Dismantling Grid",
    connectionStrength: 65,
    threatTier: "Tier 2 (Moderate)",
    coAccusedCount: 1
  }
};

const defaultBehavioral: BehavioralMetrics = {
  moDescription: "Standard opportunistic theft and petty crime patterns. Lacks consistent specialized entry methods.",
  entryMethod: "Manual physical force entry",
  targetSelection: "Unsecured high-footfall public property",
  temporalSignature: "Variable / Irregular",
  consistencyScore: 45,
  recidivismRisk: "LOW"
};

const defaultSyndicate: SyndicateData = {
  syndicateName: "Unaffiliated / Independent Operator",
  role: "Sole Accused",
  associatedCell: "None",
  connectionStrength: 10,
  threatTier: "Tier 4 (Low Risk)",
  coAccusedCount: 0
};

export const PersonView = () => {
  const [selectedSuspect, setSelectedSuspect] = useState<SuspectItem>(suspectsList[0]);
  const [activeDossierTab, setActiveDossierTab] = useState<"behavioral" | "network" | "telemetry">("behavioral");

  // Fetch metrics based on selected suspect ID
  const behavioral = suspectBehavioralMap[selectedSuspect.bookingId] || defaultBehavioral;
  const syndicate = suspectSyndicateMap[selectedSuspect.bookingId] || defaultSyndicate;

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
            SUSPECT DOSSIERS & BEHAVIORAL FORENSICS
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Analyze organized syndicate linkages, fingerprint verification, and recurring Modus Operandi (MO) indicators.
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
              {/* Profile silhouette placeholder */}
              <div className="h-32 w-28 bg-bg-surface-elevated border border-border-subtle rounded-sm flex items-center justify-center relative overflow-hidden">
                <User className="h-16 w-16 text-text-muted opacity-45" />
                {selectedSuspect.warrantStatus === "Active" && (
                  <div className="absolute bottom-1 bg-severity-level4/70 border-t border-border-critical w-full text-center py-0.5 text-[0.5rem] font-bold text-text-primary tracking-widest uppercase">
                    WARRANT ACTIVE
                  </div>
                )}
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

        {/* Right Side Tabbed Analytics */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card
            title={`${selectedSuspect.name.toUpperCase()} — INTEL PROFILE`}
            subtitle={`Booking Reference ID: ${selectedSuspect.bookingId}`}
            borderAccent={selectedSuspect.riskRating === "critical" ? "critical" : "left"}
          >
            
            {/* Header metrics details */}
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

            {/* Dossier Analytics Tab selectors */}
            <div className="flex border-b border-border-subtle font-mono text-[0.58rem] font-bold mb-4">
              <button
                onClick={() => setActiveDossierTab("behavioral")}
                className={`flex-1 pb-2 border-b-2 text-center uppercase cursor-pointer transition-all ${
                  activeDossierTab === "behavioral" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Brain className="h-3.5 w-3.5" /> Modus Operandi (MO)
                </div>
              </button>
              <button
                onClick={() => setActiveDossierTab("network")}
                className={`flex-1 pb-2 border-b-2 text-center uppercase cursor-pointer transition-all ${
                  activeDossierTab === "network" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Syndicate Connections
                </div>
              </button>
              <button
                onClick={() => setActiveDossierTab("telemetry")}
                className={`flex-1 pb-2 border-b-2 text-center uppercase cursor-pointer transition-all ${
                  activeDossierTab === "telemetry" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Cellular Telemetry
                </div>
              </button>
            </div>

            {/* Tab 1: Behavioral Profile */}
            {activeDossierTab === "behavioral" && (
              <div className="flex flex-col gap-4 font-mono text-[0.6875rem] animate-fade-in">
                <div className="flex flex-col gap-1.5 bg-bg-surface-elevated/20 border border-border-subtle p-3 rounded-sm">
                  <span className="text-[0.5625rem] text-text-muted uppercase font-bold tracking-wider">Modus Operandi Summary:</span>
                  <p className="text-text-secondary leading-relaxed">{behavioral.moDescription}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1 bg-bg-surface-elevated/10 p-2.5 rounded border border-border-subtle/50">
                    <span className="text-[0.5625rem] text-text-muted uppercase">Method of Operation:</span>
                    <span className="text-text-primary font-bold">{behavioral.entryMethod}</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-bg-surface-elevated/10 p-2.5 rounded border border-border-subtle/50">
                    <span className="text-[0.5625rem] text-text-muted uppercase">Target Selection Criteria:</span>
                    <span className="text-text-primary font-bold">{behavioral.targetSelection}</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-bg-surface-elevated/10 p-2.5 rounded border border-border-subtle/50">
                    <span className="text-[0.5625rem] text-text-muted uppercase">Temporal Signature Profile:</span>
                    <span className="text-brand-accent font-bold">{behavioral.temporalSignature}</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-bg-surface-elevated/10 p-2.5 rounded border border-border-subtle/50">
                    <span className="text-[0.5625rem] text-text-muted uppercase">Recidivism Index Warning:</span>
                    <span className="text-border-critical font-bold">{behavioral.recidivismRisk}</span>
                  </div>
                </div>

                {/* Behavioral consistency tracker bar */}
                <div className="bg-bg-surface-elevated/30 border border-border-subtle p-3.5 rounded flex flex-col gap-2 mt-1">
                  <div className="flex justify-between items-center text-[0.625rem]">
                    <span className="text-text-secondary uppercase font-bold flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-brand-gold shrink-0" />
                      Behavioral Pattern Consistency Score
                    </span>
                    <span className="text-brand-accent font-bold">{behavioral.consistencyScore}%</span>
                  </div>
                  <div className="w-full bg-bg-base h-2 rounded overflow-hidden">
                    <div className="bg-brand-accent h-full rounded" style={{ width: `${behavioral.consistencyScore}%` }} />
                  </div>
                  <span className="text-[0.5625rem] text-text-muted leading-relaxed">
                    Higher values indicate consistent recurrence of physical ingress markers, vehicle choices, and shift timestamps.
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Syndicate Connections */}
            {activeDossierTab === "network" && (
              <div className="flex flex-col gap-4 font-mono text-[0.6875rem] animate-fade-in">
                
                {/* Syndicate details card */}
                <div className="bg-bg-surface-elevated/20 border border-border-subtle p-3.5 rounded flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <div className="flex flex-col">
                      <span className="text-[0.5625rem] text-text-muted uppercase">Organized Syndicate:</span>
                      <span className="text-[0.75rem] font-bold text-text-primary uppercase">{syndicate.syndicateName}</span>
                    </div>
                    <span className="text-[0.55rem] font-bold px-2 py-0.5 rounded border border-severity-level3/30 bg-severity-level3/10 text-brand-gold uppercase">
                      {syndicate.threatTier}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[0.5625rem] text-text-muted uppercase">Network Role Designation:</span>
                      <span className="text-text-primary font-bold">{syndicate.role}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.5625rem] text-text-muted uppercase">Operational Area / Sub-cell:</span>
                      <span className="text-text-secondary font-bold">{syndicate.associatedCell}</span>
                    </div>
                  </div>
                </div>

                {/* Connection Strength meter */}
                <div className="bg-bg-surface-elevated/30 border border-border-subtle p-3.5 rounded flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[0.625rem]">
                    <span className="text-text-secondary uppercase font-bold">Syndicate Link Strength</span>
                    <span className="text-brand-primary font-bold">{syndicate.connectionStrength}% Confirmed</span>
                  </div>
                  <div className="w-full bg-bg-base h-2 rounded overflow-hidden">
                    <div className="bg-brand-primary h-full rounded" style={{ width: `${syndicate.connectionStrength}%` }} />
                  </div>
                  <span className="text-[0.5625rem] text-text-muted">
                    Based on cell triangulation, CDR call volume overlapping, and cross-accused interrogation files.
                  </span>
                </div>

                {/* Known Co-Accused & Linkages */}
                <div className="flex flex-col gap-2">
                  <span className="text-[0.5625rem] text-text-muted uppercase font-bold tracking-wider">Direct Co-Accused Gang Members:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedSuspect.associations.map((assoc, i) => (
                      <span
                        key={i}
                        className="text-[0.625rem] font-bold px-2.5 py-1.5 bg-bg-surface-elevated border border-border-subtle hover:border-border-focus rounded-sm text-text-primary flex items-center gap-1.5"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-border-critical" />
                        <span>{assoc.name}</span>
                        <span className="text-text-muted text-[0.5625rem] font-normal">({assoc.type})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Telemetry & Tower logs */}
            {activeDossierTab === "telemetry" && (
              <div className="flex flex-col gap-4 font-mono text-[0.6875rem] animate-fade-in">
                
                {/* CDR Hourly record chart */}
                <div className="border border-border-subtle rounded-md bg-bg-surface-elevated/20 p-4">
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

                {/* Coordinate Ingress Logs */}
                <div className="flex flex-col gap-2">
                  <span className="text-[0.5625rem] text-text-muted uppercase font-bold tracking-wider">Logged GPS Coordinate Trail:</span>
                  <div className="flex flex-col gap-1.5">
                    {selectedSuspect.coordinateHistory.map((coord, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-bg-surface-elevated/10 border border-border-subtle/50 rounded-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                          <span className="text-text-primary font-bold">{coord.lat.toFixed(4)}° N, {coord.lng.toFixed(4)}° E</span>
                        </div>
                        <span className="text-text-muted text-[0.625rem]">{coord.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </Card>
        </div>
      </div>
    </div>
  );
};
