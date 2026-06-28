"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  citations?: Array<{ title: string; link: string }>;
}

interface KspContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  copilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (text: string, sender?: "user" | "ai", citations?: ChatMessage["citations"]) => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  selectedSuspectId: string | null;
  setSelectedSuspectId: (id: string | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const KspContext = createContext<KspContextType | undefined>(undefined);

export const KspProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All Districts");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [copilotOpen, setCopilotOpen] = useState<boolean>(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "Welcome back, Lead Analyst Sharma. Secure connection active. Ask me to cross-reference suspects, summarize active FIRs, or locate dispatches.",
      timestamp: "11:57 AM"
    }
  ]);

  const addChatMessage = (
    text: string,
    sender: "user" | "ai" = "user",
    citations?: ChatMessage["citations"]
  ) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations
    };
    setChatMessages((prev) => [...prev, newMessage]);
  };

  return (
    <KspContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedDistrict,
        setSelectedDistrict,
        commandPaletteOpen,
        setCommandPaletteOpen,
        copilotOpen,
        setCopilotOpen,
        chatMessages,
        addChatMessage,
        selectedCaseId,
        setSelectedCaseId,
        selectedSuspectId,
        setSelectedSuspectId,
        sidebarCollapsed,
        setSidebarCollapsed
      }}
    >
      {children}
    </KspContext.Provider>
  );
};

export const useKsp = () => {
  const context = useContext(KspContext);
  if (!context) {
    throw new Error("useKsp must be used within a KspProvider");
  }
  return context;
};
