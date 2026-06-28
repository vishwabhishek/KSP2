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
  Settings,
  ChevronLeft,
  ChevronRight
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
  const { activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed } = useKsp();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  return (
    <div className="w-full bg-bg-surface border-r border-border-subtle flex flex-col h-full select-none shrink-0 font-mono">
      {/* Platform Branding Logo */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={clsx(
          "h-12 flex items-center border-b border-border-subtle bg-bg-surface-elevated/20 transition-all duration-300 w-full text-left hover:bg-bg-surface-elevated/30 cursor-pointer outline-none focus:outline-none shrink-0",
          {
            "justify-center px-0": sidebarCollapsed,
            "gap-2.5 px-4": !sidebarCollapsed
          }
        )}
        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <Shield className="h-5 w-5 text-brand-primary animate-pulse shrink-0" />
        {!sidebarCollapsed && (
          <div className="flex flex-col">
            <span className="text-[0.6875rem] font-bold text-text-primary tracking-wider leading-none">KSP CRIME</span>
            <span className="text-[0.5rem] text-brand-accent font-bold tracking-widest mt-0.5">INTEL CENTER</span>
          </div>
        )}
      </button>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
              className={clsx(
                "flex items-center rounded-sm text-[0.625rem] uppercase font-bold tracking-wider transition-all duration-150 cursor-pointer",
                sidebarCollapsed ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2 text-left",
                {
                  "bg-brand-primary text-text-primary border border-brand-primary shadow-low": isActive,
                  "text-text-secondary hover:text-text-primary hover:bg-bg-surface-elevated/40 border border-transparent": !isActive
                }
              )}
            >
              <Icon className={clsx("h-4 w-4 shrink-0", { "text-text-primary": isActive, "text-text-muted": !isActive })} />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Collapse Sidebar Toggle Action */}
      <div className="px-2 py-1.5 border-t border-border-subtle/50 flex flex-col">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={clsx(
            "flex items-center rounded-sm text-[0.5625rem] uppercase font-bold tracking-wider text-text-muted hover:text-text-primary hover:bg-bg-surface-elevated/30 transition-all duration-150 cursor-pointer",
            sidebarCollapsed ? "justify-center p-2.5" : "gap-2 px-2.5 py-2 text-left"
          )}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>COLLAPSE SIDEBAR</span>
            </>
          )}
        </button>
      </div>

      {/* System Status & Settings Footer */}
      {!sidebarCollapsed ? (
        <div className="p-3 border-t border-border-subtle bg-bg-surface-elevated/10 flex flex-col gap-3 transition-all duration-300">
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
      ) : (
        <div className="p-3 border-t border-border-subtle bg-bg-surface-elevated/10 flex items-center justify-center transition-all duration-300">
          <span className="h-2.5 w-2.5 rounded-full bg-severity-level1 animate-pulse" title="Secure Node-04 Connection Active" />
        </div>
      )}
    </div>
  );
};
