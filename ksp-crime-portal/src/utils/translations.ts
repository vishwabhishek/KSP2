export const translations = {
  en: {
    // Sidebar items
    dashboard: "Dashboard Core",
    hotspot: "Hotspot Forecast",
    districts: "District Caseload",
    officer: "Officer Telemetry",
    copilot: "AI Assistant",
    settings: "Settings Admin",
    
    // Navbar
    jurisdiction: "Jurisdiction",
    all_districts: "ALL DISTRICTS",
    copilot_btn: "KSP CO-PILOT",
    badge: "BADGE",
    disconnect: "Disconnect Session",
    
    // General terms / labels
    active_ipc_cases: "Active IPC Cases",
    historical_complaints: "Historical Complaints",
    critical_alerts: "Critical Alerts",
    complaints_against_police: "Complaints Against Police",
    system_status: "SYSTEM STATUS",
    operational: "OPERATIONAL",
    
    // Dashboard actions & sections
    realtime_dispatch_feed: "REAL-TIME DISPATCH INTEL FEED",
    proactive_patrol: "PROACTIVE PATROL DISPATCH",
    classification_filter: "CLASSIFICATION FILTER",
    severity: "SEVERITY",
    dispatch_force: "DISPATCH FORCE UNIT",
    analyzing: "ANALYZING...",
    
    // Network Analysis
    co_offending_network: "Co-Offending Network Intelligence",
    nodes: "Nodes",
    edges: "Edges",
    influence_rank: "Influence Rank",
    brokerage_rank: "Brokerage Rank",
    active_communities: "Active Communities",
    predicted_linkages: "AI Predicted Linkages"
  },
  kn: {
    // Sidebar items
    dashboard: "ಮುಖಪುಟ / ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    hotspot: "ಹಾಟ್‌ಸ್ಪಾಟ್ ಮುನ್ಸೂಚನೆ",
    districts: "ಜಿಲ್ಲಾವಾರು ಪ್ರಕರಣಗಳು",
    officer: "ಅಧಿಕಾರಿ ಟೆಲಿಮೆಟ್ರಿ",
    copilot: "AI ಸಹಾಯಕ",
    settings: "ಸಂಯೋಜನೆಗಳು ಮತ್ತು ನಿರ್ವರಣೆ",
    
    // Navbar
    jurisdiction: "ನ್ಯಾಯವ್ಯಾಪ್ತಿ",
    all_districts: "ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು",
    copilot_btn: "KSP ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಸಹಾಯಕ",
    badge: "ಬ್ಯಾಡ್ಜ್ ಸಂಖ್ಯೆ",
    disconnect: "ಲಾಗ್ ಔಟ್ ಮಾಡಿ",
    
    // General terms / labels
    active_ipc_cases: "ಸಕ್ರಿಯ ಐಪಿಸಿ ಪ್ರಕರಣಗಳು",
    historical_complaints: "ಐತಿಹಾಸಿಕ ದೂರುಗಳು",
    critical_alerts: "ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು",
    complaints_against_police: "ಪೊಲೀಸರ ಮೇಲಿನ ದೂರುಗಳು",
    system_status: "ವ್ಯವಸ್ಥೆಯ ಸ್ಥಿತಿ",
    operational: "ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ",
    
    // Dashboard actions & sections
    realtime_dispatch_feed: "ನೈಜ-ಸಮಯದ ನಿಯೋಜನೆ ಮಾಹಿತಿ ಫೀಡ್",
    proactive_patrol: "ಸಕ್ರಿಯ ಗಸ್ತು ಪಡೆ ನಿಯೋಜನೆ",
    classification_filter: "ವರ್ಗೀಕರಣ ಶೋಧಕ",
    severity: "ಗಂಭೀರತೆ",
    dispatch_force: "ಪೊಲೀಸ್ ಘಟಕವನ್ನು ನಿಯೋಜಿಸಿ",
    analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    
    // Network Analysis
    co_offending_network: "ಸಹ-ಅಪರಾಧಿಗಳ ಜಾಲದ ಮಾಹಿತಿ",
    nodes: "ನೋಡ್‌ಗಳು",
    edges: "ಲಿಂಕ್‌ಗಳು",
    influence_rank: "ಪ್ರಭಾವದ ಶ್ರೇಣಿ",
    brokerage_rank: "ಮಧ್ಯಸ್ಥಿಕೆ ಶ್ರೇಣಿ",
    active_communities: "ಸಕ್ರಿಯ ಗ್ಯಾಂಗ್ ಗುಂಪುಗಳು",
    predicted_linkages: "AI ಅಂದಾಜಿಸಿದ ಅಪರಾಧ ಲಿಂಕ್‌ಗಳು"
  }
};

export type Language = "en" | "kn";

export const useTranslation = (lang: Language) => {
  return (key: keyof typeof translations.en) => {
    return translations[lang][key] || translations.en[key] || key;
  };
};
