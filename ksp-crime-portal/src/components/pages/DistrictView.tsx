"use client";

import React, { useState, useMemo } from "react";
import { useKsp } from "@/store/KspContext";
import { districtsList, DistrictItem, suspectsList, casesList } from "@/utils/mockData";
import { districtReferenceData } from "@/utils/districtReferenceData";
import karnatakaData from '@/utils/karnataka_crime_data.json';
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Search, Compass, Route, Map, Building2, ShieldCheck, Activity, Users, Car, Award, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

import dynamic from "next/dynamic";

const DistrictLeafletMapComponent = dynamic(
  () => import("@/components/ui/DistrictLeafletMapComponent"),
  { ssr: false }
);

// Key SVG coordinates mapping for Karnataka districts layout grid (size 400 x 600)
const districtCoords: Record<string, { cx: number; cy: number }> = {
  "Bagalkot": { cx: 190, cy: 130 },
  "Bengaluru City": { cx: 280, cy: 470 },
  "Bengaluru District": { cx: 310, cy: 490 },
  "Belagavi": { cx: 100, cy: 140 },
  "Ballari": { cx: 260, cy: 240 },
  "Bidar": { cx: 350, cy: 40 },
  "Vijayapura": { cx: 220, cy: 80 },
  "Chikkaballapura": { cx: 320, cy: 430 },
  "Chamarajnagar": { cx: 240, cy: 570 },
  "Yadgir": { cx: 310, cy: 140 },
  "Kalaburagi": { cx: 320, cy: 90 },
  "Raichur": { cx: 330, cy: 190 },
  "Koppal": { cx: 240, cy: 200 },
  "Gadag": { cx: 170, cy: 190 },
  "Dharwad": { cx: 130, cy: 200 },
  "Uttara Kannada": { cx: 80, cy: 260 },
  "Haveri": { cx: 160, cy: 260 },
  "Davanagere": { cx: 200, cy: 300 },
  "Shivamogga": { cx: 140, cy: 350 },
  "Udupi": { cx: 80, cy: 380 },
  "Chikkamagaluru": { cx: 140, cy: 400 },
  "Chitradurga": { cx: 220, cy: 340 },
  "Tumakuru": { cx: 260, cy: 410 },
  "Dakshina Kannada": { cx: 90, cy: 450 },
  "Hassan": { cx: 160, cy: 460 },
  "Mandya": { cx: 220, cy: 500 },
  "Mysuru": { cx: 180, cy: 530 },
  "Kodagu": { cx: 120, cy: 510 },
  "Ramanagara": { cx: 260, cy: 500 },
  "Kolar": { cx: 350, cy: 460 },
};

interface Precinct {
  name: string;
  cx: number;
  cy: number;
  cases: number;
  staff: number;
  vehicles: number;
  clearance: number;
}

interface Corridor {
  id: string;
  from: string;
  to: string;
  suspectName: string;
  details: string;
}

