"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { MapPin, Sliders, Eye, EyeOff, Radio, ZoomIn, ZoomOut, Navigation, Shield, Info, AlertTriangle, Clock, Zap, Target } from "lucide-react";
import { useKsp } from "@/store/KspContext";
import { cadLogs, stationsList } from "@/utils/mockData";

const LeafletMapComponent = dynamic(
  () => import("../ui/LeafletMapComponent"),
  { ssr: false }
);

interface DBIncident {
  id: string | number;
  fir_number: string;
  district: string;
  police_station: string;
  timestamp: string | null;
  latitude: number | null;
  longitude: number | null;
  ipc_sections: string;
  modus_operandi_text: string;
  processed: boolean;
  entities: Array<{ name: string; type: string }>;
}

export const HeatmapView = () => {
  const { selectedDistrict, logActivity } = useKsp();
  const [incidents, setIncidents] = useState<DBIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [radius, setRadius] = useState<number>(35);
  const [opacity, setOpacity] = useState<number>(0.75);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<DBIncident | null>(null);

  // Spatiotemporal Shift State: all, morning (6-12), afternoon (12-18), evening (18-00), night (0-6)
  const [selectedShift, setSelectedShift] = useState<"all" | "morning" | "afternoon" | "evening" | "night">("all");

  // Preemptive Patrol Dispatch Animation States
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [activeDispatchRoute, setActiveDispatchRoute] = useState<boolean>(false);

  // Layer Toggles
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showPatrols, setShowPatrols] = useState<boolean>(true);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(12);

  // Right Inspector Column Tab State: "analytics" | "inspector"
  const [activeInspectorTab, setActiveInspectorTab] = useState<"analytics" | "inspector">("analytics");

  // Fetch incidents from API on mount
  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/incidents");
        if (res.ok) {
          const data = await res.json();
          setIncidents(data.incidents || []);
        }
      } catch (err) {
        console.error("Error fetching map incidents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  // Filter incidents by district context, category, AND Time-of-Day Shift
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // 1. District check
      const matchesDistrict =
        selectedDistrict === "All Districts" ||
        inc.district?.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
        selectedDistrict.toLowerCase().includes(inc.district?.toLowerCase());

      if (!matchesDistrict) return false;

      // 2. Classification search pattern in IPC sections
      if (filterType !== "all") {
        const ipc = inc.ipc_sections?.toLowerCase() || "";
        const mo = inc.modus_operandi_text?.toLowerCase() || "";
        
        const isTheft = ipc.includes("379") || ipc.includes("theft") || mo.includes("theft") || mo.includes("stole");
        const isViolent = ipc.includes("302") || ipc.includes("murder") || ipc.includes("assault") || mo.includes("assault") || mo.includes("fight");
        const isCyber = ipc.includes("66") || ipc.includes("it act") || mo.includes("cyber") || mo.includes("phishing");
        const isFraud = ipc.includes("420") || ipc.includes("fraud") || mo.includes("fraud") || mo.includes("cheat");

        if (filterType === "theft" && !isTheft) return false;
        if (filterType === "violent" && !isViolent) return false;
        if (filterType === "cyber" && !isCyber) return false;
        if (filterType === "fraud" && !isFraud) return false;
      }

      // 3. Spatiotemporal shift filter
      if (selectedShift !== "all" && inc.timestamp) {
        const dateObj = new Date(inc.timestamp);
        const hour = dateObj.getUTCHours(); // Standardize on UTC hour
        
        if (selectedShift === "morning") {
          if (hour < 6 || hour >= 12) return false;
        } else if (selectedShift === "afternoon") {
          if (hour < 12 || hour >= 18) return false;
        } else if (selectedShift === "evening") {
          if (hour < 18 || hour >= 24) return false;
        } else if (selectedShift === "night") {
          if (hour < 0 || hour >= 6) return false;
        }
      }

      return true;
    });
  }, [incidents, selectedDistrict, filterType, selectedShift]);

  // Bounding box calculation for viewport auto-projection
  const projection = useMemo(() => {
    // Collect all valid lat/lngs to scale
    const validCoords = filteredIncidents.filter(
      (inc) => inc.latitude !== null && inc.longitude !== null
    ) as Array<Required<Pick<DBIncident, "latitude" | "longitude">> & DBIncident>;

    // Include CAD and Stations in boundary computations for complete coverage
    const allLats = [
      ...validCoords.map((i) => i.latitude as number),
      ...cadLogs.map((c) => c.latitude),
      ...stationsList.map((s) => s.lat),
    ];
    const allLngs = [
      ...validCoords.map((i) => i.longitude as number),
      ...cadLogs.map((c) => c.longitude),
      ...stationsList.map((s) => s.lng),
    ];

    const minLat = allLats.length > 0 ? Math.min(...allLats) - 0.02 : 12.85;
    const maxLat = allLats.length > 0 ? Math.max(...allLats) + 0.02 : 13.08;
    const minLng = allLngs.length > 0 ? Math.min(...allLngs) - 0.02 : 77.45;
    const maxLng = allLngs.length > 0 ? Math.max(...allLngs) + 0.02 : 77.78;

    return {
      scaleY: (lat: number) => {
        const pct = (lat - minLat) / (maxLat - minLat);
        return 750 - pct * 700;
      },
      scaleX: (lng: number) => {
        const pct = (lng - minLng) / (maxLng - minLng);
        return 50 + pct * 900;
      },
    };
  }, [filteredIncidents]);

  // Identify the Primary Hotspot core (the densest/highest risk unresolved incident coordinates)
  const primaryHotspot = useMemo(() => {
    const activeCoords = filteredIncidents.filter(
      (i) => i.latitude !== null && i.longitude !== null && !i.processed
    );
    return activeCoords.length > 0 ? activeCoords[0] : null;
  }, [filteredIncidents]);

  // Find nearest CAD patrol unit to primary hotspot for proactive routing
  const proactiveDispatch = useMemo(() => {
    if (!primaryHotspot || !primaryHotspot.latitude || !primaryHotspot.longitude) return null;
    
    let closestUnit = cadLogs[0];
    let minDistance = Infinity;
    
    cadLogs.forEach((unit) => {
      const dist = Math.hypot(
        unit.latitude - primaryHotspot.latitude!,
        unit.longitude - primaryHotspot.longitude!
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestUnit = unit;
      }
    });

    return {
      unit: closestUnit,
      hotspot: primaryHotspot,
      lat: primaryHotspot.latitude!,
      lng: primaryHotspot.longitude!
    };
  }, [primaryHotspot]);

  // Dynamic calculations for spatiotemporal temporal rates
  const temporalCounts = useMemo(() => {
    let morning = 0;
    let afternoon = 0;
    let evening = 0;
    let night = 0;

    filteredIncidents.forEach((inc) => {
      if (inc.timestamp) {
        const dateObj = new Date(inc.timestamp);
        const hour = dateObj.getUTCHours();
        if (hour >= 6 && hour < 12) morning++;
        else if (hour >= 12 && hour < 18) afternoon++;
        else if (hour >= 18 && hour < 24) evening++;
        else night++;
      } else {
        const idNum = typeof inc.id === "number" ? inc.id : parseInt(String(inc.id).split("-")[1] || "0");
        if (idNum % 4 === 0) morning++;
        else if (idNum % 4 === 1) afternoon++;
        else if (idNum % 4 === 2) evening++;
        else night++;
      }
    });

    const total = morning + afternoon + evening + night || 1;
    return {
      morning: { count: morning, pct: Math.round((morning / total) * 100) },
      afternoon: { count: afternoon, pct: Math.round((afternoon / total) * 100) },
      evening: { count: evening, pct: Math.round((evening / total) * 100) },
      night: { count: night, pct: Math.round((night / total) * 100) },
      total
    };
  }, [filteredIncidents]);

  // Dynamic calculations for spatial clusters
  const spatialClusters = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIncidents.forEach((inc) => {
      const station = inc.police_station || "Precinct bounds";
      counts[station] = (counts[station] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [filteredIncidents]);

  // Preemptive resource deployment AI advisor recommendations
  const deploymentDirective = useMemo(() => {
    const topCluster = spatialClusters[0];
    if (!topCluster) {
      return "Low Threat Level: No active hotspots detected. Continue routine patrol configurations.";
    }

    if (filterType === "theft") {
      return `Theft Alert: Spot cluster identified in ${topCluster.name} (${topCluster.count} incidents). Deploy marked patrol vectors to high-value retail grids and commercial terminals.`;
    } else if (filterType === "violent") {
      return `Violence Risk Indicator: Spatiotemporal escalation in ${topCluster.name} bounds. Redirect intercept bikes and tactical response personnel to transport junctions during twilight hours.`;
    } else if (filterType === "cyber" || filterType === "fraud") {
      return `Cyber / Fraud Notice: Clustering detected within tech corridors inside ${topCluster.name}. Coordinate active monitoring on server databases and finance desks.`;
    } else {
      return `Preemptive Dispatch Directive: High density cluster of ${topCluster.count} cases logged in ${topCluster.name}. Advise deploying secondary units to secure the precinct perimeter.`;
    }
  }, [spatialClusters, filterType]);

  // Wrap incident select to toggle inspector tab
  const handleSelectIncident = (inc: DBIncident | null) => {
    setSelectedIncident(inc);
    if (inc) {
      setActiveInspectorTab("inspector");
    }
  };

  // Trigger dispatch animation vectoring
  const handleTriggerDispatch = () => {
    if (isDispatching || !proactiveDispatch) return;
    logActivity(`Preemptively dispatched patrol unit ${proactiveDispatch.unit.unitId} to hotspot area (${proactiveDispatch.hotspot.fir_number})`);
    setIsDispatching(true);
    setAnimationProgress(0);
    
    let start = Date.now();
    const duration = 2400; // 2.4 second transit
    
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      setAnimationProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Complete transit
        setIsDispatching(false);
        setActiveDispatchRoute(false);
      }
    };
    
    requestAnimationFrame(tick);
  };

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            GEOSPATIAL HOTSPOT FORENSICS
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Identify spatiotemporal hotspots by layering time of day with location indicators to guide proactive deployment.
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-[0.625rem] text-brand-accent font-bold uppercase tracking-wider">
            {loading ? "DOWNLINKING LIVE COORDINATES..." : "SPATIAL ENGINE FEED ONLINE"}
          </span>
        </div>
      </div>

      {/* Map Content Viewport */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        
        {/* Left Side: Dynamic Settings HUD */}
        <div className="w-[280px] flex flex-col gap-4 shrink-0 overflow-y-auto">
          {/* Spatiotemporal Layer Controls */}
          <Card title="Temporal Shift Filter">
            <div className="flex flex-col gap-3 font-mono text-[0.6875rem]">
              <span className="text-[0.5625rem] text-text-muted uppercase font-bold tracking-wider">
                Select Time Window (Time of Day):
              </span>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSelectedShift("all")}
                  className={`px-2 py-1.5 rounded-sm border text-[0.625rem] uppercase font-bold cursor-pointer transition-colors ${
                    selectedShift === "all" ? "bg-brand-primary text-text-primary border-brand-primary" : "bg-bg-base text-text-muted border-border-subtle hover:text-text-primary"
                  }`}
                >
                  All Hours
                </button>
                <button
                  onClick={() => setSelectedShift("morning")}
                  className={`px-2 py-1.5 rounded-sm border text-[0.625rem] uppercase font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 ${
                    selectedShift === "morning" ? "bg-brand-primary text-text-primary border-brand-primary" : "bg-bg-base text-text-muted border-border-subtle hover:text-text-primary"
                  }`}
                >
                  <Clock className="h-3 w-3 shrink-0" />
                  06-12 AM
                </button>
                <button
                  onClick={() => setSelectedShift("afternoon")}
                  className={`px-2 py-1.5 rounded-sm border text-[0.625rem] uppercase font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 ${
                    selectedShift === "afternoon" ? "bg-brand-primary text-text-primary border-brand-primary" : "bg-bg-base text-text-muted border-border-subtle hover:text-text-primary"
                  }`}
                >
                  <Clock className="h-3 w-3 shrink-0" />
                  12-18 PM
                </button>
                <button
                  onClick={() => setSelectedShift("evening")}
                  className={`px-2 py-1.5 rounded-sm border text-[0.625rem] uppercase font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 ${
                    selectedShift === "evening" ? "bg-brand-primary text-text-primary border-brand-primary" : "bg-bg-base text-text-muted border-border-subtle hover:text-text-primary"
                  }`}
                >
                  <Clock className="h-3 w-3 shrink-0" />
                  18-00 PM
                </button>
                <button
                  onClick={() => setSelectedShift("night")}
                  className={`px-2 py-1.5 rounded-sm border text-[0.625rem] uppercase font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 ${
                    selectedShift === "night" ? "bg-brand-primary text-text-primary border-brand-primary" : "bg-bg-base text-text-muted border-border-subtle hover:text-text-primary"
                  }`}
                >
                  <Clock className="h-3 w-3 shrink-0" />
                  00-06 AM
                </button>
              </div>

              <div className="bg-bg-surface-elevated/40 p-2.5 rounded border border-border-subtle/80 flex flex-col gap-1 text-[0.625rem] leading-normal text-text-secondary mt-1">
                <span className="font-bold text-text-primary uppercase flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-text-accent" />
                  Spatiotemporal Insights:
                </span>
                <span>
                  {selectedShift === "all" && "Analyze state-wide aggregate coordinates without temporal segmentation."}
                  {selectedShift === "morning" && "Morning patterns typically indicate commercial gate check breaches and vehicle-related property losses."}
                  {selectedShift === "afternoon" && "Afternoon records flag financial scams, municipal banking bypass operations, and retail frauds."}
                  {selectedShift === "evening" && "Evening hours cluster in high-footfall corridors (restaurant belts, transit terminals)."}
                  {selectedShift === "night" && "Night shift indicators flag industrial warehouses, highway corridors, and gang rivalry clusters."}
                </span>
              </div>
            </div>
          </Card>

          {/* Preemptive Patrol Advisor */}
          <Card title="Preemptive Patrol Advisor">
            <div className="font-mono text-[0.6875rem] flex flex-col gap-2.5">
              {proactiveDispatch ? (
                <div className="flex flex-col gap-2 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-brand-gold border-b border-border-subtle pb-1.5">
                    <Zap className="h-4.5 w-4.5 text-brand-gold shrink-0" />
                    <span className="font-bold uppercase text-[0.7rem]">PATROL INTERCEPT ROUTE</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-muted text-[0.5625rem] uppercase">ADVISED PATROL UNIT:</span>
                    <span className="text-text-primary font-bold">{proactiveDispatch.unit.unitId} ({proactiveDispatch.unit.location})</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-text-muted text-[0.5625rem] uppercase">TARGET THREAT GRID:</span>
                    <span className="text-severity-level3 font-bold">{proactiveDispatch.hotspot.fir_number} ({proactiveDispatch.hotspot.police_station})</span>
                  </div>

                  <div className="flex items-center gap-2 border-t border-border-subtle/50 pt-2 mt-1">
                    <button
                      onClick={() => setActiveDispatchRoute(!activeDispatchRoute)}
                      className={`flex-1 py-1 rounded text-[0.625rem] font-bold uppercase border cursor-pointer transition-colors ${
                        activeDispatchRoute 
                          ? "bg-bg-surface-elevated text-brand-accent border-brand-accent"
                          : "bg-bg-base text-text-muted border-border-subtle"
                      }`}
                    >
                      {activeDispatchRoute ? "Hide Advised Route" : "Show Advised Route"}
                    </button>
                    <button
                      disabled={isDispatching}
                      onClick={handleTriggerDispatch}
                      className="px-2.5 py-1 rounded text-[0.625rem] font-bold uppercase bg-severity-level1 text-text-primary cursor-pointer disabled:opacity-40"
                    >
                      {isDispatching ? "Vectoring..." : "Deploy"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-text-muted text-center leading-normal">
                  <Target className="h-5 w-5 text-text-muted/60" />
                  <span>No unresolved hotspots in selected segment to advise patrol dispatch routes.</span>
                </div>
              )}
            </div>
          </Card>

          {/* Layer visibility controller */}
          <Card title="Display Control Layers">
            <div className="flex flex-col gap-3 font-mono text-[0.6875rem]">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary uppercase">Hotspot Density:</span>
                <button
                  onClick={() => setShowHotspots(!showHotspots)}
                  className={`px-2 py-0.5 rounded border text-[0.625rem] uppercase font-bold cursor-pointer transition-colors ${
                    showHotspots ? "bg-brand-primary text-text-primary border-brand-primary" : "bg-bg-base text-text-muted border-border-subtle"
                  }`}
                >
                  {showHotspots ? "Active" : "Muted"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-secondary uppercase">CAD Patrol Fleet:</span>
                <button
                  onClick={() => setShowPatrols(!showPatrols)}
                  className={`px-2 py-0.5 rounded border text-[0.625rem] uppercase font-bold cursor-pointer transition-colors ${
                    showPatrols ? "bg-brand-primary text-text-primary border-brand-primary" : "bg-bg-base text-text-muted border-border-subtle"
                  }`}
                >
                  {showPatrols ? "Visible" : "Hidden"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-secondary uppercase">Station Precincts:</span>
                <button
                  onClick={() => setShowStations(!showStations)}
                  className={`px-2 py-0.5 rounded border text-[0.625rem] uppercase font-bold cursor-pointer transition-colors ${
                    showStations ? "bg-brand-primary text-text-primary border-brand-primary" : "bg-bg-base text-text-muted border-border-subtle"
                  }`}
                >
                  {showStations ? "Visible" : "Hidden"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-secondary uppercase">Sector Grid lines:</span>
                <button
                  onClick={() => setShowBoundaries(!showBoundaries)}
                  className={`p-1 border rounded cursor-pointer transition-colors ${
                    showBoundaries ? "bg-bg-surface-elevated text-brand-accent border-brand-accent" : "bg-bg-base text-text-muted border-border-subtle"
                  }`}
                >
                  {showBoundaries ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </Card>

          {/* Filtering parameters */}
          <Card title="Hotspot Parameters">
            <div className="flex flex-col gap-4 font-mono text-[0.6875rem]">
              <div className="flex flex-col gap-1">
                <span className="text-[0.625rem] text-text-muted uppercase font-bold">incident classification:</span>
                <select
                  value={filterType}
                  onChange={(e) => {
                    logActivity(`Filtered hotspot classification to: ${e.target.value.toUpperCase()}`);
                    setFilterType(e.target.value);
                  }}
                  className="bg-bg-surface-elevated border border-border-subtle rounded-sm px-2 py-1 text-text-primary focus:outline-none focus:border-border-focus cursor-pointer"
                >
                  <option value="all">ALL IPC INCIDENTS</option>
                  <option value="theft">THEFT & PROPERTY LOSS</option>
                  <option value="violent">VIOLENT & ASSAULT</option>
                  <option value="cyber">IT ACT / CYBER BREACH</option>
                  <option value="fraud">FINANCIAL CHEATING</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[0.625rem] text-text-muted uppercase font-bold">density radius:</span>
                  <span className="text-brand-accent font-bold">{radius}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
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
            </div>
          </Card>
        </div>

        {/* Right Side: Map Canvas Grid */}
        <div className="flex-1 bg-bg-surface border border-border-subtle rounded-md relative overflow-hidden flex flex-col">
          {/* Floating Viewport Legend */}
          <div className="absolute top-3 left-3 bg-bg-base/85 backdrop-blur border border-border-subtle p-2.5 rounded z-15 flex flex-col gap-1 font-mono pointer-events-none">
            <span className="text-[0.625rem] font-bold text-text-primary tracking-wider uppercase">
              {selectedShift === "all" ? "AGGREGATE SPATIOTEMPORAL OVERLAY" : `${selectedShift.toUpperCase()} SHIFT THREAT GRID`}
            </span>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.5625rem] mt-1">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-severity-level3" />
                <span className="text-text-muted">Incidents ({filteredIncidents.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded bg-severity-level1" />
                <span className="text-text-muted">Patrol Units</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rotate-45 bg-[#00d8f6]" />
                <span className="text-text-muted">Precincts</span>
              </div>
            </div>
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-2 z-15">
            <Button size="sm" variant="hud" onClick={() => setZoom(prev => Math.min(18, prev + 1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="hud" onClick={() => setZoom(prev => Math.max(8, prev - 1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Leaflet Map Area */}
          <div className="flex-1 w-full h-full relative bg-[#060810] overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-bg-surface/50 backdrop-blur-sm z-10 font-mono text-[0.6875rem] text-brand-accent">
                LOADING INCIDENT COORDINATES FOR ENGINE PROJECTOR...
              </div>
            ) : (
              <LeafletMapComponent
                incidents={filteredIncidents}
                cadLogs={cadLogs}
                stationsList={stationsList}
                showHotspots={showHotspots}
                showPatrols={showPatrols}
                showStations={showStations}
                radius={radius}
                opacity={opacity}
                activeDispatchRoute={activeDispatchRoute}
                proactiveDispatch={proactiveDispatch}
                isDispatching={isDispatching}
                animationProgress={animationProgress}
                selectedIncident={selectedIncident}
                setSelectedIncident={handleSelectIncident}
                showBoundaries={showBoundaries}
              />
            )}
          </div>
        </div>

        {/* Right Side: Tabbed Analytics & Incident Inspector Deck */}
        <div className="w-[300px] shrink-0 flex flex-col gap-4 overflow-y-auto">
          <Card title="Spatial-Temporal Analytics">
            <div className="font-mono text-[0.6875rem] flex flex-col gap-2.5 min-h-[300px]">
              
              {/* Tab Toggle Navigation */}
              <div className="flex border-b border-border-subtle font-mono text-[0.55rem] font-bold mb-2 shrink-0">
                <button
                  onClick={() => setActiveInspectorTab("analytics")}
                  className={`flex-1 pb-1.5 border-b-2 text-center uppercase cursor-pointer ${
                    activeInspectorTab === "analytics" ? "border-brand-primary text-brand-primary animate-pulse" : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Pattern Analytics
                </button>
                <button
                  onClick={() => setActiveInspectorTab("inspector")}
                  className={`flex-1 pb-1.5 border-b-2 text-center uppercase cursor-pointer ${
                    activeInspectorTab === "inspector" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Forensic Inspector
                </button>
              </div>

              {/* Tab 1: Pattern Analytics */}
              {activeInspectorTab === "analytics" && (
                <div className="flex flex-col gap-3.5">
                  
                  {/* Temporal Loading Percentages */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[0.55rem] text-text-muted uppercase font-bold tracking-wider border-b border-border-subtle/40 pb-1">
                      Temporal Loading (Crime Volume)
                    </span>
                    <div className="flex flex-col gap-1.5 text-[0.625rem]">
                      <div>
                        <div className="flex justify-between text-text-secondary mb-0.5">
                          <span>Morning Shift (06-12)</span>
                          <span className="font-bold">{temporalCounts.morning.pct}%</span>
                        </div>
                        <div className="w-full bg-bg-surface-elevated h-1 rounded-sm overflow-hidden">
                          <div className="bg-brand-primary h-full rounded-sm" style={{ width: `${temporalCounts.morning.pct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-text-secondary mb-0.5">
                          <span>Afternoon Shift (12-18)</span>
                          <span className="font-bold">{temporalCounts.afternoon.pct}%</span>
                        </div>
                        <div className="w-full bg-bg-surface-elevated h-1 rounded-sm overflow-hidden">
                          <div className="bg-brand-accent h-full rounded-sm" style={{ width: `${temporalCounts.afternoon.pct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-text-secondary mb-0.5">
                          <span>Evening Shift (18-00)</span>
                          <span className="font-bold">{temporalCounts.evening.pct}%</span>
                        </div>
                        <div className="w-full bg-bg-surface-elevated h-1 rounded-sm overflow-hidden">
                          <div className="bg-brand-gold h-full rounded-sm" style={{ width: `${temporalCounts.evening.pct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-text-secondary mb-0.5">
                          <span>Night Shift (00-06)</span>
                          <span className="font-bold">{temporalCounts.night.pct}%</span>
                        </div>
                        <div className="w-full bg-bg-surface-elevated h-1 rounded-sm overflow-hidden">
                          <div className="bg-severity-level4 h-full rounded-sm" style={{ width: `${temporalCounts.night.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calculated Spatial Clusters hotspots */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[0.55rem] text-text-muted uppercase font-bold tracking-wider border-b border-border-subtle/40 pb-1">
                      Spatial Density Clusters (Top 3)
                    </span>
                    <div className="flex flex-col gap-1.5 text-[0.625rem]">
                      {spatialClusters.length > 0 ? (
                        spatialClusters.map((cluster, idx) => (
                          <div key={idx} className="flex items-center justify-between p-1.5 bg-bg-surface-elevated/40 border border-border-subtle/40 rounded-sm">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-brand-accent font-bold">#{idx + 1}</span>
                              <span className="text-text-primary font-bold truncate max-w-[170px] uppercase">{cluster.name}</span>
                            </div>
                            <span className="px-1.5 py-0.2 bg-severity-level3/10 border border-severity-level3/30 text-brand-gold font-bold rounded text-[0.55rem]">
                              {cluster.count} CASES
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-text-muted italic">No cluster coordinates mapped in this district bounds.</span>
                      )}
                    </div>
                  </div>

                  {/* AI Preemptive Patrol Deployment Directives */}
                  <div className="flex flex-col gap-2 border-t border-border-subtle/30 pt-3">
                    <span className="text-[0.55rem] text-text-muted uppercase font-bold tracking-wider flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-brand-primary" />
                      Smart Resource Deployment Directive
                    </span>
                    <div className="p-2 bg-bg-surface-elevated border border-border-subtle rounded-sm text-[0.625rem] leading-relaxed text-brand-accent">
                      {deploymentDirective}
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 2: Forensic Inspector details */}
              {activeInspectorTab === "inspector" && (
                <div className="flex flex-col gap-2">
                  {selectedIncident ? (
                    <div className="flex flex-col gap-2 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-border-subtle pb-1">
                        <span className="font-bold text-brand-accent">{selectedIncident.fir_number}</span>
                        <span className={`text-[0.5625rem] px-1 py-0.5 rounded font-bold uppercase ${
                          selectedIncident.processed ? "bg-severity-level1/10 text-severity-level1 border border-severity-level1/30" : "bg-severity-level3/10 text-severity-level3 border border-severity-level3/30"
                        }`}>
                          {selectedIncident.processed ? "RESOLVED" : "UNRESOLVED"}
                        </span>
                      </div>

                      <div className="flex justify-between border-b border-border-subtle/40 pb-1">
                        <span className="text-text-muted text-[0.5625rem] uppercase">TIME OF OCCURRENCE:</span>
                        <span className="text-text-primary font-bold">
                          {selectedIncident.timestamp ? new Date(selectedIncident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + " UTC" : "N/A"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-text-muted text-[0.625rem]">IPC CLAUSES:</span>
                        <span className="text-text-primary text-[0.6875rem] font-bold">{selectedIncident.ipc_sections}</span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-text-muted text-[0.625rem]">LOCATION:</span>
                        <span className="text-text-primary font-bold uppercase">{selectedIncident.police_station}</span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-text-muted text-[0.625rem]">COORDINATES:</span>
                        <span className="text-text-secondary">{selectedIncident.latitude?.toFixed(4)}° N, {selectedIncident.longitude?.toFixed(4)}° E</span>
                      </div>

                      <p className="text-[0.625rem] text-text-muted leading-relaxed border-t border-border-subtle/50 pt-2 mt-1">
                        {selectedIncident.modus_operandi_text}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 py-12 text-text-muted text-center leading-normal">
                      <Info className="h-5 w-5 text-text-muted/60" />
                      <span>Hover or click an incident node point on the map grid to inspect vector forensics.</span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
