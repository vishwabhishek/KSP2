"use client";

import React, { useState } from "react";
import { evidenceVault } from "@/utils/mockData";
import { Card } from "../ui/Card";
import { Folder, FileText, CheckCircle, ShieldCheck, Lock, HardDrive } from "lucide-react";

export const EvidenceView = () => {
  const [selectedDir, setSelectedDir] = useState(evidenceVault.directories[0]);

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            SECURE DIGITAL EVIDENCE VAULT
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Manage investigation folders, digital media, cell reports, and verified MD5 hashes.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Left Side Directories list */}
        <div className="flex flex-col gap-3">
          <Card title="Directory Vaults">
            <div className="flex flex-col gap-2 font-mono text-[0.6875rem]">
              {evidenceVault.directories.map(d => {
                const isSelected = selectedDir === d;
                return (
                  <div
                    key={d}
                    onClick={() => setSelectedDir(d)}
                    className={`p-3 border border-border-subtle rounded-sm cursor-pointer flex items-center gap-2 ${
                      isSelected ? "bg-bg-surface-elevated border-brand-primary" : "bg-bg-surface hover:bg-bg-surface-elevated/40"
                    }`}
                  >
                    <Folder className={`h-4 w-4 shrink-0 ${isSelected ? "text-brand-accent" : "text-text-muted"}`} />
                    <span className="font-bold text-text-primary uppercase truncate">{d}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Integrity Check Status">
            <div className="flex flex-col gap-3.5 font-mono text-[0.6875rem]">
              <div className="flex items-center gap-2 text-severity-level1">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="font-bold">ALL HASHES VERIFIED</span>
              </div>
              <p className="text-text-muted text-[0.625rem] leading-relaxed">
                Vault is linked to the secure SCRB blockchain network. Integrity matching validation checks run automatically on files.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Side Files Grid layout */}
        <div className="lg:col-span-3">
          <Card title={`${selectedDir.toUpperCase()} — CASE MATERIALS`} subtitle="Digitized materials associated with active investigations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {evidenceVault.files.map((f, i) => {
                return (
                  <div
                    key={i}
                    className="p-3.5 bg-bg-surface border border-border-subtle rounded-sm flex items-start gap-3 hover:border-border-focus transition-colors duration-100"
                  >
                    {/* Icon container */}
                    <div className="h-10 w-10 bg-bg-surface-elevated rounded-sm flex items-center justify-center border border-border-subtle shrink-0">
                      <FileText className="h-5 w-5 text-brand-primary" />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 flex flex-col gap-1 min-w-0 font-mono text-[0.6875rem]">
                      <span className="font-bold text-text-primary uppercase truncate">{f.fileName}</span>
                      <span className="text-text-muted text-[0.625rem]">Size: {f.fileSize}</span>

                      {/* MD5 hash display */}
                      <span className="text-[0.5625rem] text-text-muted mt-1 select-all truncate bg-bg-surface-elevated px-1.5 py-0.5 rounded-sm border border-border-subtle">
                        MD5: {f.checksumHash}
                      </span>

                      {/* Chain of custody status badge */}
                      <div className="flex items-center gap-1.5 mt-2 border-t border-border-subtle/40 pt-2 text-[0.5625rem] text-severity-level1 font-bold">
                        <Lock className="h-3 w-3 text-brand-accent" />
                        <span>CUSTODY STATUS: {f.custodyStatus.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
