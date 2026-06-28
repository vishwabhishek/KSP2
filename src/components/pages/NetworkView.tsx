"use client";

import React, { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Loader2, Play, Network, ShieldCheck } from "lucide-react";

export const NetworkView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [graphMode, setGraphMode] = useState<"mock" | "dynamic">("mock");
  const [narrativeInput, setNarrativeInput] = useState(
    "Suspect Vicky Bhai and accomplice Munna targeted a luxury car KA-03-MR-9801 owned by victim Ramesh. The theft occurred near Indiranagar Metro Station."
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [staticNodes, setStaticNodes] = useState([]);
  const [staticEdges, setStaticEdges] = useState([]);

  // Fetch the default static mock network
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const res = await fetch("/api/network");
        if (res.ok) {
          const data = await res.json();
          setStaticNodes(data.nodes || []);
          setStaticEdges(data.edges || []);
          
          if (graphMode === "mock") {
            setNodes(data.nodes || []);
            setEdges(data.edges || []);
          }
        }
      } catch (err) {
        console.error("Failed to load network data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetworkData();
  }, [setNodes, setEdges, graphMode]);

  const cleanJSON = (text: string) => {
    try {
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = match ? match[1] : text;
      // Convert Python-style single quotes to double quotes
      const sanitized = jsonText.replace(/'/g, '"').trim();
      return JSON.parse(sanitized);
    } catch (err) {
      console.error("JSON parsing error:", err);
      return null;
    }
  };

  const handleExtractGraph = async () => {
    if (!narrativeInput.trim()) return;
    setIsExtracting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: narrativeInput })
      });

      if (!res.ok) throw new Error("Failed to process incident narrative");

      const data = await res.json();
      const payloadText = data.graph_payload || data.result;
      
      const payload = cleanJSON(payloadText);
      if (!payload) throw new Error("Could not extract entities in standard JSON format");

      const suspects = payload.suspects || [];
      const victims = payload.victims || [];
      const locations = payload.locations || [];
      const mo = payload.modus_operandi || "";

      // Layout coordinates (Circle Star layout around center Incident node)
      const center = { x: 350, y: 250 };
      const newNodes: any[] = [
        {
          id: "incident",
          position: center,
          data: { label: "Extracted Incident File" },
          style: {
            backgroundColor: "#1e1b4b",
            color: "#ffffff",
            border: "2px solid #ef4444",
            borderRadius: "4px",
            fontSize: "11px",
            fontFamily: "monospace",
            fontWeight: "bold",
            padding: "8px",
            width: 170
          }
        }
      ];

      const newEdges: any[] = [];
      let idx = 0;
      const totalEntities = suspects.length + victims.length + locations.length + (mo ? 1 : 0);
      const angleStep = (2 * Math.PI) / (totalEntities || 1);

      // Helper to add nodes radially
      const addRadialNode = (label: string, category: string, color: string, borderColor: string) => {
        const angle = idx * angleStep;
        const radius = 220; // radial distance
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        const id = `${category}-${idx}`;

        newNodes.push({
          id,
          position: { x, y },
          data: { label: `${category.toUpperCase()}: ${label}` },
          style: {
            backgroundColor: color,
            color: "#f3f4f6",
            border: `1px solid ${borderColor}`,
            borderRadius: "4px",
            fontSize: "10px",
            fontFamily: "monospace",
            padding: "8px",
            width: 160
          }
        });

        newEdges.push({
          id: `edge-${id}`,
          source: id,
          target: "incident",
          label: category === "suspect" ? "ACCUSED" : category === "victim" ? "VICTIM" : category === "mo" ? "MODUS_OPERANDI" : "LOCATED_AT",
          style: { stroke: borderColor },
          labelStyle: { fill: "#9ca3af", fontSize: 8, fontFamily: "monospace" },
          animated: category === "suspect"
        });

        idx++;
      };

      // Populate nodes
      suspects.forEach((name: string) => addRadialNode(name, "suspect", "#7f1d1d", "#ef4444"));
      victims.forEach((name: string) => addRadialNode(name, "victim", "#064e3b", "#34d399"));
      locations.forEach((name: string) => addRadialNode(name, "location", "#581c87", "#c084fc"));
      if (mo) addRadialNode(mo, "mo", "#0f172a", "#00d8f6");

      setNodes(newNodes);
      setEdges(newEdges);
      setGraphMode("dynamic");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Extraction error occurred.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleToggleMode = (mode: "mock" | "dynamic") => {
    setGraphMode(mode);
    if (mode === "mock") {
      setNodes(staticNodes);
      setEdges(staticEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  };

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            VERTEX ASSOCIATION LINK ANALYZER
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Directed link chart linking suspects, cell numbers, vehicles, and towers.
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => handleToggleMode("mock")}
            className={`px-3 py-1 text-[0.625rem] font-bold border rounded-sm transition-all duration-100 cursor-pointer ${
              graphMode === "mock"
                ? "bg-brand-primary/15 border-brand-primary text-brand-primary"
                : "border-border-subtle text-text-muted hover:text-text-primary"
            }`}
          >
            DEFAULT MOCK DATA
          </button>
          <button
            onClick={() => handleToggleMode("dynamic")}
            className={`px-3 py-1 text-[0.625rem] font-bold border rounded-sm transition-all duration-100 cursor-pointer ${
              graphMode === "dynamic"
                ? "bg-brand-accent/15 border-brand-accent text-brand-accent"
                : "border-border-subtle text-text-muted hover:text-text-primary"
            }`}
          >
            DYNAMIC AI EXTRACTION
          </button>
        </div>
      </div>

      {/* splitscreen */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Left Side Control Panel */}
        <div className="w-[280px] shrink-0 flex flex-col gap-3 overflow-y-auto">
          {graphMode === "dynamic" ? (
            <Card title="Dynamic Graph Ingestion">
              <div className="flex flex-col gap-3 font-mono text-[0.6875rem]">
                <span className="text-[0.625rem] text-text-muted uppercase font-bold">
                  FIR Narrative / Crime Log:
                </span>
                <textarea
                  value={narrativeInput}
                  onChange={(e) => setNarrativeInput(e.target.value)}
                  placeholder="Paste FIR description narrative here..."
                  className="bg-bg-surface border border-border-subtle rounded-sm p-2 text-text-primary min-h-[120px] focus:outline-none focus:border-border-focus font-sans text-[0.6875rem] leading-relaxed resize-none"
                />

                {errorMessage && (
                  <div className="p-2 border border-border-critical bg-severity-level4/10 text-border-critical rounded-sm">
                    {errorMessage}
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={handleExtractGraph}
                  disabled={isExtracting}
                  className="w-full flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> EXTRACTING ENTITIES...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" /> EXTRACT ASSOCIATION MAP
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <Card title="Graph Legends">
              <div className="flex flex-col gap-3 font-mono text-[0.625rem]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-xs bg-severity-level4 border border-border-critical" />
                  <span className="text-text-primary font-bold">PRIMARY SUSPECT</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-xs bg-bg-surface-elevated border border-border-subtle" />
                  <span className="text-text-secondary">CO-ACCUSED</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-xs bg-indigo-950 border border-brand-accent" />
                  <span className="text-brand-accent font-bold">STOLEN VEHICLE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-xs bg-bg-surface-elevated border border-purple-500" />
                  <span className="text-purple-400 font-bold">CELLULAR DEVICE</span>
                </div>
              </div>
            </Card>
          )}

          <Card title="Canvas Controls">
            <div className="flex flex-col gap-2 font-mono text-[0.625rem] text-text-secondary leading-relaxed">
              <p>• PULL/DRAG nodes to organize layout groupings.</p>
              <p>• SCROLL MOUSE to zoom in/out on focused paths.</p>
              <p>• HOVER edges to trace association connection types.</p>
            </div>
          </Card>
        </div>

        {/* Right Side React Flow Canvas */}
        <div className="flex-1 bg-bg-surface border border-border-subtle rounded-md relative overflow-hidden flex flex-col">
          <div className="flex-1 w-full h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full flex-col gap-3 text-brand-accent font-mono text-sm">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading Network Nodes...</span>
              </div>
            ) : graphMode === "dynamic" && nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full flex-col gap-3 text-text-muted font-mono text-[0.6875rem] border border-dashed border-border-subtle/50 rounded-sm m-4 select-none">
                <Network className="h-8 w-8 mb-1 opacity-50" />
                <span>INPUT NARRATIVE AND EXTRACT MAP TO POPULATE RELATIONSHIP GRAPH</span>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
              >
                <Background color="#1f293d" gap={16} size={1} />
                <Controls />
              </ReactFlow>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
