import { NextResponse } from 'next/server';

export async function GET() {
  const nodes = [
    {
      id: "vicky",
      position: { x: 150, y: 150 },
      data: { label: "Vikram Gowda (Vicky Bhai)" },
      style: {
        backgroundColor: "#b91c1c",
        color: "#f3f4f6",
        border: "1px solid #ef4444",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "monospace",
        fontWeight: "bold",
        padding: "8px",
        width: 160
      }
    },
    {
      id: "munna",
      position: { x: 380, y: 80 },
      data: { label: "Karan R. Kumar (Munna)" },
      style: {
        backgroundColor: "#1c2336",
        color: "#f3f4f6",
        border: "1px solid #1f293d",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "8px",
        width: 160
      }
    },
    {
      id: "car",
      position: { x: 380, y: 220 },
      data: { label: "Sedan KA-03-MR-9801" },
      style: {
        backgroundColor: "#1e1b4b",
        color: "#00d8f6",
        border: "1px solid #00d8f6",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "8px",
        width: 160
      }
    },
    {
      id: "phone",
      position: { x: 150, y: 320 },
      data: { label: "IMSI +91-98744-12903" },
      style: {
        backgroundColor: "#1c2336",
        color: "#a855f7",
        border: "1px solid #a855f7",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "8px",
        width: 160
      }
    },
    {
      id: "tower",
      position: { x: 380, y: 350 },
      data: { label: "Tower Node Indira-04" },
      style: {
        backgroundColor: "#111827",
        color: "#9ca3af",
        border: "1px solid #374151",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "monospace",
        padding: "8px",
        width: 160
      }
    }
  ];

  const edges = [
    {
      id: "edge-vicky-munna",
      source: "vicky",
      target: "munna",
      label: "CO-ACCUSED GANG",
      style: { stroke: "#ef4444" },
      labelStyle: { fill: "#f3f4f6", fontSize: 8, fontFamily: "monospace" },
      animated: true
    },
    {
      id: "edge-vicky-car",
      source: "vicky",
      target: "car",
      label: "SUSPECT OPERATOR",
      style: { stroke: "#00d8f6" },
      labelStyle: { fill: "#f3f4f6", fontSize: 8, fontFamily: "monospace" }
    },
    {
      id: "edge-munna-car",
      source: "munna",
      target: "car",
      label: "LOGISTICS VEHICLE",
      style: { stroke: "#1f293d" },
      labelStyle: { fill: "#9ca3af", fontSize: 8, fontFamily: "monospace" }
    },
    {
      id: "edge-vicky-phone",
      source: "vicky",
      target: "phone",
      label: "CDR IMEI HANDSET",
      style: { stroke: "#a855f7" },
      labelStyle: { fill: "#f3f4f6", fontSize: 8, fontFamily: "monospace" },
      animated: true
    },
    {
      id: "edge-phone-tower",
      source: "phone",
      target: "tower",
      label: "TOWER INGRESS PING",
      style: { stroke: "#374151" },
      labelStyle: { fill: "#9ca3af", fontSize: 8, fontFamily: "monospace" }
    }
  ];

  return NextResponse.json({ nodes, edges });
}
