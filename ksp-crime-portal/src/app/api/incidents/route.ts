import { NextResponse } from 'next/server';
import { casesList } from '@/utils/mockData';

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  try {
    const res = await fetch(`${backendUrl}/api/v1/incidents?page=1&limit=500`, {
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (e) {
    console.warn("FastAPI backend incidents endpoint unreachable. Falling back to mock incidents.", e);
  }

  // Fallback structure mirroring FastAPI response
  const fallbackIncidents = [
    {
      id: "FIR-890",
      fir_number: "FIR-2026/0890",
      district: "Bengaluru City",
      police_station: "Indiranagar PS",
      timestamp: "2026-06-28T09:00:00Z",
      latitude: 12.9786,
      longitude: 77.6406,
      ipc_sections: "Sec 379/411 IPC",
      modus_operandi_text: "Series of coordinate luxury sedan thefts from tech corridor parking grids in East Bengaluru.",
      processed: true,
      entities: [{ name: "Vikram Gowda", type: "Suspect" }, { name: "Karan R. Kumar", type: "Suspect" }]
    },
    {
      id: "FIR-902",
      fir_number: "FIR-2026/0902",
      district: "Bengaluru City",
      police_station: "Jayanagar PS",
      timestamp: "2026-06-28T10:30:00Z",
      latitude: 12.9307,
      longitude: 77.5802,
      ipc_sections: "Sec 420/406 IPC",
      modus_operandi_text: "Mock investment fund targeting senior bureaucrats in Central Zone. Est. value INR 4.5 Cr.",
      processed: true,
      entities: [{ name: "Karan R. Kumar", type: "Suspect" }]
    },
    {
      id: "FIR-911",
      fir_number: "FIR-2026/0911",
      district: "Bengaluru City",
      police_station: "KR Puram PS",
      timestamp: "2026-06-28T01:15:00Z",
      latitude: 12.9716,
      longitude: 77.6206,
      ipc_sections: "Sec 302/120B IPC",
      modus_operandi_text: "Gang rivalry assault near KR Puram. Primary victim deceased.",
      processed: false,
      entities: [{ name: "Vikram Gowda", type: "Suspect" }]
    },
    {
      id: "FIR-761",
      fir_number: "FIR-2026/0761",
      district: "Chikkaballapura",
      police_station: "Chikkaballapura Town PS",
      timestamp: "2026-06-25T14:45:00Z",
      latitude: 13.4354,
      longitude: 77.7297,
      ipc_sections: "Sec 43 IT Act / Sec 66 IT Act",
      modus_operandi_text: "Phishing bypass of cooperative municipal bank server nodes in Chikkaballapura.",
      processed: true,
      entities: [{ name: "Vikram Gowda", type: "Suspect" }]
    },
    {
      id: "FIR-542",
      fir_number: "FIR-2026/0542",
      district: "Mangaluru City",
      police_station: "Mangaluru Port PS",
      timestamp: "2026-06-24T17:40:00Z",
      latitude: 12.8701,
      longitude: 74.8801,
      ipc_sections: "Sec 384/386 IPC",
      modus_operandi_text: "Shakedown calls to builders in Mangaluru port boundary area.",
      processed: true,
      entities: []
    }
  ];

  return NextResponse.json({
    status: "success",
    incidents: fallbackIncidents,
    total: fallbackIncidents.length,
    page: 1,
    limit: 500
  });
}
