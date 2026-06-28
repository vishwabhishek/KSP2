import { NextResponse } from 'next/server';
import { districtsList } from '@/utils/mockData';
import natureOfComplaints from '@/utils/real_data/nature_of_complaints.json';
import complaintsAgainstPolice from '@/utils/real_data/complaints_against_police.json';

export async function GET() {
  const totalCases = districtsList.filter(d => d.districtName !== 'State Total').reduce((acc, d) => acc + d.incidentCount, 0);

  // Map the real Kaggle 'nature of complaints' data into recent incidents
  const recentIncidents = natureOfComplaints.map((comp: any, idx: number) => ({
    id: `KSP-COMP-${comp.Year}`,
    type: "Complaint Log",
    location: "Karnataka State",
    time: `Year ${comp.Year}`,
    status: `${comp.PC7_IPC_Cases_Registered} IPC Registered`
  })).sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

  const dashboardData = {
    metrics: [
      { id: "active_cases", title: "Active IPC Cases", value: totalCases.toLocaleString(), trend: "+12.5%", isPositive: false },
      { id: "total_complaints", title: "Historical Complaints", value: parseInt(natureOfComplaints[0].PC5_Total_Complaints_Sum_of_1_4_Above || "0").toLocaleString(), trend: "+5.2%", isPositive: true },
      { id: "critical_alerts", title: "Critical Alerts", value: districtsList.filter(d => d.riskStatus === 'critical').length.toString(), trend: "-2.1%", isPositive: true },
      { id: "police_complaints", title: "Complaints Against Police", value: complaintsAgainstPolice[0]["CPA_-_Cases_Registered"] || "0", trend: "Stable", isPositive: true }
    ],
    recentIncidents: recentIncidents,
    systemStatus: "Operational"
  };

  return NextResponse.json(dashboardData);
}
