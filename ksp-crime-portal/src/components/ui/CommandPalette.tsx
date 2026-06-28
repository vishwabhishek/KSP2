"use client";

import React, { useState, useEffect, useRef } from "react";
import { useKsp } from "@/store/KspContext";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Folder, User, Compass, HelpCircle } from "lucide-react";
import { casesList, suspectsList } from "@/utils/mockData";

export const CommandPalette = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    setSelectedCaseId,
    setSelectedSuspectId
  } = useKsp();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Search filter results
  const matchingViews = [
    { id: "dashboard", label: "Operations Command Cockpit" },
    { id: "crime-analytics", label: "Exploratory Crime Analytics" },
    { id: "heatmaps", label: "Spatial Density Hotspots" },
    { id: "district-explorer", label: "District Performance Directory" },
    { id: "station-explorer", label: "Precinct Operations Inspector" },
    { id: "crime-timeline", label: "Chronological Sequence Inspector" },
    { id: "case-explorer", label: "Investigation Case File Board" },
    { id: "network-analysis", label: "Vertex Association Link Analyzer" },
    { id: "predictive-intelligence", label: "Hotspot Predictive Simulator" },
    { id: "evidence-explorer", label: "Secure Digital Evidence Vault" },
    { id: "reports", label: "Executive Briefing Generator" },
    { id: "administration", label: "Access Controls & Logs" }
  ].filter(v => v.label.toLowerCase().includes(query.toLowerCase()));

  const matchingCases = casesList.filter(
    c => c.firNumber.toLowerCase().includes(query.toLowerCase()) ||
         c.summaryDescription.toLowerCase().includes(query.toLowerCase())
  );

  const matchingSuspects = suspectsList.filter(
    s => s.name.toLowerCase().includes(query.toLowerCase()) ||
         s.alias.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectView = (viewId: string) => {
    setActiveTab(viewId);
    setCommandPaletteOpen(false);
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab("case-explorer");
    setCommandPaletteOpen(false);
  };

  const handleSelectSuspect = (suspectId: string) => {
    setSelectedSuspectId(suspectId);
    setActiveTab("suspect-dossiers");
    setCommandPaletteOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        {/* Overlay Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-bg-base/70 backdrop-blur-sm"
          onClick={() => setCommandPaletteOpen(false)}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -8 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg bg-bg-surface border border-border-subtle rounded-md shadow-high overflow-hidden z-10 flex flex-col max-h-[500px]"
        >
          {/* Input Bar */}
          <div className="flex items-center px-4 border-b border-border-subtle h-12">
            <Search className="h-4 w-4 text-text-muted mr-3 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search views, cases, suspect files, or settings..."
              className="w-full bg-transparent border-0 text-text-primary text-[0.75rem] placeholder:text-text-muted focus:outline-none focus:ring-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="text-[0.625rem] font-mono font-bold text-text-muted border border-border-subtle px-1.5 py-0.5 rounded-sm select-none">
              ESC
            </span>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
            {matchingViews.length > 0 && (
              <div>
                <h4 className="text-[0.5625rem] font-mono font-bold uppercase tracking-wider text-text-muted px-2 py-1 select-none">
                  Navigation Views
                </h4>
                {matchingViews.map(view => (
                  <button
                    key={view.id}
                    onClick={() => handleSelectView(view.id)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-bg-surface-elevated text-text-primary hover:text-text-accent transition-colors duration-75 text-[0.75rem] font-mono"
                  >
                    <Compass className="h-3.5 w-3.5 text-text-muted" />
                    {view.label}
                  </button>
                ))}
              </div>
            )}

            {matchingCases.length > 0 && (
              <div>
                <h4 className="text-[0.5625rem] font-mono font-bold uppercase tracking-wider text-text-muted px-2 py-1 select-none">
                  Active Cases (FIR)
                </h4>
                {matchingCases.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCase(c.id)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-bg-surface-elevated text-text-primary hover:text-text-accent transition-colors duration-75 text-[0.75rem]"
                  >
                    <Folder className="h-3.5 w-3.5 text-brand-primary" />
                    <span className="font-mono font-bold text-brand-primary">{c.firNumber}</span>
                    <span className="text-text-muted truncate flex-1">— {c.summaryDescription}</span>
                  </button>
                ))}
              </div>
            )}

            {matchingSuspects.length > 0 && (
              <div>
                <h4 className="text-[0.5625rem] font-mono font-bold uppercase tracking-wider text-text-muted px-2 py-1 select-none">
                  Suspect Dossiers
                </h4>
                {matchingSuspects.map(s => (
                  <button
                    key={s.bookingId}
                    onClick={() => handleSelectSuspect(s.bookingId)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-bg-surface-elevated text-text-primary hover:text-text-accent transition-colors duration-75 text-[0.75rem]"
                  >
                    <User className="h-3.5 w-3.5 text-border-critical" />
                    <span className="font-mono font-bold text-border-critical">{s.name}</span>
                    {s.alias && <span className="text-text-muted">({s.alias})</span>}
                  </button>
                ))}
              </div>
            )}

            {matchingViews.length === 0 && matchingCases.length === 0 && matchingSuspects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <HelpCircle className="h-8 w-8 text-text-muted mb-2" />
                <span className="text-[0.75rem] font-mono text-text-muted">
                  NO RESULTS MATCHING "{query.toUpperCase()}" FOUND.
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
