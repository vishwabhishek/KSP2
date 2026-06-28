"use client";

import React from "react";
import { useKsp } from "@/store/KspContext";
import { Shell } from "@/components/layout/Shell";

// Page Views
import { DashboardView } from "@/components/pages/DashboardView";
import { AnalyticsView } from "@/components/pages/AnalyticsView";
import { HeatmapView } from "@/components/pages/HeatmapView";
import { DistrictView } from "@/components/pages/DistrictView";
import { StationView } from "@/components/pages/StationView";
import { TimelineView } from "@/components/pages/TimelineView";
import { CaseView } from "@/components/pages/CaseView";
import { NetworkView } from "@/components/pages/NetworkView";
import { PersonView } from "@/components/pages/PersonView";
import { PredictiveView } from "@/components/pages/PredictiveView";
import { EvidenceView } from "@/components/pages/EvidenceView";
import { ReportsView } from "@/components/pages/ReportsView";
import { AdminView } from "@/components/pages/AdminView";

export default function Home() {
  const { activeTab } = useKsp();

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "crime-analytics":
        return <AnalyticsView />;
      case "heatmaps":
        return <HeatmapView />;
      case "district-explorer":
        return <DistrictView />;
      case "station-explorer":
        return <StationView />;
      case "crime-timeline":
        return <TimelineView />;
      case "case-explorer":
        return <CaseView />;
      case "network-analysis":
        return <NetworkView />;
      case "suspect-dossiers":
        return <PersonView />;
      case "predictive-intelligence":
        return <PredictiveView />;
      case "evidence-explorer":
        return <EvidenceView />;
      case "reports":
        return <ReportsView />;
      case "administration":
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  return <Shell>{renderView()}</Shell>;
}
