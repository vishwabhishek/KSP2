"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useKsp } from "@/store/KspContext";
import karnatakaGeoJSON from "@/utils/karnataka_districts.json";

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

interface PatrolLog {
  id: string;
  timestamp: string;
  unitId: string;
  location: string;
  eventStatus: string;
  latitude: number;
  longitude: number;
}

interface StationItem {
  name: string;
  lat: number;
  lng: number;
}

interface LeafletMapProps {
  incidents: DBIncident[];
  cadLogs: PatrolLog[];
  stationsList: StationItem[];
  showHotspots: boolean;
  showPatrols: boolean;
  showStations: boolean;
  radius: number;
  opacity: number;
  activeDispatchRoute: boolean;
  proactiveDispatch: {
    unit: PatrolLog;
    hotspot: DBIncident;
    lat: number;
    lng: number;
  } | null;
  isDispatching: boolean;
  animationProgress: number;
  selectedIncident: DBIncident | null;
  setSelectedIncident: (inc: DBIncident | null) => void;
  showBoundaries?: boolean;
}

export default function LeafletMapComponent({
  incidents,
  cadLogs,
  stationsList,
  showHotspots,
  showPatrols,
  showStations,
  radius,
  opacity,
  activeDispatchRoute,
  proactiveDispatch,
  isDispatching,
  animationProgress,
  selectedIncident,
  setSelectedIncident,
  showBoundaries = true,
}: LeafletMapProps) {
  const { sidebarCollapsed, selectedDistrict } = useKsp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map Instance centering around Bangalore City
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 12,
      zoomControl: false,
    });
    mapRef.current = map;

    // Zoom control at the top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Premium dark thematic base map tiles from CartoDB
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
    }).addTo(map);

    // Group layer for plotting dynamic markers
    const group = L.layerGroup().addTo(map);
    markersRef.current = group;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Invalidate map size when the main sidebar is collapsed or expanded
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 310); // Wait for width transitions (300ms) to complete
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  // Sync / Auto-Center when incident collection bounds change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || incidents.length === 0) return;

    const coords = incidents
      .filter((inc) => inc.latitude !== null && inc.longitude !== null)
      .map((inc) => [inc.latitude!, inc.longitude!] as [number, number]);

    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 13 });
    }
  }, [incidents]);

  // Paint Map Overlays
  useEffect(() => {
    const map = mapRef.current;
    const group = markersRef.current;
    if (!map || !group) return;

    // Clear previous layer groups
    group.clearLayers();

    // 0. Draw District Boundary polygons using the downloaded GeoJSON dataset if showBoundaries is active
    if (showBoundaries) {
      const geoJsonLayer = L.geoJSON(karnatakaGeoJSON as any, {
        style: (feature) => {
          const distName = feature?.properties?.Dist_Name || "";
          const isSelected =
            selectedDistrict &&
            (normalizeName(selectedDistrict).toLowerCase() === distName.toLowerCase() ||
             selectedDistrict.toLowerCase().includes(distName.toLowerCase()) ||
             distName.toLowerCase().includes(selectedDistrict.toLowerCase()));

          return {
            fillColor: isSelected ? "#00d8f6" : "#1e293b",
            fillOpacity: isSelected ? 0.25 : 0.05,
            color: isSelected ? "#00d8f6" : "#334155",
            weight: isSelected ? 2.5 : 1,
            className: "leaflet-geojson-district",
          };
        },
        onEachFeature: (feature, layer) => {
          const distName = feature?.properties?.Dist_Name || "";
          layer.bindTooltip(
            `<div class="font-mono text-[9px] bg-[#090d16] text-[#ffffff] p-1 border border-[#1f293d] rounded">
               <span class="font-bold text-[#00d8f6]">${distName.toUpperCase()} DISTRICT</span>
             </div>`,
            { sticky: true, opacity: 0.95 }
          );
        },
      });
      geoJsonLayer.addTo(group);
    }

    // 1. Station Precinct Marker Icons
    if (showStations) {
      stationsList.forEach((station) => {
        const stationIcon = L.divIcon({
          className: "leaflet-custom-station",
          html: `<div style="background-color: #0c192c; border: 2px solid #00d8f6; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(0,216,246,0.5);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d8f6" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([station.lat, station.lng], { icon: stationIcon });
        marker.bindTooltip(station.name, {
          direction: "top",
          className: "leaflet-ps-tooltip",
          permanent: false,
        });
        marker.addTo(group);
      });
    }

    // 2. Incident Pins and Spatiotemporal Overlapping Heat Circles
    if (showHotspots) {
      incidents.forEach((inc) => {
        if (inc.latitude === null || inc.longitude === null) return;

        // Overlay transparent circle for heatmap effect
        L.circle([inc.latitude, inc.longitude], {
          radius: radius * 12, // scaled radius in meters
          fillColor: inc.processed ? "#f97316" : "#ef4444",
          fillOpacity: opacity * 0.15,
          stroke: false,
        }).addTo(group);

        const isSelected = selectedIncident?.id === inc.id;
        const pinIcon = L.divIcon({
          className: "leaflet-custom-pin",
          html: `<div style="background-color: ${isSelected ? "#ffffff" : inc.processed ? "#f97316" : "#ef4444"}; border: 2.5px solid ${inc.processed ? "#f97316" : "#ef4444"}; border-radius: 50%; width: ${isSelected ? "14px" : "9px"}; height: ${isSelected ? "14px" : "9px"}; box-shadow: 0 0 8px #ef4444; transition: all 0.1s ease-in-out;"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([inc.latitude, inc.longitude], { icon: pinIcon });
        marker.on("click", () => setSelectedIncident(inc));
        marker.on("mouseover", () => setSelectedIncident(inc));
        marker.addTo(group);
      });
    }

    // 3. Active CAD Patrol Fleet Vehicle Markers
    if (showPatrols) {
      cadLogs.forEach((patrol) => {
        const isAdvised = proactiveDispatch && proactiveDispatch.unit.unitId === patrol.unitId;
        let lat = patrol.latitude;
        let lng = patrol.longitude;

        // Animate coordinates along transit vector if dispatch is triggered
        if (isAdvised && isDispatching && proactiveDispatch) {
          const startLat = patrol.latitude;
          const startLng = patrol.longitude;
          const endLat = proactiveDispatch.lat;
          const endLng = proactiveDispatch.lng;

          lat = startLat + (endLat - startLat) * animationProgress;
          lng = startLng + (endLng - startLng) * animationProgress;
        }

        const patrolIcon = L.divIcon({
          className: "leaflet-custom-patrol",
          html: `<div style="background-color: ${isAdvised ? "#fbbf24" : "#10b981"}; border: 1.5px solid #ffffff; border-radius: 4px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${isAdvised ? "#fbbf24" : "#10b981"};"><svg width="10" height="10" viewBox="0 0 24 24" fill="#ffffff"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const marker = L.marker([lat, lng], { icon: patrolIcon });
        marker.bindTooltip(`${patrol.unitId} - ${patrol.location}`, { direction: "bottom" });
        marker.addTo(group);
      });
    }

    // 4. Preemptive Intercept Transit Routes
    if (activeDispatchRoute && proactiveDispatch) {
      const startLat = proactiveDispatch.unit.latitude;
      const startLng = proactiveDispatch.unit.longitude;
      const endLat = proactiveDispatch.lat;
      const endLng = proactiveDispatch.lng;

      // Dashed Intercept Path Line
      L.polyline([[startLat, startLng], [endLat, endLng]], {
        color: "#fbbf24",
        weight: 2,
        dashArray: "6, 5",
        opacity: 0.85,
      }).addTo(group);

      // Target pulsing marker ring
      L.circle([endLat, endLng], {
        radius: 120,
        color: "#fbbf24",
        fillColor: "#fbbf24",
        fillOpacity: 0.2,
        weight: 1.5,
      }).addTo(group);
    }
  }, [
    incidents,
    cadLogs,
    stationsList,
    showHotspots,
    showPatrols,
    showStations,
    radius,
    opacity,
    activeDispatchRoute,
    proactiveDispatch,
    isDispatching,
    animationProgress,
    selectedIncident,
    showBoundaries,
    selectedDistrict,
  ]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-[#060810]" />

      {/* Global CSS overrides for custom Leaflet styled elements */}
      <style jsx global>{`
        .leaflet-ps-tooltip {
          background-color: #0c1222 !important;
          color: #ffffff !important;
          border: 1px solid #1e293b !important;
          font-family: monospace !important;
          font-size: 7.5px !important;
          padding: 2px 4px !important;
          border-radius: 2px !important;
          opacity: 0.9 !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4) !important;
        }
        .leaflet-container {
          outline: none;
        }
      `}</style>
    </div>
  );
}