export const DistrictView = () => {
  const { logActivity } = useKsp();
  const [search, setSearch] = useState("");
  const [selectedDist, setSelectedDist] = useState<DistrictItem>(
    districtsList.find(d => d.districtName !== "State Total") || districtsList[0]
  );
  const [hoveredDist, setHoveredDist] = useState<DistrictItem | null>(null);
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor | null>(null);
  const [activeSummaryTab, setActiveSummaryTab] = useState<"metrics" | "profile">("metrics");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  
  // Drill-down Map States
  const [mapView, setMapView] = useState<"state" | "precinct">("state");
  const [selectedPrecinct, setSelectedPrecinct] = useState<Precinct | null>(null);
  const [hoveredPrecinct, setHoveredPrecinct] = useState<Precinct | null>(null);

  // Logging wrappers
  const handleSelectDistrict = (dist: DistrictItem) => {
    logActivity(`Selected district Explorer: ${dist.districtName}`);
    setSelectedDist(dist);
  };

  const handleSelectCorridor = (corr: Corridor | null) => {
    if (corr) {
      logActivity(`Inspected suspect transit corridor: ${corr.from} -> ${corr.to} (${corr.suspectName})`);
    }
    setSelectedCorridor(corr);
  };

  const handleSetMapView = (view: "state" | "precinct") => {
    logActivity(`Switched district map zoom view to: ${view.toUpperCase()}`);
    setMapView(view);
  };

  const handleSelectPrecinct = (precinct: Precinct | null) => {
    if (precinct) {
      logActivity(`Drilled down to precinct details: ${precinct.name}`);
    }
    setSelectedPrecinct(precinct);
  };

  const filteredDistricts = useMemo(() => {
    return districtsList.filter(d =>
      d.districtName !== "State Total" &&
      d.districtName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // Compute live Suspect corridors based on active caseloads across multiple districts
  const corridors = useMemo<Corridor[]>(() => {
    const list: Corridor[] = [];
    
    suspectsList.forEach(sus => {
      const districts = new Set<string>();
      
      sus.cases.forEach(caseId => {
        const c = casesList.find(item => item.id === caseId);
        if (c && c.district) {
          districts.add(c.district);
        }
      });

      const distArray = Array.from(districts);
      if (distArray.length > 1) {
        for (let i = 0; i < distArray.length; i++) {
          for (let j = i + 1; j < distArray.length; j++) {
            list.push({
              id: `${sus.bookingId}-${distArray[i]}-${distArray[j]}`,
              from: distArray[i],
              to: distArray[j],
              suspectName: sus.name,
              details: `Suspect ${sus.name} (Alias: ${sus.alias}) is linked to active files in both the ${distArray[i]} and ${distArray[j]} jurisdictions. Threat vectors indicate transit crime operations.`
            });
          }
        }
      }
    });

    return list;
  }, []);

  // Compute dynamic radar chart data matching database statistics
  const radarData = useMemo(() => {
    const activeName = selectedDist.districtName;
    const selectedRecord = karnatakaData.find((d: any) => d.District === activeName) || karnatakaData[0];
    
    const categories = ["Murder", "Rape", "Robbery", "Theft", "Cheating"];
    const averages = categories.reduce((acc, cat) => {
      const sum = karnatakaData.reduce((s, r: any) => s + parseInt(r[cat] || "0", 10), 0);
      acc[cat] = Math.round(sum / karnatakaData.length);
      return acc;
    }, {} as Record<string, number>);

    return categories.map(cat => ({
      subject: cat,
      A: parseInt((selectedRecord as any)[cat] || "0", 10),
      B: averages[cat]
    }));
  }, [selectedDist]);

  // Compute precinct list for selected district
  const precinctsList = useMemo<Precinct[]>(() => {
    const districtName = selectedDist.districtName;
    if (districtName === "Bengaluru City") {
      return [
        { name: "Indiranagar PS", cx: 120, cy: 150, cases: 48, staff: 35, vehicles: 6, clearance: 76 },
        { name: "Whitefield PS", cx: 280, cy: 180, cases: 38, staff: 28, vehicles: 5, clearance: 72 },
        { name: "Jayanagar PS", cx: 150, cy: 320, cases: 29, staff: 22, vehicles: 4, clearance: 80 },
        { name: "Malleshwaram PS", cx: 90, cy: 220, cases: 18, staff: 18, vehicles: 3, clearance: 84 },
        { name: "Halasuru PS", cx: 220, cy: 250, cases: 31, staff: 25, vehicles: 5, clearance: 74 }
      ];
    }
    // Determinisitc mock values mapped to ensure stable positioning
    return [
      { name: `${districtName} Central PS`, cx: 200, cy: 220, cases: 35, staff: 24, vehicles: 4, clearance: 78 },
      { name: `${districtName} North PS`, cx: 140, cy: 120, cases: 21, staff: 14, vehicles: 2, clearance: 68 },
      { name: `${districtName} South PS`, cx: 260, cy: 320, cases: 18, staff: 16, vehicles: 3, clearance: 73 },
      { name: `${districtName} East PS`, cx: 280, cy: 150, cases: 26, staff: 20, vehicles: 3, clearance: 70 }
    ];
  }, [selectedDist]);

  // Compute deterministic case dots around each precinct
  const getCaseDots = (precinct: Precinct) => {
    const seed = precinct.name.charCodeAt(0) + precinct.cx;
    const offsets = [
      { severity: "High" },
      { severity: "Moderate" },
      { severity: "Low" }
    ];
    // Show 1 to 3 dots based on cases count
    const numDots = Math.min(3, Math.max(1, Math.round(precinct.cases / 10)));
    
    return offsets.slice(0, numDots).map((offset, i) => {
      const angle = (seed + i * 120) * (Math.PI / 180);
      const r = 24 + (i * 6);
      return {
        id: `${precinct.name}-case-${i}`,
        cx: precinct.cx + Math.round(Math.cos(angle) * r),
        cy: precinct.cy + Math.round(Math.sin(angle) * r),
        severity: offset.severity
      };
    });
  };

  const maxCases = useMemo(() => {
    return Math.max(...districtsList.map(d => d.incidentCount), 1);
  }, []);

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1 select-none">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            GEOSPATIAL RELATIONAL EXPLORER
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Visualize district boundaries, IPC density indicators, and specific police station precinct drill-downs.
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* Left Side Directory List */}
        <div
          className={`shrink-0 flex flex-col gap-3 min-h-0 transition-all duration-300 ${
            leftSidebarCollapsed ? "w-0 overflow-hidden opacity-0 pointer-events-none" : "w-[280px]"
          }`}
        >
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
                  onClick={() => {
                    handleSelectDistrict(d);
                    handleSelectCorridor(null);
                    handleSelectPrecinct(null);
                  }}
                  className={`p-3 flex flex-col gap-1 cursor-pointer transition-colors duration-100 ${
                    isSelected ? "bg-bg-surface-elevated" : "hover:bg-bg-surface-elevated/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] font-mono font-bold text-text-primary uppercase">
                      {d.districtName}
                    </span>
                    <span
                      className={`text-[0.5rem] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm ${
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

                  <div className="flex items-center justify-between text-[0.625rem] text-text-secondary font-mono">
                    <span>Clearance Quotient:</span>
                    <span className="font-bold text-text-accent">{d.clearanceRate}%</span>
                  </div>
                </div>
              );
            })}

            {filteredDistricts.length === 0 && (
              <div className="p-8 text-center text-text-muted font-mono text-[0.625rem]">
                NO DISTRICTS FOUND MATCHING QUERY.
              </div>
            )}
          </div>
        </div>

        {/* Center Spatial Map Visualization */}
        <div className="flex-1 border border-border-subtle rounded-md bg-[#060810] relative flex flex-col justify-between overflow-hidden">
          
          {/* Left Sidebar Collapse Toggle Button */}
          <button
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-[1000] w-5 h-12 bg-bg-base/95 border border-border-subtle hover:border-[#00d8f6] text-text-muted hover:text-text-primary rounded flex items-center justify-center cursor-pointer shadow-lg transition-all"
            title={leftSidebarCollapsed ? "Expand Left Directory" : "Collapse Left Directory"}
          >
            {leftSidebarCollapsed ? <ChevronRight className="h-4 w-4 text-[#00d8f6]" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Right Sidebar Collapse Toggle Button */}
          <button
            onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-[1000] w-5 h-12 bg-bg-base/95 border border-border-subtle hover:border-[#00d8f6] text-text-muted hover:text-text-primary rounded flex items-center justify-center cursor-pointer shadow-lg transition-all"
            title={rightSidebarCollapsed ? "Expand Right Dashboard" : "Collapse Right Dashboard"}
          >
            {rightSidebarCollapsed ? <ChevronLeft className="h-4 w-4 text-[#00d8f6]" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {/* Map Header / Toolbar (above the map) */}
          <div className="flex items-center justify-between p-3 border-b border-border-subtle bg-bg-surface-elevated/30 z-10 shrink-0 select-none">
            <div className="flex flex-col gap-0.5 font-mono text-[0.6875rem]">
              <span className="font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                {mapView === "state" ? "KARNATAKA JURISDICTION SPATIAL HUB" : `${selectedDist.districtName.toUpperCase()} PRECINCT MAP`}
              </span>
              <span className="text-text-secondary text-[0.625rem]">
                {mapView === "state" ? "Proportional Bubble size matches active FIR caseload counts" : "Local police stations & incident cluster pings"}
              </span>
            </div>

            {/* Map View Toggle Controls */}
            <div className="flex items-center gap-1.5 font-mono">
              <button
                onClick={() => {
                  handleSetMapView("state");
                  handleSelectPrecinct(null);
                }}
                className={`px-2.5 py-1 rounded text-[0.625rem] uppercase font-bold cursor-pointer border transition-all duration-150 ${
                  mapView === "state"
                    ? "bg-brand-primary text-text-primary border-brand-primary shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                    : "bg-bg-base/90 text-text-muted border-border-subtle hover:text-text-primary"
                }`}
              >
                State View
              </button>
              <button
                onClick={() => handleSetMapView("precinct")}
                className={`px-2.5 py-1 rounded text-[0.625rem] uppercase font-bold cursor-pointer border transition-all duration-150 ${
                  mapView === "precinct"
                    ? "bg-brand-primary text-text-primary border-brand-primary shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                    : "bg-bg-base/90 text-text-muted border-border-subtle hover:text-text-primary"
                }`}
              >
                Precinct Drill-down
              </button>
            </div>
          </div>

          <div className="absolute bottom-3 right-3 bg-bg-base/80 border border-border-subtle p-2 rounded z-10 font-mono text-[0.5625rem] text-text-secondary select-none pointer-events-none">
            {mapView === "state" 
              ? "Hover district nodes / click corridors to inspect relational storylines."
              : "Click station icons to inspect local precinct metrics."
            }
          </div>

          {/* SVG Map Canvas */}
          <div className="flex-1 relative w-full h-full min-h-[400px]">
            <DistrictLeafletMapComponent
              mapView={mapView}
              selectedDist={selectedDist}
              setSelectedDist={handleSelectDistrict}
              hoveredDist={hoveredDist}
              setHoveredDist={setHoveredDist}
              selectedPrecinct={selectedPrecinct}
              setSelectedPrecinct={handleSelectPrecinct}
              hoveredPrecinct={hoveredPrecinct}
              setHoveredPrecinct={setHoveredPrecinct}
              selectedCorridor={selectedCorridor}
              setSelectedCorridor={handleSelectCorridor}
              districtsList={districtsList}
              corridors={corridors}
              precinctsList={precinctsList}
              getCaseDots={getCaseDots}
              leftSidebarCollapsed={leftSidebarCollapsed}
              rightSidebarCollapsed={rightSidebarCollapsed}
            />
          </div>
        </div>

        {/* Right Side Visual Performance Details & Storyboard */}
        <div
          className={`shrink-0 flex flex-col gap-4 min-h-0 select-none overflow-y-auto transition-all duration-300 ${
            rightSidebarCollapsed ? "w-0 overflow-hidden opacity-0 pointer-events-none" : "w-[340px]"
          }`}
        >
          
          {/* Active summary */}
          <Card
            title={`${selectedDist.districtName.toUpperCase()} SUMMARY`}
            borderAccent={selectedDist.riskLevel === "High" ? "critical" : "left"}
          >
            {/* Tab Swapping Header */}
            <div className="flex border-b border-border-subtle/50 mb-3 text-[0.625rem] font-mono">
              <button
                onClick={() => setActiveSummaryTab("metrics")}
                className={`flex-1 pb-1.5 font-bold uppercase transition-colors text-center ${
                  activeSummaryTab === "metrics"
                    ? "text-[#00d8f6] border-b border-[#00d8f6]"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Metrics
              </button>
              <button
                onClick={() => setActiveSummaryTab("profile")}
                className={`flex-1 pb-1.5 font-bold uppercase transition-colors text-center ${
                  activeSummaryTab === "profile"
                    ? "text-[#00d8f6] border-b border-[#00d8f6]"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Official Dossier
              </button>
            </div>

            {activeSummaryTab === "metrics" ? (
              <>
                <div className="grid grid-cols-2 gap-2.5 font-mono text-[0.6875rem] mb-3">
                  <div className="bg-bg-surface-elevated/40 p-2.5 rounded-sm border border-border-subtle flex flex-col gap-0.5">
                    <span className="text-text-muted text-[0.5625rem] uppercase">active cases</span>
                    <span className="text-base font-bold text-text-primary">{selectedDist.incidentCount} FIRs</span>
                  </div>
                  <div className="bg-bg-surface-elevated/40 p-2.5 rounded-sm border border-border-subtle flex flex-col gap-0.5">
                    <span className="text-text-muted text-[0.5625rem] uppercase">solve rating</span>
                    <span className="text-base font-bold text-severity-level1">{selectedDist.clearanceRate}%</span>
                  </div>
                </div>

                {/* Radar Charts Grid */}
                <div className="border border-border-subtle rounded-md bg-bg-surface-elevated/10 p-3 flex flex-col items-center">
                  <span className="font-mono text-[0.625rem] font-bold text-text-secondary uppercase self-start mb-2">
                    Relative Offense Profiling
                  </span>
                  <div className="w-full h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#1f293d" />
                        <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 8, fontFamily: "monospace" }} />
                        <PolarRadiusAxis stroke="#1f293d" angle={30} tick={false} />
                        <Radar name={selectedDist.districtName} dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
                        <Radar name="State Avg" dataKey="B" stroke="#00d8f6" fill="#00d8f6" fillOpacity={0.08} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="font-mono text-[0.625rem] flex flex-col gap-2 text-text-secondary leading-normal">
                <div className="flex justify-between border-b border-border-subtle/30 pb-1">
                  <span className="text-text-muted uppercase">Region:</span>
                  <span className="font-bold text-text-primary uppercase">
                    {districtReferenceData[selectedDist.districtName]?.region || "Karnataka State"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border-subtle/30 pb-1">
                  <span className="text-text-muted uppercase">Headquarters:</span>
                  <span className="font-bold text-text-primary">
                    {districtReferenceData[selectedDist.districtName]?.headquarters || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border-subtle/30 pb-1">
                  <span className="text-text-muted uppercase">Division:</span>
                  <span className="font-bold text-text-primary">
                    {districtReferenceData[selectedDist.districtName]?.division || "N/A"}
                  </span>
                </div>
                {districtReferenceData[selectedDist.districtName]?.portal && (
                  <div className="flex justify-between border-b border-border-subtle/30 pb-1">
                    <span className="text-text-muted uppercase">Official Portal:</span>
                    <a
                      href={districtReferenceData[selectedDist.districtName].portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#00d8f6] hover:underline"
                    >
                      Visit Official Site
                    </a>
                  </div>
                )}
                <div className="mt-2 bg-bg-surface-elevated/40 p-2.5 rounded border border-border-subtle/50">
                  <span className="text-text-muted uppercase text-[0.5625rem] block mb-1">Administrative Briefing:</span>
                  <p className="text-text-primary text-[0.625rem] leading-relaxed">
                    {districtReferenceData[selectedDist.districtName]?.info || "Official police district information catalogued in KSP repository."}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Drill-down Precinct Operational Diagnostics Card */}
          {mapView === "precinct" && (
            <Card title="Precinct Operational Desk" borderAccent="left">
              <div className="font-mono text-[0.6875rem] flex flex-col gap-3 min-h-[140px]">
                {selectedPrecinct ? (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-1.5 text-[#00d8f6] border-b border-border-subtle pb-1">
                      <Building2 className="h-4.5 w-4.5 text-[#00d8f6] shrink-0" />
                      <span className="font-bold text-[0.75rem] uppercase">{selectedPrecinct.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[0.625rem] mt-1">
                      <div className="flex items-center gap-1.5 bg-bg-surface-elevated/30 p-1.5 rounded border border-border-subtle/50">
                        <Activity className="h-3.5 w-3.5 text-severity-level3 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-text-muted text-[0.5rem] uppercase">Caseload</span>
                          <span className="font-bold text-text-primary text-[0.6875rem]">{selectedPrecinct.cases} FIRs</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-bg-surface-elevated/30 p-1.5 rounded border border-border-subtle/50">
                        <Users className="h-3.5 w-3.5 text-text-accent shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-text-muted text-[0.5rem] uppercase">Staffing</span>
                          <span className="font-bold text-text-primary text-[0.6875rem]">{selectedPrecinct.staff} Officers</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-bg-surface-elevated/30 p-1.5 rounded border border-border-subtle/50">
                        <Car className="h-3.5 w-3.5 text-severity-level1 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-text-muted text-[0.5rem] uppercase">Patrols</span>
                          <span className="font-bold text-text-primary text-[0.6875rem]">{selectedPrecinct.vehicles} Active</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-bg-surface-elevated/30 p-1.5 rounded border border-border-subtle/50">
                        <Award className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-text-muted text-[0.5rem] uppercase">Solved</span>
                          <span className="font-bold text-text-primary text-[0.6875rem]">{selectedPrecinct.clearance}% Rate</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-text-muted leading-normal">
                    <Building2 className="h-6 w-6 text-text-muted/50" />
                    <span>Select a police station node from the precinct map grid to load live diagnostic statistics.</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Relational Storyboard Section */}
          <Card title="Relational Corridor Storyteller">
            <div className="font-mono text-[0.6875rem] flex flex-col gap-2 min-h-[140px]">
              {selectedCorridor ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-brand-gold border-b border-border-subtle pb-1">
                    <Route className="h-4 w-4 text-brand-gold shrink-0" />
                    <span className="font-bold">TRANSIT CRIME CORRIDOR IDENTIFIED</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[0.625rem]">
                    <span className="text-text-muted">TRANSIT AXIS:</span>
                    <span className="font-bold text-text-primary uppercase">{selectedCorridor.from} ⟷ {selectedCorridor.to}</span>
                  </div>

                  <div className="flex items-center justify-between text-[0.625rem]">
                    <span className="text-text-muted">LINKED SUSPECT:</span>
                    <span className="font-bold text-severity-level3">{selectedCorridor.suspectName}</span>
                  </div>

                  <p className="text-[0.625rem] text-text-muted leading-relaxed border-t border-border-subtle/50 pt-2 mt-1 whitespace-pre-line">
                    {selectedCorridor.details}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-text-muted leading-normal">
                  <Compass className="h-6 w-6 text-text-muted/50" />
                  <span>Click any orange dashed line (corridor line) connecting districts to read relational intelligence storyboards.</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
