"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import karnatakaGeoJSON from "@/utils/karnataka_districts.json";
import { useKsp } from "@/store/KspContext";

interface DistrictItem {
  districtName: string;
  clearanceRate: number;
  riskLevel: "High" | "Moderate" | "Low";
  riskStatus: "critical" | "warning" | "success" | "neutral";
  responseScore: number;
  incidentCount: number;
}

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

interface DistrictLeafletMapProps {
  mapView: "state" | "precinct";
  selectedDist: DistrictItem;
  setSelectedDist: (dist: DistrictItem) => void;
  hoveredDist: DistrictItem | null;
  setHoveredDist: (dist: DistrictItem | null) => void;
  selectedPrecinct: Precinct | null;
  setSelectedPrecinct: (precinct: Precinct | null) => void;
  hoveredPrecinct: Precinct | null;
  setHoveredPrecinct: (precinct: Precinct | null) => void;
  selectedCorridor: Corridor | null;
  setSelectedCorridor: (corridor: Corridor | null) => void;
  districtsList: DistrictItem[];
  corridors: Corridor[];
  precinctsList: Precinct[];
  getCaseDots: (precinct: Precinct) => Array<{ id: string; cx: number; cy: number; severity: string }>;
  leftSidebarCollapsed?: boolean;
  rightSidebarCollapsed?: boolean;
}

// GPS coordinates for the 30 districts of Karnataka (centroids)
const districtGPSCoords: Record<string, [number, number]> = {
  "Bagalkot": [16.1817, 75.6958],
  "Bengaluru City": [12.9716, 77.5946],
  "Bengaluru District": [13.2284, 77.5819],
  "Belagavi": [15.8497, 74.4977],
  "Ballari": [15.1394, 76.9214],
  "Bidar": [17.9104, 77.5199],
  "Vijayapura": [16.8302, 75.7100],
  "Chikkaballapura": [13.4326, 77.7275],
  "Chamarajnagar": [11.9261, 76.9402],
  "Yadgir": [16.7645, 77.1350],
  "Kalaburagi": [17.3297, 76.8343],
  "Raichur": [16.2120, 77.3556],
  "Koppal": [15.3468, 76.1555],
  "Gadag": [15.4313, 75.6424],
  "Dharwad": [15.4589, 75.0078],
  "Uttara Kannada": [14.7871, 74.7431],
  "Haveri": [14.7937, 75.3999],
  "Davanagere": [14.4644, 75.9218],
  "Shivamogga": [13.9299, 75.5681],
  "Udupi": [13.3409, 74.7421],
  "Chikkamagaluru": [13.3161, 75.7720],
  "Chitradurga": [14.2251, 76.4005],
  "Tumakuru": [13.3379, 77.1173],
  "Dakshina Kannada": [12.7844, 75.2530],
  "Hassan": [13.0072, 76.1026],
  "Mandya": [12.5218, 76.8951],
  "Mysuru": [12.2958, 76.6394],
  "Kodagu": [12.3375, 75.8069],
  "Ramanagara": [12.7150, 77.2813],
  "Kolar": [13.1367, 78.1292],
};

// Normalize district names to match Dist_Name keys in the GeoJSON boundary layers
const normalizeName = (name: string): string => {
  const mapping: Record<string, string> = {
    "Bengaluru City": "Bangalore",
    "Bengaluru District": "Bangalore Rural",
    "Belagavi": "Belgaum",
    "Ballari": "Bellary",
    "Vijayapura": "Bijapur",
    "Chamarajnagar": "Chamrajnagar",
    "Chikkamagaluru": "Chikmagalur",
    "Kalaburagi": "Gulbarga",
    "Mysuru": "Mysore",
    "Shivamogga": "Shimoga",
    "Tumakuru": "Tumkur",
  };
  return mapping[name] || name;
};

