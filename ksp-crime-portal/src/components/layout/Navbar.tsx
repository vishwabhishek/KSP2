"use client";

import React, { useState, useEffect } from "react";
import { useKsp } from "@/store/KspContext";
import { Search, ShieldAlert, Bot, HelpCircle, Bell } from "lucide-react";
import { districtsList } from "@/utils/mockData";

export const Navbar = () => {
  const {
    selectedDistrict,
    setSelectedDistrict,
    setCommandPaletteOpen,
    copilotOpen,
    setCopilotOpen,
    user,
    language,
    setLanguage
  } = useKsp();

  const officerName = user?.name || "INSP. SHARMA";
  const officerBadge = user?.badgeId || "KSP-8812";
  
  const getInitials = (fullName: string) => {
    const cleanName = fullName.replace(/^(INSP\.|SUB-INSP\.|SI\.|CONSTABLE\.|DGP\.|MR\.|MRS\.|DR\.)\s+/i, "").trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] || "") + (parts[1][0] || "");
    }
    return cleanName.substring(0, 2).toUpperCase() || "OP";
  };
  const initials = getInitials(officerName);

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(
        date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        }) + " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-12 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-4 select-none shrink-0 font-mono">
      {/* Search Palette Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1 bg-bg-surface-elevated border border-border-subtle hover:border-border-focus text-text-muted hover:text-text-primary rounded-sm transition-all duration-150 text-[0.6875rem] text-left w-[240px]"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search records (Ctrl+K)...</span>
        </button>

        {/* Jurisdiction Selector */}
        <div className="flex items-center gap-1.5 border-l border-border-subtle pl-4">
          <span className="text-[0.625rem] text-text-muted uppercase font-bold tracking-wider">JURISDICTION:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-bg-surface-elevated border border-border-subtle rounded-sm text-[0.6875rem] text-text-primary px-2.5 py-1 focus:outline-none focus:border-border-focus cursor-pointer"
          >
            <option value="All Districts">ALL DISTRICTS</option>
            {districtsList.map(d => (
              <option key={d.districtName} value={d.districtName}>
                {d.districtName.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clock, Status & User Badge */}
      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <span className="text-[0.6875rem] font-bold text-brand-accent tracking-widest bg-brand-accent/5 px-2.5 py-1 rounded-sm border border-brand-accent/15">
          {currentTime}
        </span>

        {/* Language Selector Toggle */}
        <div className="flex items-center gap-1 bg-bg-surface-elevated border border-border-subtle p-0.5 rounded-sm select-none">
          <button
            onClick={() => setLanguage("en")}
            className={`px-2 py-0.5 text-[0.625rem] font-bold rounded-sm transition-all duration-150 cursor-pointer ${
              language === "en"
                ? "bg-brand-accent text-bg-base font-black shadow-low"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("kn")}
            className={`px-2 py-0.5 text-[0.625rem] font-bold rounded-sm transition-all duration-150 cursor-pointer ${
              language === "kn"
                ? "bg-brand-accent text-bg-base font-black shadow-low"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>

        {/* Notifications & Warning Alerts */}
        <div className="flex items-center gap-2 border-l border-border-subtle pl-4">
          <button className="p-1.5 hover:bg-bg-surface-elevated text-text-secondary hover:text-text-primary rounded-sm transition-colors relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-severity-level3 animate-pulse" />
          </button>

          <button className="p-1.5 hover:bg-bg-surface-elevated text-text-secondary hover:text-text-primary rounded-sm transition-colors">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>

        {/* AI Copilot Toggle */}
        <button
          onClick={() => setCopilotOpen(!copilotOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-sm border transition-all duration-150 cursor-pointer ${
            copilotOpen
              ? "bg-brand-accent/15 border-brand-accent text-brand-accent"
              : "bg-bg-surface-elevated border-border-subtle text-text-secondary hover:border-brand-accent/50 hover:text-text-primary"
          }`}
        >
          <Bot className="h-4 w-4" />
          <span className="text-[0.625rem] font-bold uppercase tracking-wider">KSP CO-PILOT</span>
        </button>

        {/* Officer Profile Badge */}
        <div className="flex items-center gap-2 border-l border-border-subtle pl-4 text-right">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.625rem] font-bold text-text-primary leading-none uppercase">{officerName}</span>
            <span className="text-[0.5rem] text-text-muted leading-none">BADGE #{officerBadge}</span>
          </div>
          <div className="h-7 w-7 rounded-sm bg-brand-primary/25 border border-brand-primary flex items-center justify-center font-bold text-brand-accent text-[0.75rem] select-none shadow-low">
            {initials}
          </div>
        </div>
      </div>
    </div>
  );
};
