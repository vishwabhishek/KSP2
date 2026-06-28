import { NextResponse } from 'next/server';
import { districtsList } from '@/utils/mockData';
import natureOfComplaints from '@/utils/real_data/nature_of_complaints.json';
import complaintsAgainstPolice from '@/utils/real_data/complaints_against_police.json';

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

  try {
    // Attempt to fetch stats from Python FastAPI backend
    const statsRes = await fetch(`${backendUrl}/api/v1/stats`, { signal: AbortSignal.timeout(3000) });
    const incidentsRes = await fetch(`${backendUrl}/api/v1/incidents?page=1&limit=5`, { signal: AbortSignal.timeout(3000) });

    if (statsRes.ok && incidentsRes.ok) {
      const statsData = await statsRes.json();
      const incidentsData = await incidentsRes.json();

      const metrics = statsData.metrics;
      const dbDistricts = statsData.districtsList;

      // Map recent incidents from SQLite
      const recentIncidents = incidentsData.incidents.map((inc: any) => ({
        id: inc.fir_number || `FIR-${inc.id}`,
        type: inc.ipc_sections || "IPC Case",
        location: `${inc.police_station}, ${inc.district}`,
        time: inc.timestamp ? inc.timestamp.substring(0, 10) : "Recent",
        status: inc.processed ? "AI Resolved" : "Unresolved"
      }));

      // Fallback to mock districts if none in DB yet
      const activeDistricts = dbDistricts.length > 0 ? dbDistricts : districtsList;
      const totalCases = activeDistricts.filter((d: any) => d.districtName !== 'State Total').reduce((acc: number, d: any) => acc + d.incidentCount, 0);

      return NextResponse.json({
        metrics: [
          { id: "active_cases", title: "Active IPC Cases", value: totalCases.toLocaleString(), trend: "+12.5%", isPositive: false },
          { id: "total_complaints", title: "Historical Complaints", value: parseInt(natureOfComplaints[0].PC5_Total_Complaints_Sum_of_1_4_Above || "0").toLocaleString(), trend: "+5.2%", isPositive: true },
          { id: "critical_alerts", title: "Critical Alerts", value: activeDistricts.filter((d: any) => d.riskStatus === 'critical').length.toString(), trend: "-2.1%", isPositive: true },
          { id: "police_complaints", title: "Complaints Against Police", value: complaintsAgainstPolice[0]["CPA_-_Cases_Registered"] || "0", trend: "Stable", isPositive: true }
        ],
        recentIncidents: recentIncidents.length > 0 ? recentIncidents : [
          { id: "KSP-COMP-2026", type: "Complaint Log", location: "Karnataka State", time: "2026-06-28", status: "AI Resolved" }
        ],
        districtsList: activeDistricts,
        systemStatus: "Operational (FastAPI Sync)"
      });
    }
  } catch (e) {
    console.warn("FastAPI backend stats unreachable. Using Next.js mock data fallback.", e);
  }

  // Fallback to static mock implementation if Python server is offline
  const totalCases = districtsList.filter(d => d.districtName !== 'State Total').reduce((acc, d) => acc + d.incidentCount, 0);
  const recentIncidents = natureOfComplaints.map((comp: any) => ({
    id: `KSP-COMP-${comp.Year}`,
    type: "Complaint Log",
    location: "Karnataka State",
    time: `Year ${comp.Year}`,
    status: `${comp.PC7_IPC_Cases_Registered} IPC Registered`
  })).sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

  return NextResponse.json({
    metrics: [
      { id: "active_cases", title: "Active IPC Cases", value: totalCases.toLocaleString(), trend: "+12.5%", isPositive: false },
      { id: "total_complaints", title: "Historical Complaints", value: parseInt(natureOfComplaints[0].PC5_Total_Complaints_Sum_of_1_4_Above || "0").toLocaleString(), trend: "+5.2%", isPositive: true },
      { id: "critical_alerts", title: "Critical Alerts", value: districtsList.filter(d => d.riskStatus === 'critical').length.toString(), trend: "-2.1%", isPositive: true },
      { id: "police_complaints", title: "Complaints Against Police", value: complaintsAgainstPolice[0]["CPA_-_Cases_Registered"] || "0", trend: "Stable", isPositive: true }
    ],
    recentIncidents: recentIncidents,
    districtsList: districtsList,
    systemStatus: "Operational (Fallback Mock)"
  });
}
