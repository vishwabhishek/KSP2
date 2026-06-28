"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";
import { DataTable } from "../ui/DataTable";
import { stationsList } from "@/utils/mockData";
import { MapPin, Shield, Star, Users } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

interface OfficerRosterItem {
  badgeId: string;
  name: string;
  rank: string;
  assignment: string;
  status: "onDuty" | "offDuty" | "dispatched" | "standby";
}

const mockRoster: OfficerRosterItem[] = [
  { badgeId: "B-9982", name: "S. K. Kulkarni", rank: "Sub-Inspector", assignment: "Patrol Zone Alpha", status: "onDuty" },
  { badgeId: "B-4311", name: "N. M. Gowda", rank: "Head Constable", assignment: "Patrol Zone Beta", status: "dispatched" },
  { badgeId: "B-1288", name: "V. R. Deshpande", rank: "Constable", assignment: "Station Duty Officer", status: "standby" },
  { badgeId: "B-0911", name: "Kumari A. S.", rank: "Constable", assignment: "Evidence Room Custody", status: "onDuty" },
  { badgeId: "B-7611", name: "Prasad K. N.", rank: "Constable", assignment: "Off-duty Standby Rest", status: "offDuty" }
];

export const StationView = () => {
  const [selectedStation, setSelectedStation] = useState(stationsList[0]);

  // Roster Columns
  const rosterColumns: ColumnDef<OfficerRosterItem>[] = [
    {
      accessorKey: "badgeId",
      header: "Badge ID",
      cell: info => <span className="font-mono text-text-accent font-bold">{info.getValue() as string}</span>
    },
    {
      accessorKey: "name",
      header: "Officer Name",
      cell: info => <span className="font-bold">{info.getValue() as string}</span>
    },
    {
      accessorKey: "rank",
      header: "Rank",
      cell: info => <span className="text-text-secondary">{info.getValue() as string}</span>
    },
    {
      accessorKey: "assignment",
      header: "Assignment Sector",
      cell: info => <span className="text-text-primary truncate">{info.getValue() as string}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: info => {
        const val = info.getValue() as string;
        return (
          <span
            className={`font-mono text-[0.5625rem] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${
              val === "onDuty"
                ? "bg-severity-level1/10 text-severity-level1 border border-severity-level1/20"
                : val === "dispatched"
                ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                : val === "standby"
                ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                : "bg-bg-surface-elevated text-text-muted border border-border-subtle"
            }`}
          >
            {val}
          </span>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            PRECINCT OPERATIONS INSPECTOR
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Locate physical station coordinates, active personnel deployments, and gauge speeds.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Side Stations List */}
        <div className="flex flex-col gap-3">
          <Card title="Precinct Registry">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem]">
              {stationsList.map(s => {
                const isSelected = selectedStation.name === s.name;
                return (
                  <div
                    key={s.name}
                    onClick={() => setSelectedStation(s)}
                    className={`p-3 border border-border-subtle rounded-sm cursor-pointer flex flex-col gap-1 ${
                      isSelected ? "bg-bg-surface-elevated border-brand-primary" : "bg-bg-surface hover:bg-bg-surface-elevated/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-accent shrink-0" />
                      <span className="font-bold text-text-primary uppercase text-[0.6875rem]">{s.name}</span>
                    </div>

                    <div className="flex justify-between text-text-secondary mt-1.5">
                      <span>Response speed:</span>
                      <span className="font-bold text-text-accent">{s.avgResponseTime} min</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Radial speedgauge card mockup */}
          <Card title="Response Diagnostic Gauge">
            <div className="flex flex-col items-center justify-center py-4 font-mono">
              {/* Radial Arc */}
              <div className="relative h-28 w-44 flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 50">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#1f293d"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Active Gauge arc */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 65 20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute bottom-1 flex flex-col items-center">
                  <span className="text-[1.25rem] font-bold text-text-primary">{selectedStation.avgResponseTime}m</span>
                  <span className="text-[0.5625rem] text-text-muted uppercase">latency limit</span>
                </div>
              </div>

              <span className="text-[0.625rem] text-severity-level1 font-bold mt-2">
                EXCELLENT RESPONSE LATENCY INDEX (TARGET &lt; 5.0m)
              </span>
            </div>
          </Card>
        </div>

        {/* Right Side Personnel Table and Dispatch Map info */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card
            title={`${selectedStation.name.toUpperCase()} — ACTIVE ROSTER`}
            subtitle="Personnel logged into central terminal networks and sector units"
            headerAction={
              <div className="flex items-center gap-1 text-[0.6875rem] font-mono text-text-secondary">
                <Users className="h-4 w-4 text-brand-primary" /> {selectedStation.onDutyStaff} OFFICERS REGISTERED
              </div>
            }
          >
            <DataTable columns={rosterColumns} data={mockRoster} />
          </Card>

          {/* Quick Metrics details */}
          <div className="grid grid-cols-2 gap-4">
            <Card title="Precinct Motor Pool Status">
              <div className="flex flex-col gap-2 font-mono text-[0.6875rem]">
                <div className="flex justify-between border-b border-border-subtle pb-1">
                  <span className="text-text-secondary">PATROL VEHICLES ASSIGNED:</span>
                  <span className="font-bold text-text-primary">{selectedStation.activeVehicles} Cars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">QRT RESPONSE FLEETS:</span>
                  <span className="font-bold text-brand-accent">2 Teams</span>
                </div>
              </div>
            </Card>

            <Card title="Station Case Backlog Load">
              <div className="flex flex-col gap-2 font-mono text-[0.6875rem]">
                <div className="flex justify-between border-b border-border-subtle pb-1">
                  <span className="text-text-secondary">PENDING FIR COMPILATIONS:</span>
                  <span className="font-bold text-text-primary">{selectedStation.pendingCases} cases</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">CHARGE SHEETS FILED:</span>
                  <span className="font-bold text-severity-level1">84% completed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
