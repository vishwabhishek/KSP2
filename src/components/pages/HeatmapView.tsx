"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { MapPin, Sliders, Eye, EyeOff, Radio, ZoomIn, ZoomOut } from "lucide-react";
import { useKsp } from "@/store/KspContext";

interface HotspotPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  intensity: number; // 0-100
  type: "theft" | "violent" | "cyber" | "narcotics";
}

const mockPins: HotspotPin[] = [
  { id: "p1", name: "Sector 4 Parking Grid East", lat: 120, lng: 210, intensity: 88, type: "theft" },
  { id: "p2", name: "Indiranagar Metro Perimeter", lat: 180, lng: 320, intensity: 94, type: "theft" },
  { id: "p3", name: "KR Puram Road Junction", lat: 260, lng: 140, intensity: 75, type: "violent" },
  { id: "p4", name: "Kalasipalyam Commercial Hub", lat: 310, lng: 480, intensity: 62, type: "narcotics" },
  { id: "p5", name: "Whitefield Tech Park Bounds", lat: 90, lng: 390, intensity: 80, type: "cyber" },
  { id: "p6", name: "Hebbal Overpass Checkpoint", lat: 210, lng: 80, intensity: 45, type: "violent" }
];

export const HeatmapView = () => {
  const { selectedDistrict } = useKsp();
  const [radius, setRadius] = useState<number>(30);
  const [opacity, setOpacity] = useState<number>(0.75);
  const [filterType, setFilterType] = useState<string>("all");
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(12);

  const filteredPins = mockPins.filter(
    p => filterType === "all" || p.type === filterType
  );

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            SPATIAL DENSITY HOTSPOTS
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Geospatial threat density representation for active jurisdiction: {selectedDistrict.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-[0.625rem] text-brand-accent font-bold uppercase tracking-wider">
            MAP COORDINATES SYNCHRONIZED
          </span>
        </div>
      </div>

      {/* Map Control Panel and Canvas Screen */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Left Side Floating Settings HUD */}
        <div className="w-[260px] flex flex-col gap-4 shrink-0 overflow-y-auto">
          {/* Filters HUD */}
          <Card title="Hotspot Parameters">
            <div className="flex flex-col gap-4 font-mono text-[0.6875rem]">
              {/* Type selector */}
              <div className="flex flex-col gap-1">
                <span className="text-[0.625rem] text-text-muted uppercase font-bold">incident parameters:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-bg-surface-elevated border border-border-subtle rounded-sm px-2 py-1 text-text-primary focus:outline-none focus:border-border-focus cursor-pointer"
                >
                  <option value="all">ALL CLASSIFICATIONS</option>
                  <option value="theft">THEFT & PROPERTY LOSS</option>
                  <option value="violent">VIOLENT CRIMES</option>
                  <option value="cyber">CYBER INTROUNDS</option>
                  <option value="narcotics">NARCOTICS TRAFFICKING</option>
                </select>
              </div>

              {/* Intensity Sliders */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[0.625rem] text-text-muted uppercase font-bold">density radius:</span>
                  <span className="text-brand-accent font-bold">{radius}px</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full accent-brand-accent cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[0.625rem] text-text-muted uppercase font-bold">overlay opacity:</span>
                  <span className="text-brand-accent font-bold">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={Math.round(opacity * 100)}
                  onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
                  className="w-full accent-brand-accent cursor-pointer"
                />
              </div>

              {/* Boundary Toggles */}
              <div className="flex items-center justify-between border-t border-border-subtle pt-3 mt-1">
                <span className="text-[0.625rem] text-text-muted uppercase font-bold">district boundaries:</span>
                <button
                  onClick={() => setShowBoundaries(!showBoundaries)}
                  className="p-1 hover:bg-bg-surface-elevated border border-border-subtle rounded-sm text-text-primary cursor-pointer"
                >
                  {showBoundaries ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </Card>

          {/* Quick Stats Panel */}
          <Card title="Threat Diagnostics">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem]">
              <div className="flex justify-between">
                <span className="text-text-muted">ACTIVE SECTORS:</span>
                <span className="font-bold text-text-primary">06 Zone Clusters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">HOTTEST PEAK COORD:</span>
                <span className="font-bold text-border-critical">Indiranagar M-12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">CRITICAL RISK DENS:</span>
                <span className="font-bold text-severity-level3">3.8 incidents/km²</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side Canvas Area Map */}
        <div className="flex-1 bg-bg-surface border border-border-subtle rounded-md relative overflow-hidden flex flex-col justify-between">
          {/* Zoom Buttons HUD */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <Button size="sm" variant="hud" onClick={() => setZoom(prev => Math.min(18, prev + 1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="hud" onClick={() => setZoom(prev => Math.max(8, prev - 1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Status HUD Header Overlay */}
          <div className="absolute top-3 left-3 bg-bg-base/70 backdrop-blur-md border border-border-subtle p-2.5 rounded-sm z-10 flex flex-col gap-0.5 font-mono select-none pointer-events-none">
            <span className="text-[0.625rem] font-bold text-text-primary">GRID VIEWPORT: 12.9716° N, 77.5946° E</span>
            <span className="text-[0.5rem] text-text-muted">SCALE CONSTANT: Zoom Level {zoom} • Projection Mercator</span>
          </div>

          {/* SVG Map Canvas Grid */}
          <div className="flex-1 w-full h-full relative bg-[#070a13]">
            {/* Draw Dot Grid Background */}
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="dot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="1.5" cy="1.5" r="1.5" fill="#161d33" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dot-grid)" />

              {/* Draw simulated roads */}
              <line x1="0" y1="150" x2="1000" y2="150" stroke="#1c2336" strokeWidth="2.5" />
              <line x1="0" y1="350" x2="1000" y2="350" stroke="#1c2336" strokeWidth="2.5" />
              <line x1="300" y1="0" x2="300" y2="800" stroke="#1c2336" strokeWidth="2.5" />
              <line x1="600" y1="0" x2="600" y2="800" stroke="#1c2336" strokeWidth="2.5" />

              {/* Draw simulated boundaries */}
              {showBoundaries && (
                <path
                  d="M 100 100 Q 250 80 400 180 T 800 200 T 900 600 Q 500 500 100 450 Z"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
              )}

              {/* Draw density heatmap overlays */}
              {filteredPins.map(p => (
                <g key={p.id}>
                  {/* Heat Radius gradient */}
                  <circle
                    cx={p.lng}
                    cy={p.lat}
                    r={radius * (p.intensity / 70)}
                    fill={p.type === "theft" ? "#ef4444" : p.type === "violent" ? "#f59e0b" : "#00d8f6"}
                    opacity={opacity * 0.25}
                  />
                  <circle
                    cx={p.lng}
                    cy={p.lat}
                    r={radius * (p.intensity / 110)}
                    fill={p.type === "theft" ? "#ef4444" : p.type === "violent" ? "#f59e0b" : "#00d8f6"}
                    opacity={opacity * 0.45}
                  />

                  {/* Pin core */}
                  <circle
                    cx={p.lng}
                    cy={p.lat}
                    r="4"
                    fill="#ffffff"
                    className="animate-ping"
                  />
                  <circle
                    cx={p.lng}
                    cy={p.lat}
                    r="3.5"
                    fill={p.type === "theft" ? "#ef4444" : p.type === "violent" ? "#f59e0b" : "#00d8f6"}
                  />
                </g>
              ))}
            </svg>

            {/* Render Floating Pins info boxes */}
            <div className="absolute inset-0 pointer-events-none">
              {filteredPins.map(p => (
                <div
                  key={p.id}
                  style={{ left: p.lng + 10, top: p.lat - 15 }}
                  className="absolute bg-bg-base/90 border border-border-subtle px-2 py-1 rounded-sm text-[0.5625rem] font-mono text-text-primary shadow-medium pointer-events-auto flex items-center gap-1.5"
                >
                  <MapPin className="h-3 w-3 text-border-critical" />
                  <div>
                    <span className="font-bold">{p.name}</span>
                    <span className="text-text-muted ml-1.5">({p.intensity}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
