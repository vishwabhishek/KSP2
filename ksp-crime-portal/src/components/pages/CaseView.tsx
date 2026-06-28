"use client";

import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { casesList, CaseItem } from "@/utils/mockData";
import { Folder, FolderOpen, Calendar, User, Clock, CheckCircle2, ShieldAlert, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const COLUMNS = [
  { id: "unassigned", label: "Unassigned Files", border: "border-t-severity-level2" },
  { id: "under-investigation", label: "Under Investigation", border: "border-t-brand-primary" },
  { id: "charge-sheet-filed", label: "Charge Sheet Filed", border: "border-t-brand-accent" },
  { id: "closed", label: "Closed File Archive", border: "border-t-severity-level1" }
];

export const CaseView = () => {
  const [activeBoardCases, setActiveBoardCases] = useState<CaseItem[]>(casesList);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);

  // Handle local status transition (drag-like select simulation)
  const handleUpdateStatus = (caseId: string, newStatus: CaseItem["status"]) => {
    setActiveBoardCases(prev =>
      prev.map(c => (c.id === caseId ? { ...c, status: newStatus } : c))
    );
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(prev => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            INVESTIGATION CASE FILE BOARD
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Track FIR status lifecycle stages: unassigned, investigation, charge sheet filing, and closed archives.
          </span>
        </div>
      </div>

      {/* Main Workspace splitscreen */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Kanban Board columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto min-h-0 pb-2">
          {COLUMNS.map(col => {
            const colCases = activeBoardCases.filter(c => c.status === col.id);
            return (
              <div key={col.id} className="bg-bg-surface/60 border border-border-subtle rounded-md flex flex-col min-h-0">
                {/* Column header */}
                <div className={`px-3 py-2.5 border-b border-border-subtle ${col.border} border-t-2 bg-bg-surface-elevated/40 select-none flex items-center justify-between shrink-0`}>
                  <span className="font-mono text-[0.625rem] font-bold text-text-primary uppercase tracking-wide">
                    {col.label}
                  </span>
                  <span className="font-mono text-[0.5625rem] font-bold bg-bg-surface-elevated text-text-secondary px-1.5 py-0.5 border border-border-subtle rounded-sm">
                    {colCases.length}
                  </span>
                </div>

                {/* Column Card listing */}
                <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5">
                  {colCases.map(c => {
                    const isSelected = selectedCase?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCase(c)}
                        className={`bg-bg-surface border rounded-sm p-3 shadow-low cursor-pointer hover:border-border-focus transition-all duration-100 flex flex-col gap-2 ${
                          isSelected ? "border-brand-accent bg-bg-surface-elevated" : "border-border-subtle"
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[0.625rem]">
                          <span className="font-bold text-brand-primary">{c.firNumber}</span>
                          <span className="text-text-muted">{c.daysCounter}D active</span>
                        </div>

                        <p className="text-[0.75rem] text-text-secondary font-sans leading-relaxed line-clamp-2">
                          {c.summaryDescription}
                        </p>

                        <div className="flex items-center justify-between border-t border-border-subtle/50 pt-2 mt-0.5 font-mono text-[0.5625rem] text-text-muted">
                          <span className="truncate max-w-[120px]">{c.officerName}</span>
                          <span
                            className={`font-bold uppercase ${
                              c.caseSeverity === "level4"
                                ? "text-severity-level3"
                                : c.caseSeverity === "level3"
                                ? "text-brand-gold"
                                : "text-severity-level1"
                            }`}
                          >
                            {c.caseSeverity}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {colCases.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-border-subtle/50 rounded-sm py-12 text-center text-text-muted font-mono text-[0.625rem]">
                      EMPTY QUEUE
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Side Drawer details overlay */}
        <AnimatePresence>
          {selectedCase && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="absolute right-0 top-0 bottom-0 w-[350px] bg-bg-surface border-l border-border-subtle z-20 shadow-high flex flex-col min-h-0"
            >
              {/* Header */}
              <div className="p-4 border-b border-border-subtle bg-bg-surface-elevated/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4.5 w-4.5 text-brand-accent" />
                  <span className="font-mono text-[0.75rem] font-bold text-text-primary tracking-wide">
                    DOSSIER DETAILS
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1 hover:bg-bg-surface-elevated text-text-muted hover:text-text-primary rounded-sm cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 font-mono text-[0.6875rem]">
                {/* FIR meta info */}
                <div className="flex flex-col gap-1.5 border-b border-border-subtle pb-4">
                  <span className="text-[0.875rem] font-bold text-brand-accent">{selectedCase.firNumber}</span>
                  <span className="text-text-secondary text-[0.625rem] uppercase font-bold">{selectedCase.ipcSections}</span>
                </div>

                {/* Caseload stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-bg-surface-elevated/40 p-2.5 rounded-sm border border-border-subtle flex flex-col gap-0.5">
                    <span className="text-text-muted text-[0.5625rem] uppercase">days elapsed</span>
                    <span className="text-[13px] font-bold text-text-primary">{selectedCase.daysCounter} Days</span>
                  </div>
                  <div className="bg-bg-surface-elevated/40 p-2.5 rounded-sm border border-border-subtle flex flex-col gap-0.5">
                    <span className="text-text-muted text-[0.5625rem] uppercase">investigator</span>
                    <span className="text-[0.6875rem] font-bold text-text-primary truncate">{selectedCase.officerName}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex flex-col gap-1.5 border-b border-border-subtle pb-4 mt-2">
                  <span className="text-[0.625rem] text-text-muted uppercase font-bold">incident dossier summary:</span>
                  <p className="text-[0.75rem] text-text-secondary font-sans leading-relaxed select-text">
                    {selectedCase.summaryDescription}
                  </p>
                </div>

                {/* Status Switcher HUD */}
                <div className="flex flex-col gap-2">
                  <span className="text-[0.625rem] text-text-muted uppercase font-bold">lifecycle step actions:</span>
                  <div className="flex flex-col gap-1.5">
                    {COLUMNS.map(col => {
                      const isActive = selectedCase.status === col.id;
                      return (
                        <button
                          key={col.id}
                          onClick={() => handleUpdateStatus(selectedCase.id, col.id as CaseItem["status"])}
                          className={`w-full text-left px-3 py-1.5 rounded-sm border text-[0.625rem] uppercase font-bold transition-all duration-100 cursor-pointer flex items-center justify-between ${
                            isActive
                              ? "bg-brand-primary/10 border-brand-primary text-text-primary"
                              : "bg-transparent border-border-subtle text-text-secondary hover:bg-bg-surface-elevated hover:text-text-primary"
                          }`}
                        >
                          <span>{col.label}</span>
                          {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-brand-accent" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
