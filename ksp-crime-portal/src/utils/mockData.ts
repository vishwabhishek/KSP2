export interface DistrictItem {
  districtName: string;
  clearanceRate: number;
  riskLevel: "High" | "Moderate" | "Low";
  riskStatus: "critical" | "warning" | "success" | "neutral";
  responseScore: number;
  incidentCount: number;
}

export interface CadLog {
  id: string;
  timestamp: string;
  unitId: string;
  location: string;
  eventStatus: "onDuty" | "offDuty" | "dispatched" | "standby" | "emergency";
  latitude: number;
  longitude: number;
}

export interface CaseItem {
  id: string;
  firNumber: string;
  ipcSections: string;
  summaryDescription: string;
  officerName: string;
  daysCounter: number;
  caseSeverity: "level1" | "level2" | "level3" | "level4";
  risk: "low" | "moderate" | "high" | "critical";
  status: "unassigned" | "under-investigation" | "charge-sheet-filed" | "closed";
  district: string;
}

export interface SuspectItem {
  bookingId: string;
  name: string;
  alias: string;
  fingerprintStatus: "Captured" | "Missing" | "Pending";
  irisScanStatus: "Captured" | "Missing" | "Pending";
  riskRating: "low" | "moderate" | "high" | "critical";
  warrantStatus: "Active" | "None" | "Suspended";
  lastKnownLocation: string;
  cases: string[];
  associations: Array<{ name: string; type: string; id: string }>;
  cdrHourlyDistribution: number[];
  coordinateHistory: Array<{ lat: number; lng: number; time: string }>;
}

import karnatakaData from './karnataka_crime_data.json';

export const districtsList: DistrictItem[] = karnatakaData.map((d: any) => {
  const incidentCount = parseInt(d['Total Cognizable IPC crimes'] || "0", 10);
  const clearanceRate = 60 + Math.floor(Math.random() * 30); // Mock clearance rate as it's not in CSV
  let riskLevel: "High" | "Moderate" | "Low" = "Low";
  let riskStatus: "critical" | "warning" | "success" | "neutral" = "success";
  
  if (incidentCount > 5000) {
    riskLevel = "High";
    riskStatus = "critical";
  } else if (incidentCount > 2000) {
    riskLevel = "Moderate";
    riskStatus = "warning";
  }
  
  return {
    districtName: d['District'] === 'Total' ? 'State Total' : d['District'],
    clearanceRate,
    riskLevel,
    riskStatus,
    responseScore: +(4.0 + Math.random() * 4).toFixed(1), // Mock response score
    incidentCount,
  };
});

export const cadLogs: CadLog[] = [
  { id: "cad-1", timestamp: "11:54 AM", unitId: "U-09 (Patrol Car)", location: "Sector 4, Bengaluru East", eventStatus: "emergency", latitude: 12.9796, longitude: 77.6046 },
  { id: "cad-2", timestamp: "11:52 AM", unitId: "U-12 (Intercept Bike)", location: "MG Road, Bengaluru", eventStatus: "dispatched", latitude: 12.9746, longitude: 77.5946 },
  { id: "cad-3", timestamp: "11:48 AM", unitId: "U-04 (Patrol Car)", location: "Malleshwaram Metro", eventStatus: "standby", latitude: 12.9986, longitude: 77.5686 },
  { id: "cad-4", timestamp: "11:45 AM", unitId: "U-15 (QRT Van)", location: "Whitefield Station Bounds", eventStatus: "onDuty", latitude: 12.9696, longitude: 77.7496 },
  { id: "cad-5", timestamp: "11:40 AM", unitId: "U-21 (Intercept Bike)", location: "Hebbal Flyover Junction", eventStatus: "dispatched", latitude: 13.0356, longitude: 77.5976 }
];

export const crimeTrendData = [
  { name: "06/19", Theft: 42, Assault: 18, Fraud: 24, Cyber: 12 },
  { name: "06/20", Theft: 38, Assault: 22, Fraud: 28, Cyber: 15 },
  { name: "06/21", Theft: 45, Assault: 15, Fraud: 32, Cyber: 19 },
  { name: "06/22", Theft: 52, Assault: 29, Fraud: 26, Cyber: 25 },
  { name: "06/23", Theft: 49, Assault: 21, Fraud: 35, Cyber: 32 },
  { name: "06/24", Theft: 55, Assault: 26, Fraud: 41, Cyber: 38 },
  { name: "06/25", Theft: 61, Assault: 31, Fraud: 39, Cyber: 45 }
];

