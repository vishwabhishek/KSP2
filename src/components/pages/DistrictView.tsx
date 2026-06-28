"use client";

import React, { useState } from "react";
import { districtsList, DistrictItem } from "@/utils/mockData";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Search, ShieldAlert, Award, Star, Compass } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const radarMockData = [
  { subject: "Property Theft", A: 120, B: 110, fullMark: 150 },
  { subject: "Cyber Crime", A: 98, B: 130, fullMark: 150 },
  { subject: "Violent Incident", A: 86, B: 130, fullMark: 150 },
  { subject: "Narcotics", A: 99, B: 100, fullMark: 150 },
  { subject: "Financial Fraud", A: 85, B: 90, fullMark: 150 }
];

export const DistrictView = () => {
  const [search, setSearch] = useState("");
  const [selectedDist, setSelectedDist] = useState<DistrictItem>(districtsList[0]);

  const filteredDistricts = districtsList.filter(d =>
    d.districtName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1 select-none">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            DISTRICT PERFORMANCE DIRECTORY
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Inspect performance statistics, active caseloads, and response quotients across districts.
          </span>
        </div>
      </div>

      {/* Main Splitscreen */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Side Directory List */}
        <div className="w-[320px] shrink-0 flex flex-col gap-3 min-h-0">
          <Input
            placeholder="Search districts..."
            prefixIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex-1 overflow-y-auto border border-border-subtle rounded-md divide-y divide-border-subtle bg-bg-surface select-none">
            {filteredDistricts.map(d => {
              const isSelected = selectedDist.districtName === d.districtName;
              return (
                <div
                  key={d.districtName}
                  onClick={() => setSelectedDist(d)}
                  className={`p-3.5 flex flex-col gap-1 cursor-pointer transition-colors duration-100 ${
                    isSelected ? "bg-bg-surface-elevated" : "hover:bg-bg-surface-elevated/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.75rem] font-mono font-bold text-text-primary uppercase">
                      {d.districtName}
                    </span>
                    <span
                      className={`text-[0.5625rem] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                        d.riskLevel === "High"
                          ? "bg-severity-level3/15 text-severity-level3 border border-severity-level3/25"
                          : d.riskLevel === "Moderate"
                          ? "bg-brand-gold/15 text-brand-gold border border-brand-gold/25"
                          : "bg-severity-level1/15 text-severity-level1 border border-severity-level1/25"
                      }`}
                    >
                      {d.riskLevel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[0.6875rem] text-text-secondary font-mono mt-1">
                    <span>Clearance Rate:</span>
                    <span className="font-bold text-text-accent">{d.clearanceRate}%</span>
                  </div>
                </div>
              );
            })}

            {filteredDistricts.length === 0 && (
              <div className="p-8 text-center text-text-muted font-mono text-[0.6875rem]">
                NO DISTRICTS FOUND MATCHING QUERY.
              </div>
            )}
          </div>
        </div>

        {/* Right Side Visual Performance Details */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-h-0 select-none">
          <Card
            title={`${selectedDist.districtName.toUpperCase()} — ACTIVE SUMMARY`}
            borderAccent={selectedDist.riskLevel === "High" ? "critical" : "left"}
          >
            <div className="grid grid-cols-3 gap-4 font-mono mb-4 text-[0.75rem]">
              <div className="bg-bg-surface-elevated/50 p-3 rounded-sm border border-border-subtle flex flex-col gap-0.5">
                <span className="text-text-muted text-[0.625rem] uppercase">active cases</span>
                <span className="text-xl font-bold text-text-primary">{selectedDist.incidentCount} FIRs</span>
              </div>
              <div className="bg-bg-surface-elevated/50 p-3 rounded-sm border border-border-subtle flex flex-col gap-0.5">
                <span className="text-text-muted text-[0.625rem] uppercase">avg response speed</span>
                <span className="text-xl font-bold text-text-primary">{selectedDist.responseScore} Mins</span>
              </div>
              <div className="bg-bg-surface-elevated/50 p-3 rounded-sm border border-border-subtle flex flex-col gap-0.5">
                <span className="text-text-muted text-[0.625rem] uppercase">officer solver rating</span>
                <span className="text-xl font-bold text-severity-level1">{selectedDist.clearanceRate}% Solve</span>
              </div>
            </div>

            {/* Radar Charts Grid */}
            <div className="border border-border-subtle rounded-md bg-bg-surface-elevated/20 p-4 flex flex-col items-center">
              <h4 className="font-mono text-[0.6875rem] font-bold text-text-secondary uppercase self-start mb-2">
                Crime Profiling Index Comparison
              </h4>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarMockData}>
                    <PolarGrid stroke="#1f293d" />
                    <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                    <PolarRadiusAxis stroke="#1f293d" angle={30} domain={[0, 150]} tick={{ fontSize: 9 }} />
                    <Radar name="Active District" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                    <Radar name="State Average" dataKey="B" stroke="#00d8f6" fill="#00d8f6" fillOpacity={0.1} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
