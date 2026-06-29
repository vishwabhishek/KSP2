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

const labelTranslations: Record<string, Record<string, string>> = {
  en: {
    "Cockpit": "Cockpit",
    "Analytics": "Analytics",
    "Hotspots": "Hotspots",
    "Districts": "Districts",
    "Precincts": "Precincts",
    "Timeline": "Timeline",
    "Cases": "Cases",
    "Vertex": "Vertex",
    "Dossiers": "Dossiers",
    "Predictive": "Predictive",
    "Evidence": "Evidence",
    "Reports": "Reports",
    "Admin": "Admin",
    "OFFICER ON DUTY:": "OFFICER ON DUTY:",
    "DISCONNECT SESSION": "DISCONNECT SESSION",
    "COLLAPSE SIDEBAR": "COLLAPSE SIDEBAR",
    "Theme": "Theme",
    "Text": "Text",
    "Night": "Night",
    "Day": "Day",
    "Small": "Small",
    "Normal": "Normal",
    "Large": "Large",
    "Extra": "Extra"
  },
  kn: {
    "Cockpit": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "Analytics": "ವಿಶ್ಲೇಷಣೆ",
    "Hotspots": "ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು",
    "Districts": "ಜಿಲ್ಲೆಗಳು",
    "Precincts": "ಠಾಣೆಗಳು",
    "Timeline": "ಕಾಲಕ್ರಮ",
    "Cases": "ಪ್ರಕರಣಗಳು",
    "Vertex": "ನೆಟ್‌ವರ್ಕ್ ಜಾಲ",
    "Dossiers": "ಡೋಸಿಯರ್‌ಗಳು",
    "Predictive": "ಅಂದಾಜು ಅಪರಾಧ",
    "Evidence": "ಸಾಕ್ಷ್ಯಾಧಾರ",
    "Reports": "ವರದಿಗಳು",
    "Admin": "ನಿರ್ವಹಣೆ",
    "OFFICER ON DUTY:": "ಕರ್ತವ್ಯದಲ್ಲಿರುವ ಅಧಿಕಾರಿ:",
    "DISCONNECT SESSION": "ಲಾಗ್ ಔಟ್ ಮಾಡಿ",
    "COLLAPSE SIDEBAR": "ಸೈಡ್‌ಬಾರ್ ಮರೆಮಾಡು",
    "Theme": "ಥೀಮ್ / ಬಣ್ಣ",
    "Text": "ಅಕ್ಷರದ ಗಾತ್ರ",
    "Night": "ರಾತ್ರಿ",
    "Day": "ಹಗಲು",
    "Small": "ಸಣ್ಣ",
    "Normal": "ಸಾಮಾನ್ಯ",
    "Large": "ದೊಡ್ಡದು",
    "Extra": "ಹೆಚ್ಚುವರಿ"
  }
};

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
  const { activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed, user, logout, logActivity, language } = useKsp();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  const t = (label: string) => {
    return labelTranslations[language]?.[label] || label;
  };

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
        <div className="h-8 w-8 shrink-0 transition-transform duration-300 hover:scale-125 flex items-center justify-center bg-transparent">
          <img 
            src="/Seal_of_Karnataka.svg" 
            alt="Seal of Karnataka" 
            className="h-full w-full object-contain"
          />
        </div>
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
              onClick={() => {
                logActivity(`Navigated to section: ${item.label}`);
                setActiveTab(item.id);
              }}
              title={sidebarCollapsed ? t(item.label) : undefined}
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
              {!sidebarCollapsed && <span className="truncate">{t(item.label)}</span>}
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
              <span>{t("COLLAPSE SIDEBAR")}</span>
            </>
          )}
        </button>
      </div>

      {/* System Status & Settings Footer */}
      {!sidebarCollapsed ? (
        <div className="p-3 border-t border-border-subtle bg-bg-surface-elevated/10 flex flex-col gap-3 transition-all duration-300">
          {/* Active Officer Section */}
          {user && (
            <div className="flex flex-col gap-1.5 p-2 bg-[#0c1222] border border-[#1f293d] rounded-sm font-mono text-[0.625rem] border-dashed">
              <span className="text-[0.5rem] text-[#00d8f6] font-bold uppercase tracking-wider">{t("OFFICER ON DUTY:")}</span>
              <div className="flex flex-col">
                <span className="font-bold text-text-primary truncate">{user.name}</span>
                <span className="text-text-muted text-[0.55rem]">{user.badgeId} • {user.role}</span>
              </div>
              <button
                onClick={logout}
                className="mt-1 w-full py-1 text-center text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/50 bg-red-950/20 rounded cursor-pointer uppercase font-bold text-[0.55rem] transition-colors"
              >
                {t("DISCONNECT SESSION")}
              </button>
            </div>
          )}

          {/* Settings Toggles */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.625rem] text-text-secondary uppercase">{t("Theme")}</span>
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value as any)}
                className="bg-bg-base text-text-primary text-[0.625rem] p-1 rounded border border-border-subtle"
              >
                <option value="dark">{t("Night")}</option>
                <option value="light">{t("Day")}</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[0.625rem] text-text-secondary uppercase">{t("Text")}</span>
              <select 
                value={fontSize} 
                onChange={(e) => setFontSize(e.target.value as any)}
                className="bg-bg-base text-text-primary text-[0.625rem] p-1 rounded border border-border-subtle"
              >
                <option value="small">{t("Small")}</option>
                <option value="medium">{t("Normal")}</option>
                <option value="large">{t("Large")}</option>
                <option value="xlarge">{t("Extra")}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border-subtle/50">
            <span className="h-2 w-2 rounded-full bg-severity-level1 animate-pulse" />
            <span className="text-[0.5625rem] text-text-muted tracking-wider uppercase font-bold">SECURE NODE-04</span>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-border-subtle bg-bg-surface-elevated/10 flex flex-col items-center gap-3 transition-all duration-300">
          <button
            onClick={logout}
            title={`Log Out Officer: ${user?.name || "Guest"}`}
            className="p-1.5 rounded bg-red-950/20 border border-red-500/20 hover:border-red-500/60 text-red-400 cursor-pointer transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
          <span className="h-2.5 w-2.5 rounded-full bg-severity-level1 animate-pulse" title="Secure Node-04 Connection Active" />
        </div>
      )}
    </div>
  );
};