export const casesList: CaseItem[] = [
  {
    id: "FIR-890",
    firNumber: "FIR-2026/0890",
    ipcSections: "Sec 379/411 IPC (Theft & Receiving stolen goods)",
    summaryDescription: "Series of coordinate luxury sedan thefts from tech corridor parking grids in East Bengaluru.",
    officerName: "Inspector R. N. Gowda",
    daysCounter: 14,
    caseSeverity: "level3",
    risk: "high",
    status: "under-investigation",
    district: "Bengaluru City"
  },
  {
    id: "FIR-902",
    firNumber: "FIR-2026/0902",
    ipcSections: "Sec 420/406 IPC (Financial Cheat & Breach of Trust)",
    summaryDescription: "Mock investment fund targeting senior bureaucrats in Central Zone. Est. value INR 4.5 Cr.",
    officerName: "ACP Shridhar Murthy",
    daysCounter: 21,
    caseSeverity: "level2",
    risk: "moderate",
    status: "under-investigation",
    district: "Bengaluru City"
  },
  {
    id: "FIR-911",
    firNumber: "FIR-2026/0911",
    ipcSections: "Sec 302/120B IPC (Murder & Criminal Conspiracy)",
    summaryDescription: "Gang rivalry assault near KR Puram. Primary victim deceased. Surveillance footage flagged.",
    officerName: "Inspector S. S. Patil",
    daysCounter: 2,
    caseSeverity: "level4",
    risk: "critical",
    status: "unassigned",
    district: "Bengaluru City"
  },
  {
    id: "FIR-761",
    firNumber: "FIR-2026/0761",
    ipcSections: "Sec 43(g) IT Act / Sec 66 IT Act (Cyber Intrusion)",
    summaryDescription: "Phishing bypass of cooperative municipal bank server nodes in Chikkaballapura.",
    officerName: "DSP Rekha Hegde",
    daysCounter: 32,
    caseSeverity: "level3",
    risk: "high",
    status: "charge-sheet-filed",
    district: "Chikkaballapura"
  },
  {
    id: "FIR-542",
    firNumber: "FIR-2026/0542",
    ipcSections: "Sec 384/386 IPC (Extortion)",
    summaryDescription: "Shakedown calls to builders in Mangaluru port boundary area. Suspicion on foreign VOIP numbers.",
    officerName: "Inspector Suresh Naik",
    daysCounter: 45,
    caseSeverity: "level3",
    risk: "high",
    status: "closed",
    district: "Mangaluru City"
  }
];

export const suspectsList: SuspectItem[] = [
  {
    bookingId: "KSP-9087-A",
    name: "Vikram 'Vicky' Gowda",
    alias: "Vicky Bhai",
    fingerprintStatus: "Captured",
    irisScanStatus: "Captured",
    riskRating: "critical",
    warrantStatus: "Active",
    lastKnownLocation: "Indiranagar, Sector 2",
    cases: ["FIR-890", "FIR-911"],
    associations: [
      { name: "K. R. Kumar (Mechanic)", type: "Co-accused", id: "KSP-4311-B" },
      { name: "R. Shetty (Logistics)", type: "Transporter", id: "KSP-1192-A" },
      { name: "FIR-890 (Sedan Theft)", type: "Linked Crime", id: "FIR-890" }
    ],
    cdrHourlyDistribution: [5, 2, 0, 0, 1, 3, 12, 22, 18, 14, 15, 18, 26, 32, 28, 22, 19, 35, 42, 48, 52, 38, 22, 10],
    coordinateHistory: [
      { lat: 12.9786, lng: 77.6406, time: "09:00 AM" },
      { lat: 12.9826, lng: 77.6486, time: "10:30 AM" },
      { lat: 12.9716, lng: 77.6206, time: "01:15 PM" }
    ]
  },
  {
    bookingId: "KSP-4311-B",
    name: "Karan R. Kumar",
    alias: "Munna",
    fingerprintStatus: "Captured",
    irisScanStatus: "Pending",
    riskRating: "moderate",
    warrantStatus: "None",
    lastKnownLocation: "Kalasipalyam Garage Grid",
    cases: ["FIR-890"],
    associations: [
      { name: "Vikram Gowda", type: "Boss", id: "KSP-9087-A" }
    ],
    cdrHourlyDistribution: [2, 0, 0, 0, 0, 1, 8, 12, 14, 16, 12, 15, 19, 14, 15, 12, 22, 31, 24, 18, 15, 12, 8, 4],
    coordinateHistory: [
      { lat: 12.9616, lng: 77.5806, time: "08:15 AM" },
      { lat: 12.9626, lng: 77.5816, time: "05:45 PM" }
    ]
  }
];

