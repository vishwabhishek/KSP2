"use client";

import React from "react";
import { timelineEvents } from "@/utils/mockData";
import { Card } from "../ui/Card";
import { Clock, MapPin, Radio, Shield } from "lucide-react";

export const TimelineView = () => {
  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            CHRONOLOGICAL SEQUENCE INSPECTOR
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Inspect chronological movement logs, cell logs, and CCTV markers for targets.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Side Control Panel */}
        <div className="flex flex-col gap-3">
          <Card title="Target Sequence Scope">
            <div className="flex flex-col gap-4 font-mono text-[0.6875rem]">
              <div className="flex flex-col gap-1">
                <span className="text-text-muted uppercase font-bold">target designation:</span>
                <div className="px-2.5 py-1.5 bg-bg-surface-elevated border border-border-subtle rounded-sm font-bold text-text-primary">
                  VIKRAM GOWDA (VICKY BHAI)
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-text-muted uppercase font-bold">imei / cellular track:</span>
                <div className="px-2.5 py-1.5 bg-bg-surface-elevated border border-border-subtle rounded-sm text-text-secondary select-all font-mono text-[0.625rem]">
                  IMEI-88019283748291
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-text-muted uppercase font-bold">associated vehicle:</span>
                <div className="px-2.5 py-1.5 bg-bg-surface-elevated border border-border-subtle rounded-sm text-border-critical font-bold">
                  KA-03-MR-9801 (Honda City)
                </div>
              </div>
            </div>
          </Card>

          <Card title="Signal Tower Telemetry">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem] text-text-secondary">
              <div className="flex justify-between border-b border-border-subtle pb-1">
                <span>Tower T-Indira-04:</span>
                <span className="font-bold text-severity-level1">ACTIVE</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-1">
                <span>Tower T-Halasuru-12:</span>
                <span className="font-bold text-severity-level1">ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span>Ingress CCTV Nodes:</span>
                <span className="font-bold text-brand-gold">04 FLAG ALERTS</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side Vertical Timeline Stream */}
        <div className="lg:col-span-2">
          <Card title="Chronological Incident Sequence Flow" subtitle="Events logged across cellular tower grids and road network ingress checkposts">
            <div className="relative border-l border-border-subtle ml-4 pl-6 py-4 flex flex-col gap-8">
              {timelineEvents.map((ev, index) => {
                return (
                  <div key={index} className="relative group select-text">
                    {/* Pulsing indicator bullet */}
                    <span className="absolute -left-[30px] top-1.5 h-4.5 w-4.5 rounded-full border-2 border-bg-base bg-bg-surface flex items-center justify-center">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          ev.eventSeverity === "level4"
                            ? "bg-severity-level3 animate-pulse"
                            : ev.eventSeverity === "level3"
                            ? "bg-brand-gold"
                            : "bg-brand-accent"
                        }`}
                      />
                    </span>

                    {/* Timeline box card */}
                    <div className="bg-bg-surface-elevated border border-border-subtle rounded-sm p-3.5 shadow-low hover:border-border-focus transition-colors duration-100 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[0.6875rem] font-bold text-text-primary uppercase tracking-wide">
                          {ev.eventTitle}
                        </span>
                        <div className="flex items-center gap-1 text-[0.625rem] font-mono text-text-muted">
                          <Clock className="h-3.5 w-3.5 text-brand-accent" /> {ev.eventTime}
                        </div>
                      </div>

                      <p className="text-[0.75rem] text-text-secondary font-sans leading-relaxed">
                        {ev.eventDetails}
                      </p>

                      <div className="flex items-center gap-1.5 text-[0.5625rem] font-mono text-text-muted border-t border-border-subtle/40 pt-2 mt-1 select-none">
                        <MapPin className="h-3 w-3 text-text-accent" />
                        <span>COORDINATE INGRESS: lat: {ev.lat}, lng: {ev.lng}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
