"use client";

import React, { useState, useRef, useEffect } from "react";
import { useKsp } from "@/store/KspContext";
import { Bot, Send, User, ChevronRight, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_QUERIES_MAP: Record<string, string[]> = {
  en: [
    "Verify FIR-890 details & vehicles",
    "Locate suspects in Indiranagar",
    "Generate CAD status dashboard summary",
    "Assess risk in Kalaburagi District"
  ],
  kn: [
    "FIR-890 ವಿವರಗಳು ಮತ್ತು ವಾಹನಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    "ಇಂದಿರಾನಗರದ ಶಂಕಿತರನ್ನು ಪತ್ತೆಹಚ್ಚಿ",
    "CAD ಸ್ಥಿತಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಸಾರಾಂಶವನ್ನು ರಚಿಸಿ",
    "ಕಲಬುರಗಿ ಜಿಲ್ಲೆಯ ಅಪಾಯವನ್ನು ನಿರ್ಣಯಿಸಿ"
  ]
};

export const CopilotSidebar = () => {
  const { copilotOpen, chatMessages, addChatMessage, activeTab, selectedDistrict, logActivity, user, language } = useKsp();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // Load initial AI greeting dynamically on sidebar open
  useEffect(() => {
    const fetchAiGreeting = async () => {
      if (copilotOpen && chatMessages.length === 0) {
        setIsTyping(true);
        try {
          const [dashboardRes, networkRes] = await Promise.allSettled([
            fetch("/api/dashboard"),
            fetch("/api/network")
          ]);

          let dashboardData = null;
          let networkData = null;

          if (dashboardRes.status === "fulfilled" && dashboardRes.value.ok) {
            dashboardData = await dashboardRes.value.json();
          }
          if (networkRes.status === "fulfilled" && networkRes.value.ok) {
            networkData = await networkRes.value.json();
          }

          const contextPayload = {
            activeTab,
            selectedDistrict,
            language,
            user: user ? {
              name: user.name,
              role: user.role,
              clearance: user.clearance,
              badgeId: user.badgeId
            } : null,
            metrics: dashboardData?.metrics || [],
            districtsList: dashboardData?.districtsList || [],
            recentIncidents: dashboardData?.recentIncidents || [],
            networkSummary: networkData ? {
              density: networkData.metrics?.density,
              clustering: networkData.metrics?.clustering,
              gangCount: networkData.metrics?.gangCount,
              avgDegree: networkData.metrics?.avgDegree,
              totalSuspects: networkData.metrics?.totalSuspects,
              totalIncidents: networkData.metrics?.totalIncidents,
              topAccused: networkData.rankings?.activity?.slice(0, 3) || []
            } : null
          };

          const greetingPrompt = language === "kn"
            ? "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಮತ್ತು ಬ್ಯಾಡ್ಜ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ನನ್ನನ್ನು ಸ್ವಾಗತಿಸಿ ಮತ್ತು ಪ್ರಕರಣಗಳ ಮುಖ್ಯಾಂಶಗಳನ್ನು (IPC Cases, complaints, active alerts) ಪಟ್ಟಿ ಮಾಡಿ ಕನ್ನಡದಲ್ಲೇ ಉತ್ತರಿಸಿ."
            : "Hello! Welcome me back to the KSP Crime Command Center by my badge/name, and present a short summary of the key dashboard metrics (IPC Cases, complaints, active alerts) as an introductory checklist.";

          const response = await fetch("/api/copilot-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: greetingPrompt,
              context: contextPayload,
              history: []
            })
          });

          if (response.ok) {
            const data = await response.json();
            addChatMessage(data.result, "ai", data.citations || []);
          } else {
            throw new Error("Failed to load greeting response");
          }
        } catch (err) {
          console.error("Failed to load initial AI greeting:", err);
          const userName = user?.name || "Insp. Rajesh Sharma";
          const userRole = user?.role || "Crime Analyst Lead";
          addChatMessage(`Welcome back, ${userRole} ${userName}. Secure connection active. Ask me to cross-reference suspects, summarize active FIRs, or locate dispatches.`, "ai");
        } finally {
          setIsTyping(false);
        }
      }
    };

    fetchAiGreeting();
  }, [copilotOpen, chatMessages.length]);

  if (!copilotOpen) return null;

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    logActivity(`Queried AI Copilot assistant: "${text}"`);
    addChatMessage(text, "user");
    setInputValue("");
    setIsTyping(true);

    try {
      // Gather active dashboard and network state dynamically
      const [dashboardRes, networkRes] = await Promise.allSettled([
        fetch("/api/dashboard"),
        fetch("/api/network")
      ]);

      let dashboardData = null;
      let networkData = null;

      if (dashboardRes.status === "fulfilled" && dashboardRes.value.ok) {
        dashboardData = await dashboardRes.value.json();
      }
      if (networkRes.status === "fulfilled" && networkRes.value.ok) {
        networkData = await networkRes.value.json();
      }

      // Compile detailed dashboard metrics and network graphs into context
      const contextPayload = {
        activeTab,
        selectedDistrict,
        language,
        user: user ? {
          name: user.name,
          role: user.role,
          clearance: user.clearance,
          badgeId: user.badgeId
        } : null,
        metrics: dashboardData?.metrics || [],
        districtsList: dashboardData?.districtsList || [],
        recentIncidents: dashboardData?.recentIncidents || [],
        networkSummary: networkData ? {
          density: networkData.metrics?.density,
          clustering: networkData.metrics?.clustering,
          gangCount: networkData.metrics?.gangCount,
          avgDegree: networkData.metrics?.avgDegree,
          totalSuspects: networkData.metrics?.totalSuspects,
          totalIncidents: networkData.metrics?.totalIncidents,
          topAccused: networkData.rankings?.activity?.slice(0, 3) || []
        } : null
      };

      // Map chat messages history (prior to this current turn)
      const history = chatMessages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      // Call real Next.js route API
      const response = await fetch("/api/copilot-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          context: contextPayload,
          history
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsTyping(false);
        addChatMessage(data.result, "ai", data.citations || []);
      } else {
        throw new Error("Chat proxy request failed");
      }
    } catch (error) {
      console.error("Failed to query Copilot API:", error);
      setIsTyping(false);
      addChatMessage("Error: Copilot communication link interrupted. Please verify backend connection status.", "ai");
    }
  };

  return (
    <div className="w-[300px] bg-bg-surface border-l border-border-subtle flex flex-col h-full shrink-0 select-none font-mono relative">
      {/* Header */}
      <div className="h-12 border-b border-border-subtle flex items-center justify-between px-4 bg-bg-surface-elevated/20 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-4.5 w-4.5 text-brand-accent animate-pulse" />
          <span className="text-[0.6875rem] font-bold text-text-primary tracking-wider">
            {language === "kn" ? "AI ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಸಹಾಯಕ" : "CO-PILOT CONSOLE"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
          <span className="text-[0.5625rem] text-brand-accent font-bold">
            {language === "kn" ? "ಸಕ್ರಿಯ" : "ONLINE"}
          </span>
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
                    <span>{language === "kn" ? "KSP AI ಬುದ್ಧಿಮತ್ತೆ" : "KSP AI"}</span>
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 text-brand-primary" />
                    <span>{language === "kn" ? "ವಿಶ್ಲೇಷಕರು" : "ANALYST"}</span>
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
                      <Layers className="h-2.5 w-2.5 text-brand-accent" /> {language === "kn" ? "ಉಲ್ಲೇಖಗಳು:" : "REFERENCES:"}
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
              {language === "kn" ? "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." : "ANALYZING METRICS..."}
            </span>
          </div>
        )}
      </div>

      {/* Preset Chips */}
      <div className="px-3 py-1.5 border-t border-border-subtle bg-bg-surface-elevated/10 shrink-0 flex flex-wrap gap-1">
        {(PRESET_QUERIES_MAP[language] || PRESET_QUERIES_MAP.en).map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="text-[0.5625rem] font-mono text-text-secondary border border-border-subtle hover:border-brand-accent hover:text-text-primary px-2 py-1 rounded-sm bg-bg-surface hover:bg-bg-surface-elevated transition-colors text-left cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Tray */}
      <div className="p-3 border-t border-border-subtle bg-bg-surface-elevated/30 shrink-0 flex gap-2">
        <input
          type="text"
          placeholder={language === "kn" ? "AI ಸಹಾಯಕನನ್ನು ಕೇಳಿ..." : "Ask AI Copilot..."}
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
