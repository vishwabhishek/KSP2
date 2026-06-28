import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  
  try {
    const res = await fetch(`${backendUrl}/api/v1/network`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    } else {
      throw new Error("FastAPI Backend returned an error status");
    }
  } catch (e) {
    console.warn("FastAPI backend network endpoint unreachable. Using mock network.", e);
    
    // Rich mock network of suspects, cases, victims, and recurring locations
    const nodes = [
      // Suspects
      {
        id: "suspect-Vikram Gowda",
        data: {
          label: "SUSPECT: Vikram Gowda",
          name: "Vikram Gowda",
          alias: "Vicky Bhai",
          type: "Suspect",
          community: "Gang Clique-A",
          pagerank: 0.482,
          betweenness: 0.625,
          degree: 5,
          cases: ["FIR/0012/2026", "FIR/0013/2026"],
          riskRating: "critical",
          warrantStatus: "Active",
          fingerprintStatus: "Captured",
          irisScanStatus: "Captured",
          lastKnownLocation: "Indiranagar Sector 2",
          modus_operandi: "Luxury key-fob jammer signal bypass; rapid transport coordinator."
        },
        position: { x: 150, y: 150 },
        style: { width: 160 }
      },
      {
        id: "suspect-Karan R. Kumar",
        data: {
          label: "SUSPECT: Karan R. Kumar",
          name: "Karan R. Kumar",
          alias: "Munna (Mechanic)",
          type: "Suspect",
          community: "Gang Clique-A",
          pagerank: 0.321,
          betweenness: 0.182,
          degree: 3,
          cases: ["FIR/0012/2026"],
          riskRating: "high",
          warrantStatus: "None",
          fingerprintStatus: "Captured",
          irisScanStatus: "Pending",
          lastKnownLocation: "Kalasipalyam Garage Grid",
          modus_operandi: "Chassis decryption and GPS signal blocker setup."
        },
        position: { x: 120, y: 320 },
        style: { width: 160 }
      },
      {
        id: "suspect-R. Shetty",
        data: {
          label: "SUSPECT: R. Shetty",
          name: "R. Shetty",
          alias: "Raju Transporter",
          type: "Suspect",
          community: "Gang Clique-A",
          pagerank: 0.285,
          betweenness: 0.115,
          degree: 3,
          cases: ["FIR/0015/2026"],
          riskRating: "moderate",
          warrantStatus: "Active",
          fingerprintStatus: "Captured",
          irisScanStatus: "Captured",
          lastKnownLocation: "Mangaluru Dockyard",
          modus_operandi: "Inter-district logistics smuggling routes via maritime docks."
        },
        position: { x: 260, y: 380 },
        style: { width: 160 }
      },
      {
        id: "suspect-Munna Bhai",
        data: {
          label: "SUSPECT: Munna Bhai",
          name: "Munna Bhai",
          alias: "Shyam Sundar",
          type: "Suspect",
          community: "Gang Clique-B",
          pagerank: 0.395,
          betweenness: 0.412,
          degree: 4,
          cases: ["FIR/0013/2026", "FIR/0015/2026"],
          riskRating: "critical",
          warrantStatus: "Active",
          fingerprintStatus: "Pending",
          irisScanStatus: "Missing",
          lastKnownLocation: "KR Puram Bypass",
          modus_operandi: "Twilight highway vehicle interception and extortion intimidation."
        },
        position: { x: 200, y: 520 },
        style: { width: 160 }
      },
      {
        id: "suspect-Shakir Ahmed",
        data: {
          label: "SUSPECT: Shakir Ahmed",
          name: "Shakir Ahmed",
          alias: "Cyber Hacker",
          type: "Suspect",
          community: "Gang Clique-C",
          pagerank: 0.218,
          betweenness: 0.045,
          degree: 2,
          cases: ["FIR/0014/2026"],
          riskRating: "high",
          warrantStatus: "None",
          fingerprintStatus: "Captured",
          irisScanStatus: "Captured",
          lastKnownLocation: "Whitefield Tech Corridor",
          modus_operandi: "Bank transaction bypass and credentials spoofing."
        },
        position: { x: 100, y: 680 },
        style: { width: 160 }
      },

      // Incidents/Cases
      {
        id: "incident-FIR/0012/2026",
        data: {
          label: "CASE: FIR/0012/2026",
          fir_number: "FIR/0012/2026",
          police_station: "Indiranagar Station",
          district: "Bengaluru City",
          timestamp: "2026-06-25T14:30:00",
          modus_operandi: "Luxury sedan vehicle stolen from shopping arcade.",
          type: "Incident"
        },
        position: { x: 500, y: 200 },
        style: { width: 170 }
      },
      {
        id: "incident-FIR/0013/2026",
        data: {
          label: "CASE: FIR/0013/2026",
          fir_number: "FIR/0013/2026",
          police_station: "KR Puram Station",
          district: "Bengaluru City",
          timestamp: "2026-06-26T21:15:00",
          modus_operandi: "Assault and highway hijacking of transport carrier.",
          type: "Incident"
        },
        position: { x: 500, y: 400 },
        style: { width: 170 }
      },
      {
        id: "incident-FIR/0014/2026",
        data: {
          label: "CASE: FIR/0014/2026",
          fir_number: "FIR/0014/2026",
          police_station: "Chikkaballapura Town PS",
          district: "Chikkaballapura",
          timestamp: "2026-06-27T09:45:00",
          modus_operandi: "Digital intrusion bypassing municipal bank server portal.",
          type: "Incident"
        },
        position: { x: 500, y: 580 },
        style: { width: 170 }
      },
      {
        id: "incident-FIR/0015/2026",
        data: {
          label: "CASE: FIR/0015/2026",
          fir_number: "FIR/0015/2026",
          police_station: "Mangaluru Port PS",
          district: "Mangaluru City",
          timestamp: "2026-06-27T23:50:00",
          modus_operandi: "Extortion intimidation and shakedown at shipyard docks.",
          type: "Incident"
        },
        position: { x: 500, y: 760 },
        style: { width: 170 }
      },

      // Victims
      {
        id: "victim-Ramesh Kumar",
        data: {
          label: "VICTIM: Ramesh Kumar",
          name: "Ramesh Kumar",
          type: "Victim",
          cases: ["FIR/0012/2026"],
          description: "Owner of stolen luxury sedan."
        },
        position: { x: 800, y: 150 },
        style: { width: 140 }
      },
      {
        id: "victim-Ji-Woo Park",
        data: {
          label: "VICTIM: Ji-Woo Park",
          name: "Ji-Woo Park",
          type: "Victim",
          cases: ["FIR/0013/2026"],
          description: "International logistics dispatcher."
        },
        position: { x: 800, y: 350 },
        style: { width: 140 }
      },
      {
        id: "victim-Bank Manager Rao",
        data: {
          label: "VICTIM: Bank Manager Rao",
          name: "Bank Manager Rao",
          type: "Victim",
          cases: ["FIR/0014/2026"],
          description: "Cooperative bank nodal administrator."
        },
        position: { x: 800, y: 550 },
        style: { width: 140 }
      },
      {
        id: "victim-K. Pai",
        data: {
          label: "VICTIM: K. Pai",
          name: "K. Pai",
          type: "Victim",
          cases: ["FIR/0015/2026"],
          description: "Dockyard logistics warehouse owner."
        },
        position: { x: 800, y: 750 },
        style: { width: 140 }
      },

      // Recurring Locations
      {
        id: "location-Indiranagar Metro",
        data: {
          label: "LOCATION: Indiranagar Metro",
          name: "Indiranagar Metro Station",
          type: "Location",
          cases: ["FIR/0012/2026"],
          description: "Recurring snatching and luxury vehicle parking breach zone."
        },
        position: { x: 380, y: 80 },
        style: { width: 150 }
      },
      {
        id: "location-Kalasipalyam",
        data: {
          label: "LOCATION: Kalasipalyam Yard",
          name: "Kalasipalyam Garage Grid",
          type: "Location",
          cases: ["FIR/0012/2026"],
          description: "Recurring fencing depot for vehicle teardown."
        },
        position: { x: 380, y: 280 },
        style: { width: 150 }
      },
      {
        id: "location-KR Puram Bypass",
        data: {
          label: "LOCATION: KR Puram Bypass",
          name: "KR Puram Bypass Highway",
          type: "Location",
          cases: ["FIR/0013/2026"],
          description: "Twilight carrier interception risk corridor."
        },
        position: { x: 380, y: 460 },
        style: { width: 150 }
      },
      {
        id: "location-Whitefield Tech",
        data: {
          label: "LOCATION: Whitefield Corridor",
          name: "Whitefield Tech Corridor",
          type: "Location",
          cases: ["FIR/0014/2026"],
          description: "Cyber threat targeting center."
        },
        position: { x: 380, y: 640 },
        style: { width: 150 }
      },
      {
        id: "location-Mangaluru Dockyard",
        data: {
          label: "LOCATION: Mangaluru Dockyard",
          name: "Mangaluru Dockyard Area",
          type: "Location",
          cases: ["FIR/0015/2026"],
          description: "Smuggling transshipment fencing point."
        },
        position: { x: 380, y: 820 },
        style: { width: 150 }
      }
    ];

    const edges = [
      // Suspect Case Linkages (Accused)
      {
        id: "edge-suspect-Vikram Gowda-incident-FIR/0012/2026",
        source: "suspect-Vikram Gowda",
        target: "incident-FIR/0012/2026",
        label: "ACCUSED",
        style: { stroke: "#ef4444", strokeWidth: 2 },
        labelStyle: { fill: "#f87171", fontSize: 8, fontFamily: "monospace" },
        animated: true
      },
      {
        id: "edge-suspect-Vikram Gowda-incident-FIR/0013/2026",
        source: "suspect-Vikram Gowda",
        target: "incident-FIR/0013/2026",
        label: "ACCUSED",
        style: { stroke: "#ef4444", strokeWidth: 2 },
        labelStyle: { fill: "#f87171", fontSize: 8, fontFamily: "monospace" },
        animated: true
      },
      {
        id: "edge-suspect-Karan R. Kumar-incident-FIR/0012/2026",
        source: "suspect-Karan R. Kumar",
        target: "incident-FIR/0012/2026",
        label: "ACCUSED",
        style: { stroke: "#ef4444", strokeWidth: 2 },
        labelStyle: { fill: "#f87171", fontSize: 8, fontFamily: "monospace" },
        animated: true
      },
      {
        id: "edge-suspect-R. Shetty-incident-FIR/0015/2026",
        source: "suspect-R. Shetty",
        target: "incident-FIR/0015/2026",
        label: "ACCUSED",
        style: { stroke: "#ef4444", strokeWidth: 2 },
        labelStyle: { fill: "#f87171", fontSize: 8, fontFamily: "monospace" },
        animated: true
      },
      {
        id: "edge-suspect-Munna Bhai-incident-FIR/0013/2026",
        source: "suspect-Munna Bhai",
        target: "incident-FIR/0013/2026",
        label: "ACCUSED",
        style: { stroke: "#ef4444", strokeWidth: 2 },
        labelStyle: { fill: "#f87171", fontSize: 8, fontFamily: "monospace" },
        animated: true
      },
      {
        id: "edge-suspect-Munna Bhai-incident-FIR/0015/2026",
        source: "suspect-Munna Bhai",
        target: "incident-FIR/0015/2026",
        label: "ACCUSED",
        style: { stroke: "#ef4444", strokeWidth: 2 },
        labelStyle: { fill: "#f87171", fontSize: 8, fontFamily: "monospace" },
        animated: true
      },
      {
        id: "edge-suspect-Shakir Ahmed-incident-FIR/0014/2026",
        source: "suspect-Shakir Ahmed",
        target: "incident-FIR/0014/2026",
        label: "ACCUSED",
        style: { stroke: "#ef4444", strokeWidth: 2 },
        labelStyle: { fill: "#f87171", fontSize: 8, fontFamily: "monospace" },
        animated: true
      },

      // Victim Case Linkages
      {
        id: "edge-entity-Ramesh Kumar-incident-FIR/0012/2026",
        source: "victim-Ramesh Kumar",
        target: "incident-FIR/0012/2026",
        label: "VICTIM",
        style: { stroke: "#34d399", strokeWidth: 2 },
        labelStyle: { fill: "#34d399", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-entity-Ji-Woo Park-incident-FIR/0013/2026",
        source: "victim-Ji-Woo Park",
        target: "incident-FIR/0013/2026",
        label: "VICTIM",
        style: { stroke: "#34d399", strokeWidth: 2 },
        labelStyle: { fill: "#34d399", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-entity-Bank Manager Rao-incident-FIR/0014/2026",
        source: "victim-Bank Manager Rao",
        target: "incident-FIR/0014/2026",
        label: "VICTIM",
        style: { stroke: "#34d399", strokeWidth: 2 },
        labelStyle: { fill: "#34d399", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-entity-K. Pai-incident-FIR/0015/2026",
        source: "victim-K. Pai",
        target: "incident-FIR/0015/2026",
        label: "VICTIM",
        style: { stroke: "#34d399", strokeWidth: 2 },
        labelStyle: { fill: "#34d399", fontSize: 8, fontFamily: "monospace" }
      },

      // Incident Location Linkages
      {
        id: "edge-location-FIR/0012/2026-Indiranagar Metro",
        source: "location-Indiranagar Metro",
        target: "incident-FIR/0012/2026",
        label: "CRIME_LOC",
        style: { stroke: "#c084fc", strokeWidth: 1.5 },
        labelStyle: { fill: "#c084fc", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-location-FIR/0012/2026-Kalasipalyam",
        source: "location-Kalasipalyam",
        target: "incident-FIR/0012/2026",
        label: "FENCED_LOC",
        style: { stroke: "#c084fc", strokeWidth: 1.5 },
        labelStyle: { fill: "#c084fc", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-location-FIR/0013/2026-KR Puram Bypass",
        source: "location-KR Puram Bypass",
        target: "incident-FIR/0013/2026",
        label: "CRIME_LOC",
        style: { stroke: "#c084fc", strokeWidth: 1.5 },
        labelStyle: { fill: "#c084fc", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-location-FIR/0014/2026-Whitefield Tech",
        source: "location-Whitefield Tech",
        target: "incident-FIR/0014/2026",
        label: "CRIME_LOC",
        style: { stroke: "#c084fc", strokeWidth: 1.5 },
        labelStyle: { fill: "#c084fc", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-location-FIR/0015/2026-Mangaluru Dockyard",
        source: "location-Mangaluru Dockyard",
        target: "incident-FIR/0015/2026",
        label: "CRIME_LOC",
        style: { stroke: "#c084fc", strokeWidth: 1.5 },
        labelStyle: { fill: "#c084fc", fontSize: 8, fontFamily: "monospace" }
      },

      // Suspect-Location Operator Linkages
      {
        id: "edge-location-Karan-Kalasipalyam",
        source: "suspect-Karan R. Kumar",
        target: "location-Kalasipalyam",
        label: "OPERATES",
        style: { stroke: "#a855f7", strokeWidth: 1.5, strokeDasharray: "2 2" },
        labelStyle: { fill: "#c084fc", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-location-Shetty-Mangaluru",
        source: "suspect-R. Shetty",
        target: "location-Mangaluru Dockyard",
        label: "OPERATES",
        style: { stroke: "#a855f7", strokeWidth: 1.5, strokeDasharray: "2 2" },
        labelStyle: { fill: "#c084fc", fontSize: 8, fontFamily: "monospace" }
      },

      // Co-offender relationships
      {
        id: "edge-cooffend-Vikram Gowda-Karan R. Kumar",
        source: "suspect-Vikram Gowda",
        target: "suspect-Karan R. Kumar",
        label: "CO-OFFEND (3)",
        style: { stroke: "#ea580c", strokeWidth: 3, strokeDasharray: "5 5" },
        labelStyle: { fill: "#fb923c", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-cooffend-Vikram Gowda-R. Shetty",
        source: "suspect-Vikram Gowda",
        target: "suspect-R. Shetty",
        label: "CO-OFFEND (2)",
        style: { stroke: "#ea580c", strokeWidth: 2.5, strokeDasharray: "5 5" },
        labelStyle: { fill: "#fb923c", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-cooffend-Munna Bhai-R. Shetty",
        source: "suspect-Munna Bhai",
        target: "suspect-R. Shetty",
        label: "CO-OFFEND (1)",
        style: { stroke: "#ea580c", strokeWidth: 2, strokeDasharray: "5 5" },
        labelStyle: { fill: "#fb923c", fontSize: 8, fontFamily: "monospace" }
      },

      // Behavioral / MO Similarity
      {
        id: "edge-behavioral-Vikram Gowda-Munna Bhai",
        source: "suspect-Vikram Gowda",
        target: "suspect-Munna Bhai",
        label: "MO SIMILAR (0.45)",
        style: { stroke: "#f59e0b", strokeWidth: 1.5, strokeDasharray: "3 3" },
        labelStyle: { fill: "#fbbf24", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-behavioral-Karan-Shakir",
        source: "suspect-Karan R. Kumar",
        target: "suspect-Shakir Ahmed",
        label: "MO SIMILAR (0.30)",
        style: { stroke: "#f59e0b", strokeWidth: 1.5, strokeDasharray: "3 3" },
        labelStyle: { fill: "#fbbf24", fontSize: 8, fontFamily: "monospace" }
      },

      // Predicted link
      {
        id: "edge-predicted-Vikram Gowda-Munna Bhai",
        source: "suspect-Vikram Gowda",
        target: "suspect-Munna Bhai",
        label: "SNA PRED (0.52)",
        style: { stroke: "#ec4899", strokeWidth: 1.5, strokeDasharray: "1 3" },
        labelStyle: { fill: "#f472b6", fontSize: 8, fontFamily: "monospace" }
      },
      {
        id: "edge-predicted-Shakir-Vikram Gowda",
        source: "suspect-Shakir Ahmed",
        target: "suspect-Vikram Gowda",
        label: "SNA PRED (0.38)",
        style: { stroke: "#ec4899", strokeWidth: 1.5, strokeDasharray: "1 3" },
        labelStyle: { fill: "#f472b6", fontSize: 8, fontFamily: "monospace" }
      }
    ];

    return NextResponse.json({
      status: "mock",
      nodes,
      edges,
      metrics: {
        density: 0.185,
        clustering: 0.32,
        gangCount: 3,
        avgDegree: 3.1,
        totalSuspects: 5,
        totalIncidents: 4
      },
      rankings: {
        influence: [
          { name: "Vikram Gowda", score: 0.482 },
          { name: "Munna Bhai", score: 0.395 },
          { name: "Karan R. Kumar", score: 0.321 },
          { name: "R. Shetty", score: 0.285 },
          { name: "Shakir Ahmed", score: 0.218 }
        ],
        brokerage: [
          { name: "Vikram Gowda", score: 0.625 },
          { name: "Munna Bhai", score: 0.412 },
          { name: "Karan R. Kumar", score: 0.182 },
          { name: "R. Shetty", score: 0.115 },
          { name: "Shakir Ahmed", score: 0.045 }
        ],
        activity: [
          { name: "Vikram Gowda", score: 5 },
          { name: "Munna Bhai", score: 4 },
          { name: "Karan R. Kumar", score: 3 },
          { name: "R. Shetty", score: 3 },
          { name: "Shakir Ahmed", score: 2 }
        ]
      },
      communities: [
        { id: "gang-0", name: "Gang Clique-A", members: ["Vikram Gowda", "Karan R. Kumar", "R. Shetty"] },
        { id: "gang-1", name: "Gang Clique-B", members: ["Munna Bhai"] },
        { id: "gang-2", name: "Gang Clique-C", members: ["Shakir Ahmed"] }
      ],
      predictedLinks: [
        { source: "Vikram Gowda", target: "Munna Bhai", score: 0.52 },
        { source: "Shakir Ahmed", target: "Vikram Gowda", score: 0.38 }
      ],
      behavioralMatches: [
        { source: "Vikram Gowda", target: "Munna Bhai", score: 0.45 },
        { source: "Karan R. Kumar", target: "Shakir Ahmed", score: 0.30 }
      ]
    });
  }
}