export default function DistrictLeafletMapComponent({
  mapView,
  selectedDist,
  setSelectedDist,
  hoveredDist,
  setHoveredDist,
  selectedPrecinct,
  setSelectedPrecinct,
  hoveredPrecinct,
  setHoveredPrecinct,
  selectedCorridor,
  setSelectedCorridor,
  districtsList,
  corridors,
  precinctsList,
  getCaseDots,
  leftSidebarCollapsed,
  rightSidebarCollapsed,
}: DistrictLeafletMapProps) {
  const { sidebarCollapsed } = useKsp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);

  // Projection logic: convert cx/cy layout mock coordinates to lat/lng relative to the selected district center
  const getPrecinctLatLng = (precinct: Precinct, center: [number, number]): [number, number] => {
    const latOffset = (precinct.cy - 220) * -0.0006; // flip Y coordinates for maps
    const lngOffset = (precinct.cx - 200) * 0.0006;
    return [center[0] + latOffset, center[1] + lngOffset];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map centered at Karnataka GPS
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([15.3173, 75.7139], 7);

    mapRef.current = map;

    // Add CartoDB Dark Matter tile layer for premium dark aesthetics
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
    }).addTo(map);

    // Zoom control in bottom right
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    // Feature group to manage all vector layers
    const layersGroup = L.featureGroup().addTo(map);
    layersGroupRef.current = layersGroup;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Invalidate map size when sidebars are collapsed or expanded to trigger canvas recalculation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 310); // Wait for width transitions (300ms) to complete
    return () => clearTimeout(timer);
  }, [leftSidebarCollapsed, rightSidebarCollapsed, sidebarCollapsed]);

  // Update map views, markers, overlays dynamically based on inputs
  useEffect(() => {
    const map = mapRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    // Clear previous elements
    layersGroup.clearLayers();

    if (mapView === "state") {
      // Set view center to entire Karnataka state
      map.setView([15.3173, 75.7139], 7);

      // 1. Draw District Boundary polygons using the downloaded GeoJSON dataset
      const geoJsonLayer = L.geoJSON(karnatakaGeoJSON as any, {
        style: (feature) => {
          const distName = feature?.properties?.Dist_Name || "";
          const matchingDist = districtsList.find(
            (d) => normalizeName(d.districtName).toLowerCase() === distName.toLowerCase()
          );

          const riskLevel = matchingDist?.riskLevel || "Low";
          const isSelected =
            selectedDist &&
            normalizeName(selectedDist.districtName).toLowerCase() === distName.toLowerCase();

          const riskColor = riskLevel === "High" ? "#ef4444" : riskLevel === "Moderate" ? "#f59e0b" : "#10b981";

          return {
            fillColor: riskColor,
            fillOpacity: isSelected ? 0.4 : 0.12,
            color: isSelected ? "#00d8f6" : "#2d3748",
            weight: isSelected ? 2.5 : 1,
            className: "leaflet-geojson-district",
          };
        },
        onEachFeature: (feature, layer) => {
          const distName = feature?.properties?.Dist_Name || "";
          const matchingDist = districtsList.find(
            (d) => normalizeName(d.districtName).toLowerCase() === distName.toLowerCase()
          );

          if (matchingDist) {
            const riskColor =
              matchingDist.riskLevel === "High"
                ? "#ef4444"
                : matchingDist.riskLevel === "Moderate"
                ? "#f59e0b"
                : "#10b981";

            layer.on({
              click: () => {
                setSelectedDist(matchingDist);
                setSelectedCorridor(null);
              },
              mouseover: (e) => {
                setHoveredDist(matchingDist);
                const target = e.target;
                target.setStyle({
                  fillOpacity: 0.45,
                  color: "#00d8f6",
                  weight: 2,
                });
              },
              mouseout: (e) => {
                setHoveredDist(null);
                const target = e.target;
                const isSelected =
                  selectedDist &&
                  normalizeName(selectedDist.districtName).toLowerCase() === distName.toLowerCase();

                target.setStyle({
                  fillOpacity: isSelected ? 0.4 : 0.12,
                  color: isSelected ? "#00d8f6" : "#2d3748",
                  weight: isSelected ? 2.5 : 1,
                });
              },
            });

            // Bind premium hover tooltip containing crime summaries
            layer.bindTooltip(
              `<div class="font-mono text-[10px] p-2 bg-[#090d16] border border-[#1f293d] text-white rounded">
                 <div class="font-bold border-b border-[#1f293d] pb-1 uppercase mb-1 tracking-wider text-[#00d8f6]">${matchingDist.districtName}</div>
                 <div class="flex justify-between gap-4 mb-0.5"><span>Risk Status:</span><span class="font-bold" style="color: ${riskColor}">${matchingDist.riskLevel}</span></div>
                 <div class="flex justify-between gap-4 mb-0.5"><span>Incidents Count:</span><span class="font-bold">${matchingDist.incidentCount}</span></div>
                 <div class="flex justify-between gap-4"><span>Clearance Quotient:</span><span class="font-bold text-emerald-400">${matchingDist.clearanceRate}%</span></div>
               </div>`,
              { sticky: true, direction: "top", opacity: 0.95 }
            );
          }
        },
      });

      geoJsonLayer.addTo(layersGroup);

      // 2. Draw suspect transit corridors between districts
      corridors.forEach((corr) => {
        const start = districtGPSCoords[corr.from];
        const end = districtGPSCoords[corr.to];
        if (!start || !end) return;

        const isSelected = selectedCorridor?.id === corr.id;

        // Overlay transparent thick line for easier click detection
        const interactionLine = L.polyline([start, end], {
          color: "transparent",
          weight: 12,
        });

        // Visible glowing dashed line representing movements
        const corridorLine = L.polyline([start, end], {
          color: isSelected ? "#00d8f6" : "#f59e0b",
          weight: isSelected ? 3.5 : 1.5,
          dashArray: isSelected ? "8, 5" : "5, 5",
          className: "leaflet-corridor-line",
        });

        const handleCorridorClick = () => {
          setSelectedCorridor(corr);
        };

        interactionLine.on("click", handleCorridorClick);
        corridorLine.on("click", handleCorridorClick);

        corridorLine.bindTooltip(
          `<div class="font-mono text-[9px] max-w-[200px] whitespace-normal bg-[#090d16] text-[#ffffff] p-1 border border-[#1f293d] rounded">
             <div class="font-bold text-[#f59e0b] mb-0.5">TRANSIT CORRIDOR</div>
             <div>${corr.details}</div>
           </div>`,
          { sticky: true, opacity: 0.95 }
        );

        interactionLine.addTo(layersGroup);
        corridorLine.addTo(layersGroup);
      });

      // 3. Draw District centroids with dynamic bubble sizes
      const maxCases = Math.max(...districtsList.map((d) => d.incidentCount), 1);

      districtsList.forEach((d) => {
        const coords = districtGPSCoords[d.districtName];
        if (!coords) return;

        const isSelected = selectedDist.districtName === d.districtName;
        const isHighRisk = d.riskLevel === "High";
        const isModerateRisk = d.riskLevel === "Moderate";

        const riskColor = isHighRisk ? "#ef4444" : isModerateRisk ? "#f59e0b" : "#10b981";
        const bubbleRadius = 5 + (d.incidentCount / maxCases) * 14;

        const circle = L.circleMarker(coords, {
          radius: bubbleRadius,
          fillColor: riskColor,
          fillOpacity: isSelected ? 0.9 : 0.65,
          color: isSelected ? "#ffffff" : "#0f172a",
          weight: isSelected ? 2 : 0.75,
        });

        // Add pulsing animations to high risk nodes or current selection
        if (isSelected || isHighRisk) {
          const outerRing = L.circleMarker(coords, {
            radius: bubbleRadius + 4,
            fillColor: "transparent",
            color: riskColor,
            weight: 1.2,
            className: isSelected ? "animate-ping" : "animate-pulse",
          });
          outerRing.addTo(layersGroup);
        }

        circle.on("click", () => {
          setSelectedDist(d);
          setSelectedCorridor(null);
        });

        circle.on("mouseover", () => {
          setHoveredDist(d);
        });

        circle.on("mouseout", () => {
          setHoveredDist(null);
        });

        circle.bindTooltip(
          `<div class="font-mono text-[10px] p-2 bg-[#090d16] border border-[#1f293d] text-white rounded">
             <div class="font-bold border-b border-[#1f293d] pb-1 uppercase mb-1 tracking-wider text-[#00d8f6]">${d.districtName}</div>
             <div class="flex justify-between gap-4 mb-0.5"><span>Risk Status:</span><span class="font-bold" style="color: ${riskColor}">${d.riskLevel}</span></div>
             <div class="flex justify-between gap-4 mb-0.5"><span>Incidents Count:</span><span class="font-bold">${d.incidentCount}</span></div>
             <div class="flex justify-between gap-4"><span>Clearance Quotient:</span><span class="font-bold text-emerald-400">${d.clearanceRate}%</span></div>
           </div>`,
          { sticky: true, direction: "top", opacity: 0.95 }
        );

        circle.addTo(layersGroup);
      });
    } else {
      // 4. Drill-down Precinct Mode
      const center = districtGPSCoords[selectedDist.districtName] || [12.9716, 77.5946];

      // Pan to selected district center at high zoom
      map.setView(center, 12);

      // Draw local Precincts and case dots
      precinctsList.forEach((precinct) => {
        const precinctCoords = getPrecinctLatLng(precinct, center);
        const isSelected = selectedPrecinct?.name === precinct.name;

        // Custom HTML DivIcon to render building SVG node
        const customIcon = L.divIcon({
          className: "custom-precinct-icon-container",
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer select-none">
              ${
                isSelected
                  ? `<div class="absolute w-8 h-8 rounded-full border border-[#00d8f6] animate-ping opacity-60"></div>
                     <div class="absolute w-6 h-6 rounded-full border border-dashed border-[#00d8f6] animate-[spin_6s_linear_infinite]"></div>`
                  : ""
              }
              <div class="w-5 h-5 rounded-full bg-[#090f1e] border-2 ${
                isSelected ? "border-[#00d8f6]" : "border-[#475569]"
              } flex items-center justify-center shadow-lg transition-all">
                <svg viewBox="0 0 24 24" width="10" height="10" stroke="${
                  isSelected ? "#00d8f6" : "#94a3b8"
                }" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(precinctCoords, { icon: customIcon });

        marker.on("click", () => {
          setSelectedPrecinct(precinct);
        });

        marker.on("mouseover", () => {
          setHoveredPrecinct(precinct);
        });

        marker.on("mouseout", () => {
          setHoveredPrecinct(null);
        });

        marker.bindTooltip(
          `<div class="font-mono text-[10px] p-2 bg-[#090d16] border border-[#1f293d] text-white rounded">
             <div class="font-bold border-b border-[#1f293d] pb-1 uppercase mb-1 tracking-wider text-[#00d8f6]">${precinct.name}</div>
             <div class="flex justify-between gap-4 mb-0.5"><span>Active Caseloads:</span><span class="font-bold">${precinct.cases}</span></div>
             <div class="flex justify-between gap-4 mb-0.5"><span>On-duty Staff:</span><span class="font-bold">${precinct.staff}</span></div>
             <div class="flex justify-between gap-4 mb-0.5"><span>Fleet Vehicles:</span><span class="font-bold">${precinct.vehicles}</span></div>
             <div class="flex justify-between gap-4"><span>Clearance Quotient:</span><span class="font-bold text-emerald-400">${precinct.clearance}%</span></div>
           </div>`,
          { sticky: true, direction: "top", opacity: 0.95 }
        );

        marker.addTo(layersGroup);

        // Draw local Case Dots surrounding the precinct
        const dots = getCaseDots(precinct);
        dots.forEach((dot) => {
          // Project dot cx/cy relative to precinct coordinate
          const dotLatOffset = (dot.cy - precinct.cy) * -0.0005;
          const dotLngOffset = (dot.cx - precinct.cx) * 0.0005;
          const dotCoords: [number, number] = [
            precinctCoords[0] + dotLatOffset,
            precinctCoords[1] + dotLngOffset,
          ];

          const dotColor =
            dot.severity === "High" ? "#ef4444" : dot.severity === "Moderate" ? "#f59e0b" : "#10b981";

          const caseMarker = L.circleMarker(dotCoords, {
            radius: 3.5,
            fillColor: dotColor,
            fillOpacity: 0.8,
            color: "#ffffff",
            weight: 0.5,
            className: "animate-pulse",
          });

          caseMarker.bindTooltip(
            `<div class="font-mono text-[8px] bg-[#090d16] border border-[#1f293d] text-white px-1.5 py-0.5 rounded">
               <span class="font-bold text-[#ef4444]">INCIDENT CLUSTER</span> (${dot.severity} Severity)
             </div>`,
            { sticky: true }
          );

          caseMarker.addTo(layersGroup);
        });
      });
    }
  }, [
    mapView,
    selectedDist,
    setSelectedDist,
    hoveredDist,
    setHoveredDist,
    selectedPrecinct,
    setSelectedPrecinct,
    hoveredPrecinct,
    setHoveredPrecinct,
    selectedCorridor,
    setSelectedCorridor,
    districtsList,
    corridors,
    precinctsList,
    getCaseDots,
  ]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* CSS styling for dash animations on corridors */}
      <style jsx global>{`
        @keyframes leaflet-dash-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        .leaflet-corridor-line {
          animation: leaflet-dash-flow 1.5s linear infinite;
        }
        .leaflet-geojson-district {
          transition: fill-opacity 0.2s ease, stroke-width 0.2s ease;
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full bg-[#060810]" />
    </div>
  );
}
