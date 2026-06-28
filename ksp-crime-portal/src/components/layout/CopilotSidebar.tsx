"use client";

import React, { useState, useRef, useEffect } from "react";
import { useKsp } from "@/store/KspContext";
import { Bot, Send, User, ChevronRight, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_QUERIES = [
  "Verify FIR-890 details & vehicles",
  "Locate suspects in Indiranagar",
  "Generate CAD status dashboard summary",
  "Assess risk in Kalaburagi District"
];

export const CopilotSidebar = () => {
  const { copilotOpen, chatMessages, addChatMessage } = useKsp();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  if (!copilotOpen) return null;

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    addChatMessage(text, "user");
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response stream
    setTimeout(() => {
      setIsTyping(false);
      let responseText = "";
      let citations: Array<{ title: string; link: string }> = [];

      const normalized = text.toLowerCase();
      if (normalized.includes("fir-890") || normalized.includes("vehicle") || normalized.includes("theft")) {
        responseText = "Cross-referenced FIR-890 metadata. 5 active luxury sedan thefts are logged across East Bengaluru. Suspect Vicky Bhai has been associated with target vehicles. Plate KA-03-MR-9801 was bypassed near Halasuru crossing.";
        citations = [
          { title: "FIR-2026/0890 Dossier", link: "#" },
          { title: "CCTV Plate ALPR logs", link: "#" }
        ];
      } else if (normalized.includes("suspect") || normalized.includes("vicky") || normalized.includes("indiranagar")) {
        responseText = "Vikram 'Vicky' Gowda (Booking ID: KSP-9087-A) risk rating is currently flagged as CRITICAL. Last active ping tower was Indiranagar Sector 2. Active warrant for vehicle theft and assault.";
        citations = [
          { title: "Vicky Gowda Profile", link: "#" },
          { title: "CDR Tower logs (Indira-04)", link: "#" }
        ];
      } else if (normalized.includes("cad") || normalized.includes("telemetry") || normalized.includes("status")) {
        responseText = "Active CAD telemetry logs show 5 patrol vehicles dispatched. Unit U-09 (Patrol Car) has responded to an emergency in East Zone. Response score average remains at 5.2 minutes.";
        citations = [
          { title: "Live Dispatch Dashboard", link: "#" }
        ];
      } else {
        responseText = "KSP crime database queried. Filter parameters set to active jurisdiction context. Let me know if I should compile reports, track suspect movements, or analyze IPC incident logs.";
      }

      addChatMessage(responseText, "ai", citations);
    }, 1500);
  };

  return (
    <div className="w-[300px] bg-bg-surface border-l border-border-subtle flex flex-col h-full shrink-0 select-none font-mono relative">
      {/* Header */}
      <div className="h-12 border-b border-border-subtle flex items-center justify-between px-4 bg-bg-surface-elevated/20 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-4.5 w-4.5 text-brand-accent animate-pulse" />
          <span className="text-[0.6875rem] font-bold text-text-primary tracking-wider">CO-PILOT CONSOLE</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-[0.5625rem] text-brand-accent font-bold">ONLINE</span>
        </div>
      </div>

      {/* Messages Window */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scroll-smooth">
        <AnimatePresence initial={false}>
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col max-w-[85%] gap-1 ${
                msg.sender === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              {/* Sender label */}
              <div className="flex items-center gap-1.5 text-[0.5625rem] font-bold text-text-muted select-none">
                {msg.sender === "ai" ? (
                  <>
                    <Bot className="h-3 w-3 text-brand-accent" />
                    <span>KSP AI</span>
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 text-brand-primary" />
                    <span>ANALYST</span>
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              {/* Message text */}
              <div
                className={`px-3 py-2 text-[0.75rem] font-sans leading-relaxed rounded-md shadow-low select-text selection:bg-brand-accent selection:text-bg-base ${
                  msg.sender === "user"
                    ? "bg-brand-primary text-text-primary border border-brand-primary"
                    : "bg-bg-surface-elevated text-text-primary border border-border-subtle"
                }`}
              >
                {msg.text}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 border-t border-border-subtle pt-1.5 flex flex-col gap-1">
                    <span className="text-[0.5625rem] font-mono text-text-muted flex items-center gap-1">
                      <Layers className="h-2.5 w-2.5 text-brand-accent" /> REFERENCES:
                    </span>
                    {msg.citations.map((c, i) => (
                      <a
                        key={i}
                        href={c.link}
                        className="text-[0.625rem] font-mono text-brand-accent hover:underline flex items-center"
                      >
                        <ChevronRight className="h-3 w-3 shrink-0" /> {c.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex items-center gap-2 self-start bg-bg-surface-elevated border border-border-subtle px-3 py-2 rounded-md">
            <RefreshCw className="h-3 w-3 text-brand-accent animate-spin" />
            <span className="text-[0.625rem] text-text-muted uppercase font-bold tracking-wider animate-pulse">
              ANALYZING METRICS...
            </span>
          </div>
        )}
      </div>

      {/* Preset Chips */}
      <div className="px-3 py-1.5 border-t border-border-subtle bg-bg-surface-elevated/10 shrink-0 flex flex-wrap gap-1">
        {PRESET_QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="text-[0.5625rem] font-mono text-text-secondary border border-border-subtle hover:border-brand-accent hover:text-text-primary px-2 py-1 rounded-sm bg-bg-surface hover:bg-bg-surface-elevated transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Tray */}
      <div className="p-3 border-t border-border-subtle bg-bg-surface-elevated/30 shrink-0 flex gap-2">
        <input
          type="text"
          placeholder="Ask AI Copilot..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend(inputValue);
          }}
          className="flex-1 h-9 bg-bg-surface border border-border-subtle rounded-sm text-[0.75rem] text-text-primary px-3 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all duration-150"
        />
        <button
          onClick={() => handleSend(inputValue)}
          className="h-9 w-9 bg-brand-accent text-bg-base border border-brand-accent hover:bg-brand-accent/80 flex items-center justify-center rounded-sm cursor-pointer shadow-low transition-colors duration-150 active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
