"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  citations?: Array<{ title: string; link: string }>;
}

export interface User {
  badgeId: string;
  name: string;
  role: string;
  clearance: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  badgeId: string;
  officerName: string;
  action: string;
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
  language: "en" | "kn";
  setLanguage: (lang: "en" | "kn") => void;
  
  // Auth & Logging state
  user: User | null;
  activityLogs: ActivityLog[];
  login: (badgeId: string, name: string) => boolean;
  register: (badgeId: string, name: string, role: string, clearance: string) => boolean;
  logout: () => void;
  logActivity: (action: string) => void;
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
  const [language, setLanguage] = useState<"en" | "kn">("en");

  // Auth & Logging State
  const [user, setUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "log-1",
      timestamp: "07:35:10 AM",
      badgeId: "KSP-8812",
      officerName: "Insp. Rajesh Sharma",
      action: "Authenticated session via SCRB Node-04."
    },
    {
      id: "log-2",
      timestamp: "07:42:02 AM",
      badgeId: "KSP-8812",
      officerName: "Insp. Rajesh Sharma",
      action: "Dispatched automated threat grid forecast check."
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

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

  const logActivity = (action: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp,
      badgeId: user?.badgeId || "GUEST",
      officerName: user?.name || "Unauthenticated Guest",
      action
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const login = (badgeId: string, name: string): boolean => {
    const mockUser: User = {
      badgeId: badgeId || "KSP-8812",
      name: name || "Insp. Rajesh Sharma",
      role: "Crime Analyst Lead",
      clearance: "Level 4 (SCRB Admin)"
    };
    setUser(mockUser);
    setChatMessages([]);
    
    // Log activity
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp,
      badgeId: mockUser.badgeId,
      officerName: mockUser.name,
      action: "Officer authenticated session successfully."
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    return true;
  };

  const register = (badgeId: string, name: string, role: string, clearance: string): boolean => {
    const newUser: User = {
      badgeId: badgeId,
      name: name,
      role: role || "Sub-Inspector",
      clearance: clearance || "Level 2 (Precinct Analyst)"
    };
    setUser(newUser);
    setChatMessages([]);
    
    // Log activity
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp,
      badgeId: newUser.badgeId,
      officerName: newUser.name,
      action: `New officer registered & session initialized (${newUser.role}, ${newUser.clearance}).`
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    return true;
  };

  const logout = () => {
    if (user) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        timestamp,
        badgeId: user.badgeId,
        officerName: user.name,
        action: "Officer logged out of session."
      };
      setActivityLogs((prev) => [newLog, ...prev]);
    }
    setUser(null);
    setChatMessages([]);
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
        setSidebarCollapsed,
        language,
        setLanguage,
        user,
        activityLogs,
        login,
        register,
        logout,
        logActivity
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
