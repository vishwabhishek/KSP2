"use client";

import React, { useState } from "react";
import { useKsp } from "@/store/KspContext";
import { Shield, Key, Loader2, UserPlus, LogIn, AlertCircle } from "lucide-react";

export const AuthView = () => {
  const { login, register } = useKsp();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [badgeId, setBadgeId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Sub-Inspector");
  const [clearance, setClearance] = useState("Level 2 (Precinct Analyst)");
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleQuickAutofill = () => {
    setBadgeId("KSP-8812");
    setName("Insp. Rajesh Sharma");
    setErrorMessage("");
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!badgeId.trim()) {
      setErrorMessage("AUTHORIZATION DENIED: Badge ID is required.");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("AUTHORIZATION DENIED: Officer name is required.");
      return;
    }

    const badgeRegex = /^KSP-\d{4}$/;
    if (activeTab === "register" && !badgeRegex.test(badgeId.toUpperCase())) {
      setErrorMessage("FORMAT EXCEPTION: Badge ID must match format 'KSP-XXXX' (e.g. KSP-1234).");
      return;
    }

    setIsVerifying(true);
    
    // Provide a brief, responsive delay to show visual feedback, then login immediately
    setTimeout(() => {
      if (activeTab === "login") {
        login(badgeId.toUpperCase(), name);
      } else {
        register(badgeId.toUpperCase(), name, role, clearance);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen w-full bg-[#060810] text-[#f8fafc] flex items-center justify-center relative overflow-hidden select-none font-mono">
      {/* Background Matrix/Grid Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />

      {/* Cyberpunk circular radar background effect */}
      <div className="absolute w-[800px] h-[800px] rounded-full border border-[#00d8f6]/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      {/* Main Glassmorphic Container Card */}
      <div className="w-full max-w-[420px] relative z-10 mx-4 bg-[#090f1e]/80 backdrop-blur-md border border-[#1e293b] rounded p-6 shadow-[0_0_50px_rgba(0,216,246,0.08)]">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-[#1f293d] pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#00d8f6]" />
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider leading-none text-white">KSP CRIME PORTAL</span>
              <span className="text-[9px] text-[#00d8f6] font-bold tracking-widest mt-1">SECURE PORT VERIFICATION</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">NODE ONLINE</span>
          </div>
        </div>

        {/* Biometric Scan Simulator HUD */}
        {isVerifying ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2 className="h-8 w-8 text-[#00d8f6] animate-spin" />
            <span className="text-xs text-white uppercase font-bold tracking-widest animate-pulse">
              AUTHENTICATING DECK...
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* Tabs Selector */}
            <div className="flex bg-[#0c1222] border border-[#1f293d] rounded-sm p-0.5 mb-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setErrorMessage("");
                }}
                className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 cursor-pointer rounded-sm transition-colors ${
                  activeTab === "login"
                    ? "bg-[#00d8f6] text-[#060810]"
                    : "text-[#8492a6] hover:text-white"
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                OFFICER LOGIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setErrorMessage("");
                }}
                className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 cursor-pointer rounded-sm transition-colors ${
                  activeTab === "register"
                    ? "bg-[#00d8f6] text-[#060810]"
                    : "text-[#8492a6] hover:text-white"
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                REGISTER PORT
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-2.5 rounded-sm flex items-start gap-2 text-[10px] leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4 text-[10px]">
              
              {/* Badge ID Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-wider text-[#8492a6] font-bold">
                  OFFICER BADGE ID:
                </label>
                <input
                  type="text"
                  placeholder={activeTab === "login" ? "e.g. KSP-8812" : "KSP-XXXX"}
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="bg-[#0c1222] border border-[#1f293d] rounded-sm px-3 py-2 text-white focus:outline-none focus:border-[#00d8f6] placeholder-[#475569] uppercase font-bold tracking-wide"
                />
              </div>

              {/* Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-wider text-[#8492a6] font-bold">
                  OFFICER NAME / CALLSIGN:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#0c1222] border border-[#1f293d] rounded-sm px-3 py-2 text-white focus:outline-none focus:border-[#00d8f6] placeholder-[#475569]"
                />
              </div>

              {/* Register Extra Fields */}
              {activeTab === "register" && (
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-[#8492a6] font-bold">
                      ASSIGNED ROLE:
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-[#0c1222] border border-[#1f293d] rounded-sm px-2 py-2 text-white focus:outline-none focus:border-[#00d8f6] cursor-pointer"
                    >
                      <option value="Crime Analyst Lead">Analyst Lead</option>
                      <option value="DGP State Commissioner">Commissioner</option>
                      <option value="Precinct Commander">Commander</option>
                      <option value="Sub-Inspector">Sub-Inspector</option>
                      <option value="Constable">Constable</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-[#8492a6] font-bold">
                      CLEARANCE:
                    </label>
                    <select
                      value={clearance}
                      onChange={(e) => setClearance(e.target.value)}
                      className="bg-[#0c1222] border border-[#1f293d] rounded-sm px-2 py-2 text-white focus:outline-none focus:border-[#00d8f6] cursor-pointer"
                    >
                      <option value="Level 5 (Full Read/Write)">Level 5</option>
                      <option value="Level 4 (SCRB Admin)">Level 4</option>
                      <option value="Level 3 (District Investigator)">Level 3</option>
                      <option value="Level 2 (Precinct Analyst)">Level 2</option>
                      <option value="Level 1 (Precinct Read)">Level 1</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Authentication Button */}
              <button
                type="submit"
                className="bg-[#00d8f6] hover:bg-[#00d8f6]/90 text-[#060810] font-bold py-2.5 rounded-sm uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-[0_0_12px_rgba(0,216,246,0.2)]"
              >
                <Key className="h-4 w-4" />
                {activeTab === "login" ? "AUTHENTICATE DECK" : "REGISTER ASSIGNMENT"}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            {activeTab === "login" && (
              <div className="mt-4 pt-3.5 border-t border-[#1f293d] flex flex-col items-center gap-2">
                <span className="text-[8px] text-[#475569] uppercase font-bold tracking-wider">DEMONSTRATION AUTHENTICATION FLOW</span>
                <button
                  type="button"
                  onClick={handleQuickAutofill}
                  className="bg-[#0c1222] text-[#00d8f6] border border-[#00d8f6]/20 hover:border-[#00d8f6]/60 rounded px-3 py-1.5 text-[9px] font-bold uppercase transition-colors cursor-pointer"
                >
                  Autofill Default Officer Profile
                </button>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
};
