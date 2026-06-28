"use client";

import React from "react";
import { useKsp } from "@/store/KspContext";
import { useTheme } from "@/store/ThemeContext";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  BarChart3,
  Map,
  Shield,
  Building2,
  Clock,
  FolderHeart,
  Share2,
  Users,
  BrainCircuit,
  FileKey2,
  FileSpreadsheet,
  Settings
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: SidebarItem[] = [
  { id: "dashboard", label: "Cockpit", icon: LayoutDashboard },
  { id: "crime-analytics", label: "Analytics", icon: BarChart3 },
  { id: "heatmaps", label: "Hotspots", icon: Map },
  { id: "district-explorer", label: "Districts", icon: Shield },
  { id: "station-explorer", label: "Precincts", icon: Building2 },
  { id: "crime-timeline", label: "Timeline", icon: Clock },
  { id: "case-explorer", label: "Cases", icon: FolderHeart },
  { id: "network-analysis", label: "Vertex", icon: Share2 },
  { id: "suspect-dossiers", label: "Dossiers", icon: Users },
  { id: "predictive-intelligence", label: "Predictive", icon: BrainCircuit },
  { id: "evidence-explorer", label: "Evidence", icon: FileKey2 },
  { id: "reports", label: "Reports", icon: FileSpreadsheet },
  { id: "administration", label: "Admin", icon: Settings }
];

export const Sidebar = () => {
  const { activeTab, setActiveTab } = useKsp();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  return (
    <div className="w-full bg-bg-surface border-r border-border-subtle flex flex-col h-full select-none shrink-0 font-mono">
      {/* Platform Branding Logo */}
      <div className="h-12 flex items-center gap-2.5 px-4 border-b border-border-subtle bg-bg-surface-elevated/20">
        <Shield className="h-5 w-5 text-brand-primary animate-pulse" />
        <div className="flex flex-col">
          <span className="text-[0.6875rem] font-bold text-text-primary tracking-wider leading-none">KSP CRIME</span>
          <span className="text-[0.5rem] text-brand-accent font-bold tracking-widest mt-0.5">INTEL CENTER</span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[0.625rem] uppercase font-bold tracking-wider transition-all duration-150 text-left cursor-pointer",
                {
                  "bg-brand-primary text-text-primary border border-brand-primary shadow-low": isActive,
                  "text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated/40 border border-transparent": !isActive
                }
              )}
            >
              <Icon className={clsx("h-4 w-4 shrink-0", { "text-text-primary": isActive, "text-text-muted": !isActive })} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* System Status & Settings Footer */}
      <div className="p-3 border-t border-border-subtle bg-bg-surface-elevated/10 flex flex-col gap-3">
        
        {/* Settings Toggles */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.625rem] text-text-secondary uppercase">Theme</span>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as any)}
              className="bg-bg-base text-text-primary text-[0.625rem] p-1 rounded border border-border-subtle"
            >
              <option value="dark">Night</option>
              <option value="light">Day</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.625rem] text-text-secondary uppercase">Text</span>
            <select 
              value={fontSize} 
              onChange={(e) => setFontSize(e.target.value as any)}
              className="bg-bg-base text-text-primary text-[0.625rem] p-1 rounded border border-border-subtle"
            >
              <option value="small">Small</option>
              <option value="medium">Normal</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/50">
          <span className="h-2 w-2 rounded-full bg-severity-level1 animate-pulse" />
          <span className="text-[0.5625rem] text-text-muted tracking-wider uppercase font-bold">SECURE NODE-04</span>
        </div>
      </div>
    </div>
  );
};