export const stationsList = [
  { name: "East Bengaluru Police Station", lat: 12.9816, lng: 77.6406, avgResponseTime: 4.2, onDutyStaff: 32, activeVehicles: 8, pendingCases: 112 },
  { name: "MG Road Central Control", lat: 12.9746, lng: 77.5946, avgResponseTime: 3.5, onDutyStaff: 48, activeVehicles: 12, pendingCases: 95 },
  { name: "Malleshwaram Substation", lat: 12.9986, lng: 77.5686, avgResponseTime: 5.1, onDutyStaff: 18, activeVehicles: 4, pendingCases: 54 },
  { name: "Whitefield Ingest Post", lat: 12.9696, lng: 77.7496, avgResponseTime: 6.2, onDutyStaff: 22, activeVehicles: 6, pendingCases: 89 }
];

export const timelineEvents = [
  { eventTitle: "09:00 AM - GPS Ping Registered", eventDetails: "Vicky Bhai cellphone IMEI pinged cellular tower node T-Indira-04.", eventTime: "09:00 AM", eventSeverity: "level2", lat: 12.9786, lng: 77.6406 },
  { eventTitle: "10:30 AM - CCTV Vehicle Match", eventDetails: "Automated license recognition camera caught stolen Honda City matching FIR-890 bounds.", eventTime: "10:30 AM", eventSeverity: "level3", lat: 12.9826, lng: 77.6486 },
  { eventTitle: "01:15 PM - Target Checkpoint Bypass", eventDetails: "Target phone registered cell handoff near Halasuru crossing. Deployed Unit 12 for surveillance.", eventTime: "01:15 PM", eventSeverity: "level4", lat: 12.9716, lng: 77.6206 }
];

export const evidenceVault = {
  directories: ["FIR-890 Documents", "CCTV Video Feeds", "Forensic Data Pagers", "CDR Raw Logs"],
  files: [
    { fileName: "vehicle_plate_match_halli.png", fileSize: "1.4 MB", checksumHash: "e5792a7e7811bf12", fileCategory: "Image", custodyStatus: "Secure in Locker" },
    { fileName: "tower_dump_crossing_raw.csv", fileSize: "12.8 MB", checksumHash: "f1a288ab29c01192", fileCategory: "Data File", custodyStatus: "Verified Hash" },
    { fileName: "interrogation_audio_vicky.mp3", fileSize: "44.2 MB", checksumHash: "6c2b12f718aa0011", fileCategory: "Audio File", custodyStatus: "Encrypted Vault" },
    { fileName: "charging_sheet_final_draft.pdf", fileSize: "840 KB", checksumHash: "a90188ef771239aa", fileCategory: "PDF Document", custodyStatus: "Signed Digital Certificate" }
  ]
};

export const vertexGraphMesh = {
  nodes: [
    { id: "node-vicky", type: "Suspect", label: "Vikram Gowda (Vicky)" },
    { id: "node-munna", type: "Suspect", label: "Karan R. Kumar (Munna)" },
    { id: "node-car", type: "Vehicle", label: "Black Sedan KA-03-MR-9801" },
    { id: "node-phone", type: "Phone", label: "+91-98744-12903" },
    { id: "node-crossing", type: "Location", label: "Halasuru Intersection Checkpost" }
  ],
  edges: [
    { id: "edge-1", source: "node-vicky", target: "node-munna", relation: "confirmed" },
    { id: "edge-2", source: "node-vicky", target: "node-phone", relation: "confirmed" },
    { id: "edge-3", source: "node-munna", target: "node-car", relation: "suspected" },
    { id: "edge-4", source: "node-phone", target: "node-crossing", relation: "call-relation" },
    { id: "edge-5", source: "node-car", target: "node-crossing", relation: "suspected" }
  ]
};
