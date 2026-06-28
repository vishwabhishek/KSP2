"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import {
  Loader2,
  Play,
  Network,
  ShieldAlert,
  Award,
  Hash,
  Eye,
  EyeOff,
  GitBranch,
  Compass,
  Search,
  RefreshCw,
  FileText,
  Sparkles,
  Zap,
  User,
  MapPin,
  Clock,
  Heart,
  UserMinus
} from "lucide-react";

// Internal subcomponent for styling individual nodes in React Flow dynamically
const NodeLabel = ({ node }: { node: any }) => {
  const type = node.data?.type;

  if (type === "Suspect") {
    const isCritical = node.data.riskRating === "critical";
    return (
      <div className="flex flex-col gap-1 text-left font-mono">
        <div className="flex items-center justify-between border-b border-red-500/30 pb-1">
          <div className="flex items-center gap-1 text-red-400">
            <User className="h-3 w-3 shrink-0" />
            <span className="text-[0.55rem] font-bold tracking-wider uppercase">SUSPECT</span>
          </div>
          <span className={`text-[0.5rem] px-1 rounded-xs font-bold uppercase ${
            isCritical ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
          }`}>
            {node.data.riskRating || "high"}
          </span>
        </div>
        <div className="text-[0.6875rem] font-bold text-white leading-tight truncate">
          {node.data.name}
        </div>
        {node.data.alias && (
          <div className="text-[0.55rem] text-red-200/70 truncate">
            Alias: {node.data.alias}
          </div>
        )}
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-red-500/10 text-[0.5rem] text-red-300/80">
          <span>PR: {node.data.pagerank || 0.25}</span>
          <span>Deg: {node.data.degree || 1}</span>
        </div>
      </div>
    );
  }

  if (type === "Incident") {
    return (
      <div className="flex flex-col gap-1 text-left font-mono">
        <div className="flex items-center justify-between border-b border-indigo-500/30 pb-1">
          <div className="flex items-center gap-1 text-indigo-400">
            <FileText className="h-3 w-3 shrink-0" />
            <span className="text-[0.55rem] font-bold tracking-wider uppercase">INCIDENT</span>
          </div>
          <span className="text-[0.5rem] text-indigo-300 font-bold uppercase">
            PS: {node.data.police_station?.split(" ")[0] || "Active"}
          </span>
        </div>
        <div className="text-[0.6875rem] font-bold text-white leading-tight truncate">
          {node.data.fir_number}
        </div>
        <div className="text-[0.55rem] text-indigo-200/70 leading-normal line-clamp-1">
          {node.data.modus_operandi || "Assault/theft details."}
        </div>
        <div className="text-[0.5rem] text-indigo-300/80 mt-0.5">
          {node.data.district || "District Grid"}
        </div>
      </div>
    );
  }

  if (type === "Victim") {
    return (
      <div className="flex flex-col gap-1 text-left font-mono">
        <div className="flex items-center gap-1 text-emerald-400 border-b border-emerald-500/30 pb-1">
          <Heart className="h-3 w-3 shrink-0 text-emerald-400" />
          <span className="text-[0.55rem] font-bold tracking-wider uppercase">VICTIM</span>
        </div>
        <div className="text-[0.6875rem] font-bold text-emerald-100 truncate mt-0.5">
          {node.data.name}
        </div>
        <div className="text-[0.55rem] text-emerald-300/80 truncate">
          {node.data.description || "Nodal contact"}
        </div>
      </div>
    );
  }

  if (type === "Location") {
    return (
      <div className="flex flex-col gap-1 text-left font-mono">
        <div className="flex items-center gap-1 text-purple-400 border-b border-purple-500/30 pb-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="text-[0.55rem] font-bold tracking-wider uppercase">LOCATION</span>
        </div>
        <div className="text-[0.6875rem] font-bold text-purple-100 truncate mt-0.5">
          {node.data.name}
        </div>
        <div className="text-[0.55rem] text-purple-300/80 leading-tight line-clamp-1">
          {node.data.description || "Crime hotspot area"}
        </div>
      </div>
    );
  }

  return <span>{node.data?.label}</span>;
};

export const NetworkView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [graphMode, setGraphMode] = useState<"database" | "dynamic">("database");
  const [narrativeInput, setNarrativeInput] = useState(
    "Suspect Vicky Bhai and accomplice Munna targeted a luxury car KA-03-MR-9801 owned by victim Ramesh. The theft occurred near Indiranagar Metro Station."
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Tab state inside suspect profile card
  const [activeDossierTab, setActiveDossierTab] = useState<"identity" | "mo" | "associations">("identity");

  // Rich API data properties
  const [dbData, setDbData] = useState<any>({
    metrics: { density: 0, clustering: 0, gangCount: 0, avgDegree: 0, totalSuspects: 0, totalIncidents: 0 },
    rankings: { influence: [], brokerage: [], activity: [] },
    communities: [],
    predictedLinks: [],
    behavioralMatches: []
  });

  // Highlight states
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [pathNodes, setPathNodes] = useState<string[]>([]);
  const [pathEdges, setPathEdges] = useState<string[]>([]);

  // Pathfinder dropdown inputs
  const [pathSource, setPathSource] = useState<string>("");
  const [pathTarget, setPathTarget] = useState<string>("");

  // Edge type toggles
  const [showCoOffending, setShowCoOffending] = useState(true);
  const [showBehavioral, setShowBehavioral] = useState(true);
  const [showPredicted, setShowPredicted] = useState(true);
  const [showAccused, setShowAccused] = useState(true);
  const [showVictims, setShowVictims] = useState(true);
  const [showLocations, setShowLocations] = useState(true);

  // Rankings active tab
  const [rankTab, setRankTab] = useState<"pagerank" | "betweenness" | "degree">("pagerank");

  // AI Dossier Risk assessment
  const [isDossierLoading, setIsDossierLoading] = useState(false);
  const [dossierInsight, setDossierInsight] = useState<string | null>(null);

  const fetchNetworkData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/network");
      if (res.ok) {
        const data = await res.json();
        setDbData(data);
        
        if (graphMode === "database") {
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
        }
      }
    } catch (err) {
      console.error("Failed to load database network data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, [graphMode]);

  const cleanJSON = (text: string) => {
    try {
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = match ? match[1] : text;
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
    setSelectedNode(null);
    setPathNodes([]);
    setPathEdges([]);

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

      const center = { x: 450, y: 300 };
      const newNodes: any[] = [
        {
          id: "incident-dynamic",
          position: center,
          data: {
            label: "Extracted Incident File",
            type: "Incident",
            fir_number: "DYNAMIC FIR",
            modus_operandi: mo,
            police_station: "Unknown",
            district: "Extracted State"
          },
          style: {
            backgroundColor: "#1e1b4b",
            color: "#ffffff",
            border: "2px solid #ef4444",
            borderRadius: "4px",
            fontSize: "10px",
            fontFamily: "monospace",
            fontWeight: "bold",
            padding: "6px",
            width: 150
          }
        }
      ];

      const newEdges: any[] = [];
      let idx = 0;
      const totalEntities = suspects.length + victims.length + locations.length;
      const angleStep = (2 * Math.PI) / (totalEntities || 1);

      const addRadialNode = (label: string, category: string, color: string, borderColor: string) => {
        const angle = idx * angleStep;
        const radius = 200;
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        const id = `${category}-${idx}`;

        newNodes.push({
          id,
          data: {
            label: `${category.toUpperCase()}: ${label}`,
            name: label,
            type: category === "suspect" ? "Suspect" : category === "victim" ? "Victim" : "Location",
            community: category === "suspect" ? "Clique-1" : "None",
            cases: ["DYNAMIC FIR"],
            pagerank: 0.25,
            betweenness: 0.0,
            degree: 1,
            riskRating: "high",
            warrantStatus: "Active",
            fingerprintStatus: "Captured",
            irisScanStatus: "Pending",
            lastKnownLocation: "Extracted Target Site",
            modus_operandi: mo
          },
          position: { x, y },
          style: {
            backgroundColor: color,
            color: "#f3f4f6",
            border: `1px solid ${borderColor}`,
            borderRadius: "4px",
            fontSize: "10px",
            fontFamily: "monospace",
            padding: "6px",
            width: 140
          }
        });

        newEdges.push({
          id: `edge-${id}`,
          source: id,
          target: "incident-dynamic",
          label: category === "suspect" ? "ACCUSED" : category === "victim" ? "VICTIM" : "LOCATED",
          style: { stroke: borderColor },
          labelStyle: { fill: "#9ca3af", fontSize: 8, fontFamily: "monospace" },
          animated: category === "suspect"
        });

        idx++;
      };

      suspects.forEach((name: string) => addRadialNode(name, "suspect", "#7f1d1d", "#ef4444"));
      victims.forEach((name: string) => addRadialNode(name, "victim", "#064e3b", "#34d399"));
      locations.forEach((name: string) => addRadialNode(name, "location", "#581c87", "#c084fc"));

      // Setup dynamic metrics structure
      const dynamicCommunities = [{ id: "gang-0", name: "Clique-1", members: suspects }];
      setDbData({
        metrics: {
          density: suspects.length > 1 ? 1.0 : 0.0,
          clustering: suspects.length > 2 ? 1.0 : 0.0,
          gangCount: 1,
          avgDegree: suspects.length - 1,
          totalSuspects: suspects.length,
          totalIncidents: 1
        },
        rankings: {
          influence: suspects.map((s: string) => ({ name: s, score: 1 / (suspects.length || 1) })),
          brokerage: suspects.map((s: string) => ({ name: s, score: 0.0 })),
          activity: suspects.map((s: string) => ({ name: s, score: 1 }))
        },
        communities: dynamicCommunities,
        predictedLinks: [],
        behavioralMatches: []
      });

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

  const handleToggleMode = (mode: "database" | "dynamic") => {
    setGraphMode(mode);
    setSelectedNode(null);
    setSelectedCommunity(null);
    setPathNodes([]);
    setPathEdges([]);
    setActiveDossierTab("identity");
    if (mode === "database") {
      setNodes(dbData.nodes || []);
      setEdges(dbData.edges || []);
    } else {
      setNodes([]);
      setEdges([]);
    }
  };

  // Node and Edge Filter & Highlight Engine
  const displayNodes = useMemo(() => {
    return nodes
      .filter((node: any) => {
        if (node.data?.type === "Victim" && !showVictims) return false;
        if (node.data?.type === "Location" && !showLocations) return false;
        return true;
      })
      .map((node: any) => {
        let opacity = 1.0;
        let border = node.style?.border || "";
        let boxShadow = "";
        
        // Dim nodes not in the selected community
        if (selectedCommunity) {
          if (node.data?.type === "Suspect") {
            if (node.data?.community !== selectedCommunity) {
              opacity = 0.15;
            }
          } else if (node.data?.type === "Incident") {
            const suspectsInCase = edges
              .filter((e: any) => e.target === node.id && (e.id.startsWith("edge-suspect-") || e.id.includes("suspect")))
              .map((e: any) => e.source.replace("suspect-", ""));
            const communitySuspects = dbData.communities.find((c: any) => c.name === selectedCommunity)?.members || [];
            const hasMember = suspectsInCase.some((s: string) => communitySuspects.includes(s));
            if (!hasMember) {
              opacity = 0.15;
            }
          } else {
            opacity = 0.15;
          }
        }
        
        // Highlight selection and shortest path
        const isSelected = selectedNode && selectedNode.id === node.id;
        const isOnPath = pathNodes.includes(node.id);
        
        if (isOnPath) {
          border = "3px solid #f59e0b"; // Gold thick border
          boxShadow = "0 0 20px #f59e0b";
        } else if (isSelected) {
          border = "2.5px solid #00d8f6"; // Cyber Cyan border
          boxShadow = "0 0 15px rgba(0, 216, 246, 0.6)";
        } else {
          // Pre-populate category specific styling
          if (node.data?.type === "Suspect") {
            border = "1px solid #dc2626";
          } else if (node.data?.type === "Incident") {
            border = "1px solid #6366f1";
          } else if (node.data?.type === "Victim") {
            border = "1px solid #10b981";
          } else if (node.data?.type === "Location") {
            border = "1px solid #9333ea";
          }
        }

        // Apply custom backgrounds depending on the node class
        let backgroundColor = node.style?.backgroundColor || "#1e293b";
        if (node.data?.type === "Suspect") backgroundColor = "#220808";
        if (node.data?.type === "Incident") backgroundColor = "#0b0c1e";
        if (node.data?.type === "Victim") backgroundColor = "#05180f";
        if (node.data?.type === "Location") backgroundColor = "#14071c";
        
        return {
          ...node,
          data: {
            ...node.data,
            label: <NodeLabel node={node} />
          },
          style: {
            ...node.style,
            backgroundColor,
            color: "#f3f4f6",
            borderRadius: "6px",
            padding: "8px",
            fontSize: "10px",
            fontFamily: "monospace",
            opacity,
            border,
            boxShadow,
            transition: "all 0.2s ease-in-out"
          }
        };
      });
  }, [nodes, edges, selectedCommunity, selectedNode, pathNodes, dbData.communities, showVictims, showLocations]);

  const displayEdges = useMemo(() => {
    return edges
      .filter((edge: any) => {
        if (edge.id.startsWith("edge-cooffend-") && !showCoOffending) return false;
        if (edge.id.startsWith("edge-behavioral-") && !showBehavioral) return false;
        if (edge.id.startsWith("edge-predicted-") && !showPredicted) return false;
        if (edge.id.startsWith("edge-suspect-") && !showAccused) return false;
        if (edge.id.startsWith("edge-entity-") && !showVictims) return false;
        if (edge.id.startsWith("edge-location-") && !showLocations) return false;
        return true;
      })
      .map((edge: any) => {
        let opacity = 1.0;
        let stroke = edge.style?.stroke || "#475569";
        let strokeWidth = edge.style?.strokeWidth || 1.5;
        
        // Dim edges not linking selected community
        if (selectedCommunity) {
          const sourceNode = nodes.find((n: any) => n.id === edge.source);
          const targetNode = nodes.find((n: any) => n.id === edge.target);
          const sourceInComm = sourceNode?.data?.community === selectedCommunity;
          const targetInComm = targetNode?.data?.community === selectedCommunity;
          
          if (!sourceInComm && !targetInComm) {
            opacity = 0.15;
          }
        }
        
        // Highlight shortest path edges
        const isOnPath = pathEdges.includes(edge.id);
        if (isOnPath) {
          stroke = "#f59e0b"; // Gold line
          strokeWidth = 4;
        }
        
        return {
          ...edge,
          style: {
            ...edge.style,
            opacity,
            stroke,
            strokeWidth
          },
          animated: isOnPath || edge.animated
        };
      });
  }, [edges, nodes, selectedCommunity, pathEdges, showCoOffending, showBehavioral, showPredicted, showAccused, showVictims, showLocations]);

  // BFS Pathfinder on Displayed/Filtered Edges
  const handleCalculatePath = () => {
    if (!pathSource || !pathTarget) return;
    if (pathSource === pathTarget) {
      setErrorMessage("Source and destination target nodes cannot be identical.");
      return;
    }

    // Build adjacency mapping
    const adj: Record<string, string[]> = {};
    const edgeMap: Record<string, string> = {};

    displayEdges.forEach((edge: any) => {
      const u = edge.source;
      const v = edge.target;
      if (!adj[u]) adj[u] = [];
      if (!adj[v]) adj[v] = [];
      adj[u].push(v);
      adj[v].push(u);

      edgeMap[`${u}->${v}`] = edge.id;
      edgeMap[`${v}->${u}`] = edge.id;
    });

    if (!adj[pathSource] || !adj[pathTarget]) {
      setErrorMessage("No connection path exists: one or both nodes are isolated in this filter.");
      setPathNodes([]);
      setPathEdges([]);
      return;
    }

    const queue: string[] = [pathSource];
    const visited: Record<string, boolean> = { [pathSource]: true };
    const parent: Record<string, string> = {};
    let found = false;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === pathTarget) {
        found = true;
        break;
      }

      const neighbors = adj[curr] || [];
      for (const next of neighbors) {
        if (!visited[next]) {
          visited[next] = true;
          parent[next] = curr;
          queue.push(next);
        }
      }
    }

    if (!found) {
      setErrorMessage("No criminal association chain found connecting targets.");
      setPathNodes([]);
      setPathEdges([]);
      return;
    }

    const path: string[] = [];
    let curr = pathTarget;
    while (curr !== pathSource) {
      path.unshift(curr);
      curr = parent[curr];
    }
    path.unshift(pathSource);

    const pathEdgeIds: string[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const edgeId = edgeMap[`${path[i]}->${path[i+1]}`];
      if (edgeId) pathEdgeIds.push(edgeId);
    }

    setPathNodes(path);
    setPathEdges(pathEdgeIds);
    setErrorMessage("");
  };

  const clearPathfinder = () => {
    setPathNodes([]);
    setPathEdges([]);
    setPathSource("");
    setPathTarget("");
    setErrorMessage("");
  };

  const handleNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
    setDossierInsight(null);
    setActiveDossierTab("identity");
  };

  const handleAiDossierAnalysis = async (name: string) => {
    if (!name) return;
    setIsDossierLoading(true);
    setDossierInsight(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyze the criminal profile of ${name}. Based on their gang association (${selectedNode.data.community}), centrality index (PageRank: ${selectedNode.data.pagerank || 0.25}, degree: ${selectedNode.data.degree || 1}), and involvement in cases: ${selectedNode.data.cases?.join(", ")}. Provide behavioral insights, potential recidivism risk level, and predict their next operational movement patterns.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDossierInsight(data.result);
      } else {
        setDossierInsight("Failed to generate profile analytics. Model timed out.");
      }
    } catch (e) {
      setDossierInsight("AI analysis engine offline.");
    } finally {
      setIsDossierLoading(false);
    }
  };

  // Node choices for pathfinder dropdown
  const pathfinderNodes = useMemo(() => {
    return nodes.filter((n: any) => n.data?.type === "Suspect" || n.data?.type === "Incident");
  }, [nodes]);

  // Handle clicking suspect names in leaderboards
  const highlightRankedSuspect = (name: string) => {
    const matched = nodes.find((n: any) => n.id === `suspect-${name}`);
    if (matched) {
      setSelectedNode(matched);
      setDossierInsight(null);
      setActiveDossierTab("identity");
    }
  };

  // Dynamic co-offenders and predicted links for the selected suspect node
  const suspectCoOffenders = useMemo(() => {
    if (!selectedNode || selectedNode.data?.type !== "Suspect") return [];
    return edges
      .filter((e: any) => {
        if (!e.id.startsWith("edge-cooffend-")) return false;
        return e.source === selectedNode.id || e.target === selectedNode.id;
      })
      .map((e: any) => {
        const otherId = e.source === selectedNode.id ? e.target : e.source;
        const otherNode = nodes.find((n: any) => n.id === otherId);
        return {
          name: otherNode?.data?.name || otherId.replace("suspect-", ""),
          relation: e.label || "CO-OFFENDER"
        };
      });
  }, [selectedNode, edges, nodes]);

  const suspectPredictedLinks = useMemo(() => {
    if (!selectedNode || selectedNode.data?.type !== "Suspect") return [];
    return (dbData.predictedLinks || []).filter((link: any) => 
      link.source.toLowerCase().includes(selectedNode.data.name.toLowerCase()) || 
      link.target.toLowerCase().includes(selectedNode.data.name.toLowerCase()) ||
      selectedNode.data.name.toLowerCase().includes(link.source.toLowerCase()) ||
      selectedNode.data.name.toLowerCase().includes(link.target.toLowerCase())
    );
  }, [selectedNode, dbData.predictedLinks]);

  const suspectBehavioralMatches = useMemo(() => {
    if (!selectedNode || selectedNode.data?.type !== "Suspect") return [];
    return (dbData.behavioralMatches || []).filter((match: any) => 
      match.source.toLowerCase().includes(selectedNode.data.name.toLowerCase()) || 
      match.target.toLowerCase().includes(selectedNode.data.name.toLowerCase()) ||
      selectedNode.data.name.toLowerCase().includes(match.source.toLowerCase()) ||
      selectedNode.data.name.toLowerCase().includes(match.target.toLowerCase())
    );
  }, [selectedNode, dbData.behavioralMatches]);

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase flex items-center gap-2">
            <Compass className="h-5 w-5 text-brand-primary animate-spin-slow" />
            VERTEX ASSOCIATION LINK ANALYZER
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Advanced network intelligence mapping co-offenders, community cliques, and predictive criminal relationships.
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => handleToggleMode("database")}
            className={`px-3 py-1.5 text-[0.625rem] font-bold border rounded-sm transition-all duration-100 cursor-pointer ${
              graphMode === "database"
                ? "bg-brand-primary/15 border-brand-primary text-brand-primary"
                : "border-border-subtle text-text-muted hover:text-text-primary"
            }`}
          >
            DATABASE RELATION GRAPH
          </button>
          <button
            onClick={() => handleToggleMode("dynamic")}
            className={`px-3 py-1.5 text-[0.625rem] font-bold border rounded-sm transition-all duration-100 cursor-pointer ${
              graphMode === "dynamic"
                ? "bg-brand-accent/15 border-brand-accent text-brand-accent"
                : "border-border-subtle text-text-muted hover:text-text-primary"
            }`}
          >
            DYNAMIC AI EXTRACTION
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        
        {/* Left Column: Analytics Metrics, Filters & Gang Explorer */}
        <div className="w-[300px] shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
          
          {/* Card 1: Network SNA Statistics */}
          <Card title="SNA Topology Statistics">
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-1.5 bg-bg-surface-elevated border border-border-subtle rounded-sm">
                <span className="block text-[0.55rem] text-text-muted uppercase">Density</span>
                <span className="text-xs font-bold text-text-primary">{dbData.metrics.density}</span>
              </div>
              <div className="p-1.5 bg-bg-surface-elevated border border-border-subtle rounded-sm">
                <span className="block text-[0.55rem] text-text-muted uppercase">Clustering Coeff</span>
                <span className="text-xs font-bold text-text-primary">{dbData.metrics.clustering}</span>
              </div>
              <div className="p-1.5 bg-bg-surface-elevated border border-border-subtle rounded-sm">
                <span className="block text-[0.55rem] text-text-muted uppercase">Average Degree</span>
                <span className="text-xs font-bold text-brand-accent">{dbData.metrics.avgDegree}</span>
              </div>
              <div className="p-1.5 bg-bg-surface-elevated border border-border-subtle rounded-sm">
                <span className="block text-[0.55rem] text-text-muted uppercase">Discovered Cliques</span>
                <span className="text-xs font-bold text-brand-gold">{dbData.metrics.gangCount}</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Edge Filters */}
          <Card title="Association Layer Visibility">
            <div className="flex flex-col gap-1.5 font-mono text-[0.625rem]">
              <label className="flex items-center justify-between p-1 hover:bg-bg-surface-elevated/40 rounded cursor-pointer">
                <span className="flex items-center gap-1.5 text-[#ea580c] font-bold">
                  <span className="h-2 w-2 rounded-full bg-[#ea580c]" /> Co-Offender Links
                </span>
                <input
                  type="checkbox"
                  checked={showCoOffending}
                  onChange={(e) => setShowCoOffending(e.target.checked)}
                  className="accent-brand-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1 hover:bg-bg-surface-elevated/40 rounded cursor-pointer">
                <span className="flex items-center gap-1.5 text-[#f59e0b] font-bold">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]" /> MO Similarity Links
                </span>
                <input
                  type="checkbox"
                  checked={showBehavioral}
                  onChange={(e) => setShowBehavioral(e.target.checked)}
                  className="accent-brand-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1 hover:bg-bg-surface-elevated/40 rounded cursor-pointer">
                <span className="flex items-center gap-1.5 text-[#ec4899] font-bold">
                  <span className="h-2 w-2 rounded-full bg-[#ec4899]" /> SNA Predicted Links
                </span>
                <input
                  type="checkbox"
                  checked={showPredicted}
                  onChange={(e) => setShowPredicted(e.target.checked)}
                  className="accent-brand-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1 hover:bg-bg-surface-elevated/40 rounded cursor-pointer">
                <span className="flex items-center gap-1.5 text-[#ef4444] font-bold">
                  <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Suspect Case Links
                </span>
                <input
                  type="checkbox"
                  checked={showAccused}
                  onChange={(e) => setShowAccused(e.target.checked)}
                  className="accent-brand-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1 hover:bg-bg-surface-elevated/40 rounded cursor-pointer">
                <span className="flex items-center gap-1.5 text-[#34d399] font-bold">
                  <span className="h-2 w-2 rounded-full bg-[#34d399]" /> Victim/Other Links
                </span>
                <input
                  type="checkbox"
                  checked={showVictims}
                  onChange={(e) => setShowVictims(e.target.checked)}
                  className="accent-brand-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-1 hover:bg-bg-surface-elevated/40 rounded cursor-pointer">
                <span className="flex items-center gap-1.5 text-[#a855f7] font-bold">
                  <span className="h-2 w-2 rounded-full bg-[#a855f7]" /> Sector Hotspots / Locations
                </span>
                <input
                  type="checkbox"
                  checked={showLocations}
                  onChange={(e) => setShowLocations(e.target.checked)}
                  className="accent-brand-primary cursor-pointer"
                />
              </label>
            </div>
          </Card>

          {/* Card 3: Clique/Gang Explorer */}
          <Card 
            title="Clique / Gang Explorer"
            subtitle="Click gang to isolate node clusters, click again to reset"
          >
            <div className="flex flex-col gap-1.5 font-mono text-[0.625rem]">
              {dbData.communities.length > 0 ? (
                dbData.communities.map((comm: any, idx: number) => {
                  const isSelected = selectedCommunity === comm.name;
                  const colors = ["bg-[#7f1d1d] border-[#ef4444]", "bg-[#064e3b] border-[#34d399]", "bg-[#581c87] border-[#c084fc]", "bg-[#7c2d12] border-[#fb923c]"];
                  const dotColor = colors[idx % colors.length];

                  return (
                    <button
                      key={comm.id}
                      onClick={() => setSelectedCommunity(isSelected ? null : comm.name)}
                      className={`flex items-center justify-between p-2 rounded-sm border transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-brand-primary/20 border-brand-primary text-text-primary"
                          : "bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-focus"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`h-2.5 w-2.5 rounded-full border ${dotColor}`} />
                        <span className="font-bold truncate">{comm.name}</span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-bg-surface-elevated border border-border-subtle rounded text-[0.55rem] text-text-muted">
                        {comm.members.length} SUSPECTS
                      </span>
                    </button>
                  );
                })
              ) : (
                <span className="text-text-muted italic block py-1">No gang cliques identified.</span>
              )}
            </div>
          </Card>

          {/* Card 4: Dynamic Graph Ingestion */}
          {graphMode === "dynamic" && (
            <Card title="Dynamic Graph Ingestion">
              <div className="flex flex-col gap-3 font-mono text-[0.6875rem]">
                <span className="text-[0.625rem] text-text-muted uppercase font-bold">
                  FIR Narrative / Crime Log:
                </span>
                <textarea
                  value={narrativeInput}
                  onChange={(e) => setNarrativeInput(e.target.value)}
                  placeholder="Paste FIR description narrative here..."
                  className="bg-bg-surface border border-border-subtle rounded-sm p-2 text-text-primary min-h-[100px] focus:outline-none focus:border-border-focus font-sans text-[0.6875rem] leading-relaxed resize-none"
                />

                <Button
                  variant="primary"
                  onClick={handleExtractGraph}
                  disabled={isExtracting}
                  className="w-full flex items-center justify-center gap-1.5 cursor-pointer text-[0.6875rem] h-8"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> EXTRACTING...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" /> EXTRACT ASSOCIATION MAP
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Center Column: React Flow Graph Canvas */}
        <div className="flex-1 bg-bg-surface border border-border-subtle rounded-md relative overflow-hidden flex flex-col min-w-0">
          <div className="flex-1 w-full h-full relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full flex-col gap-3 text-brand-accent font-mono text-sm">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Initializing Criminal Relations Topology...</span>
              </div>
            ) : graphMode === "dynamic" && nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full flex-col gap-3 text-text-muted font-mono text-[0.6875rem] border border-dashed border-border-subtle/50 rounded-sm m-4 select-none">
                <Network className="h-8 w-8 mb-1 opacity-50 text-brand-accent" />
                <span>INPUT DYNAMIC NARRATIVE ON THE LEFT AND RUN GRAPH EXTRACTION</span>
              </div>
            ) : (
              <>
                <ReactFlow
                  nodes={displayNodes}
                  edges={displayEdges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={handleNodeClick}
                  fitView
                >
                  <Background color="#121826" gap={16} size={1} />
                  <Controls className="bg-bg-surface border border-border-subtle text-text-primary rounded" />
                </ReactFlow>
                
                {/* Clear Highlights HUD Indicator */}
                {(selectedCommunity || pathNodes.length > 0 || selectedNode) && (
                  <button
                    onClick={() => {
                      setSelectedCommunity(null);
                      setSelectedNode(null);
                      setPathNodes([]);
                      setPathEdges([]);
                    }}
                    className="absolute bottom-4 left-4 z-10 px-3 py-1.5 bg-severity-level4 border border-border-critical hover:bg-severity-level4/80 text-white rounded-sm font-mono text-[0.625rem] font-bold flex items-center gap-1.5 shadow-high"
                  >
                    <RefreshCw className="h-3 w-3" /> CLEAR GRAPH HIGHLIGHTS
                  </button>
                )}

                {/* Graph Legend HUD overlay */}
                <div className="absolute top-4 right-4 z-10 bg-bg-surface/90 border border-border-subtle p-2.5 rounded-sm font-mono text-[0.55rem] flex flex-col gap-1.5 shadow-medium">
                  <span className="font-bold text-text-muted uppercase text-[0.5rem] tracking-wider border-b border-border-subtle pb-1 mb-0.5">LEGEND</span>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 bg-[#220808] border border-red-500 rounded-xs" />
                    <span className="text-text-primary font-bold">SUSPECT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 bg-[#0b0c1e] border border-indigo-500 rounded-xs" />
                    <span className="text-text-primary font-bold">INCIDENT CASE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 bg-[#05180f] border border-emerald-500 rounded-xs" />
                    <span className="text-text-secondary">VICTIM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 bg-[#14071c] border border-purple-500 rounded-xs" />
                    <span className="text-text-secondary">LOCATION</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Centrality Rankings, Pathfinder, and Dossier Inspector */}
        <div className="w-[340px] shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
          
          {/* Card 1: Criminal Influence Rankings */}
          <Card title="Criminal Influence Index">
            <div className="flex flex-col gap-2.5">
              {/* Rankings Tabs */}
              <div className="flex border-b border-border-subtle font-mono text-[0.55rem] font-bold">
                <button
                  onClick={() => setRankTab("pagerank")}
                  className={`flex-1 pb-1.5 border-b-2 text-center uppercase cursor-pointer ${
                    rankTab === "pagerank" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  PageRank (Status)
                </button>
                <button
                  onClick={() => setRankTab("betweenness")}
                  className={`flex-1 pb-1.5 border-b-2 text-center uppercase cursor-pointer ${
                    rankTab === "betweenness" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Betweenness (Brokers)
                </button>
                <button
                  onClick={() => setRankTab("degree")}
                  className={`flex-1 pb-1.5 border-b-2 text-center uppercase cursor-pointer ${
                    rankTab === "degree" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Degree (Links)
                </button>
              </div>

              {/* Table Rankings List */}
              <div className="max-h-[120px] overflow-y-auto font-mono text-[0.625rem]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-text-muted border-b border-border-subtle/50 text-left">
                      <th className="pb-1 font-normal w-8">Rank</th>
                      <th className="pb-1 font-normal">Name</th>
                      <th className="pb-1 font-normal text-right w-16">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbData.rankings[rankTab === "pagerank" ? "influence" : rankTab === "betweenness" ? "brokerage" : "activity"]?.length > 0 ? (
                      dbData.rankings[rankTab === "pagerank" ? "influence" : rankTab === "betweenness" ? "brokerage" : "activity"].map((item: any, idx: number) => (
                        <tr
                          key={idx}
                          onClick={() => highlightRankedSuspect(item.name)}
                          className="hover:bg-bg-surface-elevated/40 border-b border-border-subtle/20 cursor-pointer text-text-secondary hover:text-text-primary"
                        >
                          <td className="py-1 text-text-muted">#{idx + 1}</td>
                          <td className="py-1 truncate font-bold">{item.name}</td>
                          <td className="py-1 text-right font-bold text-brand-accent">{item.score}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center text-text-muted italic py-3">No ranking datasets available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Card 2: Shortest Path Association Finder */}
          <Card title="SNA Association Pathfinder">
            <div className="flex flex-col gap-2.5 font-mono text-[0.625rem]">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.55rem] text-text-muted uppercase">Start Target:</span>
                  <select
                    value={pathSource}
                    onChange={(e) => setPathSource(e.target.value)}
                    className="bg-bg-surface border border-border-subtle text-text-primary p-1 rounded-sm w-full outline-none text-[0.625rem] focus:border-border-focus"
                  >
                    <option value="">-- SELECT --</option>
                    {pathfinderNodes.map((n: any) => (
                      <option key={n.id} value={n.id}>
                        {n.data.name || n.data.fir_number || n.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[0.55rem] text-text-muted uppercase">End Target:</span>
                  <select
                    value={pathTarget}
                    onChange={(e) => setPathTarget(e.target.value)}
                    className="bg-bg-surface border border-border-subtle text-text-primary p-1 rounded-sm w-full outline-none text-[0.625rem] focus:border-border-focus"
                  >
                    <option value="">-- SELECT --</option>
                    {pathfinderNodes.map((n: any) => (
                      <option key={n.id} value={n.id}>
                        {n.data.name || n.data.fir_number || n.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {errorMessage && (
                <div className="p-1.5 border border-border-critical bg-severity-level4/10 text-border-critical rounded-sm font-bold flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-1">
                <Button
                  variant="primary"
                  onClick={handleCalculatePath}
                  disabled={!pathSource || !pathTarget}
                  className="w-full text-[0.625rem] py-1 cursor-pointer h-7 flex items-center justify-center gap-1"
                >
                  <GitBranch className="h-3 w-3" /> FIND PATH
                </Button>
                <Button
                  variant="secondary"
                  onClick={clearPathfinder}
                  className="w-full text-[0.625rem] py-1 cursor-pointer h-7 flex items-center justify-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> RESET
                </Button>
              </div>
            </div>
          </Card>

          {/* Card 3: Selected Dossier Inspector */}
          <Card title="Dossier Inspector Profile">
            {selectedNode ? (
              <div className="flex flex-col font-mono text-[0.6875rem]">
                {selectedNode.data?.type === "Suspect" ? (
                  <>
                    {/* Suspect Profile Tab Buttons */}
                    <div className="flex border-b border-border-subtle font-mono text-[0.55rem] font-bold mb-3">
                      <button
                        onClick={() => setActiveDossierTab("identity")}
                        className={`flex-1 pb-1.5 border-b-2 text-center uppercase cursor-pointer ${
                          activeDossierTab === "identity" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-secondary"
                        }`}
                      >
                        Identity & Bio
                      </button>
                      <button
                        onClick={() => setActiveDossierTab("mo")}
                        className={`flex-1 pb-1.5 border-b-2 text-center uppercase cursor-pointer ${
                          activeDossierTab === "mo" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-secondary"
                        }`}
                      >
                        MO & Timeline
                      </button>
                      <button
                        onClick={() => setActiveDossierTab("associations")}
                        className={`flex-1 pb-1.5 border-b-2 text-center uppercase cursor-pointer ${
                          activeDossierTab === "associations" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted hover:text-text-secondary"
                        }`}
                      >
                        Connections
                      </button>
                    </div>

                    {/* Tab 1: Identity & Biometrics */}
                    {activeDossierTab === "identity" && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 border-b border-border-subtle/50 pb-3">
                          <div className="h-16 w-14 bg-bg-surface-elevated border border-border-subtle rounded flex items-center justify-center relative overflow-hidden shrink-0">
                            <User className="h-8 w-8 text-text-muted opacity-40" />
                            {selectedNode.data.warrantStatus === "Active" && (
                              <div className="absolute bottom-0 bg-severity-level3 w-full text-center py-0.5 text-[0.45rem] font-bold text-text-primary uppercase tracking-wider">
                                WANTED
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-xs font-bold text-text-primary uppercase truncate w-[190px]">
                              {selectedNode.data.name}
                            </span>
                            <span className="text-[0.625rem] text-text-muted">
                              Alias: <span className="text-text-secondary font-semibold">{selectedNode.data.alias || "None"}</span>
                            </span>
                            <span className="text-[0.625rem] text-text-muted">
                              Clique: <span className="text-brand-accent font-bold">{selectedNode.data.community || "None"}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 bg-bg-surface-elevated/20 p-2.5 rounded border border-border-subtle/50">
                          <div className="flex justify-between items-center text-[0.625rem]">
                            <span className="text-text-muted uppercase">Risk Rating:</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[0.55rem] ${
                              selectedNode.data.riskRating === "critical" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}>
                              {selectedNode.data.riskRating || "high"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[0.625rem]">
                            <span className="text-text-muted uppercase">Warrant Status:</span>
                            <span className={`font-bold uppercase ${selectedNode.data.warrantStatus === "Active" ? "text-red-400 font-extrabold" : "text-text-muted"}`}>
                              {selectedNode.data.warrantStatus || "None"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[0.625rem]">
                            <span className="text-text-muted uppercase">Last Seen Area:</span>
                            <span className="text-text-secondary font-semibold truncate max-w-[150px] uppercase">
                              {selectedNode.data.lastKnownLocation || "Unknown"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-center text-[0.625rem] bg-bg-surface-elevated/40 p-2 rounded border border-border-subtle/40">
                          <div className="flex flex-col items-center gap-0.5 border-r border-border-subtle/40">
                            <span className="text-[0.5rem] text-text-muted uppercase font-bold">Fingerprint</span>
                            <span className={`font-bold uppercase ${selectedNode.data.fingerprintStatus === "Captured" ? "text-severity-level1" : "text-brand-gold"}`}>
                              {selectedNode.data.fingerprintStatus || "Captured"}
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[0.5rem] text-text-muted uppercase font-bold">Iris Scanning</span>
                            <span className={`font-bold uppercase ${selectedNode.data.irisScanStatus === "Captured" ? "text-severity-level1" : "text-brand-gold"}`}>
                              {selectedNode.data.irisScanStatus || "Captured"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: MO & Timeline */}
                    {activeDossierTab === "mo" && (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1 bg-bg-surface-elevated/30 p-2.5 border border-border-subtle/40 rounded">
                          <span className="text-[0.55rem] text-text-muted uppercase font-bold">Specific Modus Operandi (MO):</span>
                          <p className="text-[0.625rem] text-text-secondary leading-relaxed font-sans mt-0.5">
                            {selectedNode.data.modus_operandi || "Persistent offender target profile."}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[0.55rem] text-text-muted font-bold uppercase tracking-wider border-b border-border-subtle/40 pb-1">
                            <span>Jurisdiction timeline</span>
                            <span className="text-brand-accent">MO Consistency: 88% Match</span>
                          </div>
                          <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                            {selectedNode.data.cases && selectedNode.data.cases.length > 0 ? (
                              selectedNode.data.cases.map((caseNum: string, idx: number) => {
                                // Find if this case exists in nodes to show police station
                                const matchNode = nodes.find((n: any) => n.data?.fir_number === caseNum || n.id === `incident-${caseNum}`);
                                const station = matchNode?.data?.police_station || "Precinct Hub";
                                const district = matchNode?.data?.district || "Karnataka State";
                                
                                return (
                                  <div key={idx} className="flex gap-2 p-2 bg-bg-surface-elevated/20 border border-border-subtle/30 hover:border-border-focus rounded-sm">
                                    <div className="flex flex-col items-center justify-center bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 h-6.5 w-6.5 rounded shrink-0">
                                      <Clock className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex flex-col min-w-0 leading-normal">
                                      <span className="text-[0.625rem] font-bold text-text-primary">{caseNum}</span>
                                      <span className="text-[0.55rem] text-text-muted truncate max-w-[190px]">
                                        {station} ({district})
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-text-muted italic text-[0.625rem]">No multi-jurisdictional records linked.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Hidden Associations */}
                    {activeDossierTab === "associations" && (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[0.625rem] bg-bg-surface-elevated/30 p-1.5 rounded-sm border border-border-subtle/40">
                          <div>
                            <span className="block text-[0.5rem] text-text-muted uppercase">PageRank</span>
                            <span className="font-bold text-brand-accent">{selectedNode.data.pagerank || 0.25}</span>
                          </div>
                          <div>
                            <span className="block text-[0.5rem] text-text-muted uppercase">Brokerage</span>
                            <span className="font-bold text-brand-gold">{selectedNode.data.betweenness || 0.0}</span>
                          </div>
                          <div>
                            <span className="block text-[0.5rem] text-text-muted uppercase">Degree</span>
                            <span className="font-bold text-text-primary">{selectedNode.data.degree || 1}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[0.55rem] text-text-muted uppercase font-bold">DIRECT CO-OFFENDER GANG LINKS:</span>
                          <div className="flex flex-wrap gap-1">
                            {suspectCoOffenders.length > 0 ? (
                              suspectCoOffenders.map((co: any, i: number) => (
                                <span key={i} className="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/30 rounded text-[0.58rem] text-orange-300 font-bold">
                                  {co.name} ({co.relation})
                                </span>
                              ))
                            ) : (
                              <span className="text-text-muted italic text-[0.55rem]">No co-offenders found.</span>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-border-subtle/30 pt-2 flex flex-col gap-1.5">
                          <span className="text-[0.55rem] text-text-muted uppercase font-bold">SNA CRIMINAL PREDICTIONS:</span>
                          {suspectPredictedLinks.length > 0 || suspectBehavioralMatches.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {suspectPredictedLinks.map((p: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-[0.58rem] p-1 bg-pink-500/5 border border-pink-500/20 text-pink-300 rounded-sm">
                                  <span className="font-bold">SNA Link: {p.source} &harr; {p.target}</span>
                                  <span className="font-bold text-pink-400">{Math.round(p.score * 100)}% Match</span>
                                </div>
                              ))}
                              {suspectBehavioralMatches.map((b: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-[0.58rem] p-1 bg-amber-500/5 border border-amber-500/20 text-amber-300 rounded-sm">
                                  <span className="font-bold">MO Link: {b.source} &harr; {b.target}</span>
                                  <span className="font-bold text-amber-400">Score: {b.score}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-text-muted italic text-[0.55rem]">No pending predicted threat associations.</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Behavioral Risk Analysis Action Button (Persistent at bottom of tabs) */}
                    <div className="border-t border-border-subtle/30 pt-3 mt-3">
                      <Button
                        variant="primary"
                        onClick={() => handleAiDossierAnalysis(selectedNode.data.name)}
                        disabled={isDossierLoading}
                        className="w-full text-[0.625rem] flex items-center justify-center gap-1 cursor-pointer h-7"
                      >
                        {isDossierLoading ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" /> PROFILING PATTERNS...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 text-brand-accent animate-pulse" /> AI BEHAVIORAL RISK ANALYSIS
                          </>
                        )}
                      </Button>

                      {dossierInsight && (
                        <div className="mt-2.5 p-2 bg-bg-surface-elevated/80 border border-brand-accent/30 rounded text-[0.625rem] leading-relaxed text-text-secondary whitespace-pre-wrap max-h-[140px] overflow-y-auto">
                          {dossierInsight}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Non-Suspect details (Incident/Victim/Location) */}
                    <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-2 mb-3">
                      {selectedNode.data.type === "Incident" ? (
                        <FileText className="h-5 w-5 text-brand-gold shrink-0" />
                      ) : selectedNode.data.type === "Victim" ? (
                        <Heart className="h-5 w-5 text-emerald-400 shrink-0" />
                      ) : (
                        <MapPin className="h-5 w-5 text-purple-400 shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-text-primary uppercase truncate w-[240px]">
                          {selectedNode.data.name || selectedNode.data.fir_number || selectedNode.id}
                        </span>
                        <span className="text-[0.55rem] text-text-muted uppercase">
                          TYPE: {selectedNode.data.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {selectedNode.data.type === "Incident" && (
                        <>
                          <div className="flex items-center gap-1.5 text-[0.625rem]">
                            <MapPin className="h-3.5 w-3.5 text-text-muted" />
                            <span className="text-text-muted">PRECINCT:</span>
                            <span className="font-bold text-text-secondary uppercase">{selectedNode.data.police_station}</span>
                          </div>
                          <div className="flex flex-col gap-1 bg-bg-surface-elevated/40 p-2 border border-border-subtle/30 rounded">
                            <span className="text-[0.55rem] text-text-muted uppercase font-bold">MODUS OPERANDI CRIME NARRATIVE:</span>
                            <p className="text-[0.625rem] text-text-secondary leading-relaxed font-sans mt-0.5">
                              {selectedNode.data.modus_operandi}
                            </p>
                          </div>
                        </>
                      )}

                      {selectedNode.data.type === "Victim" && (
                        <div className="flex flex-col gap-1 bg-bg-surface-elevated/40 p-2.5 border border-border-subtle/30 rounded">
                          <span className="text-[0.55rem] text-text-muted uppercase font-bold">Victim Information:</span>
                          <p className="text-[0.625rem] text-text-secondary leading-relaxed font-sans mt-0.5">
                            {selectedNode.data.description || "No further records provided."}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 text-[0.58rem] font-bold text-text-muted">
                            <span>LINKED CASES:</span>
                            <div className="flex flex-wrap gap-1">
                              {selectedNode.data.cases?.map((c: string) => (
                                <span key={c} className="px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded">{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedNode.data.type === "Location" && (
                        <div className="flex flex-col gap-1 bg-bg-surface-elevated/40 p-2.5 border border-border-subtle/30 rounded">
                          <span className="text-[0.55rem] text-text-muted uppercase font-bold">Hotspot Description:</span>
                          <p className="text-[0.625rem] text-text-secondary leading-relaxed font-sans mt-0.5">
                            {selectedNode.data.description || "Recurring hotspot point."}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 text-[0.58rem] font-bold text-text-muted">
                            <span>ASSOCIATED CASES:</span>
                            <div className="flex flex-wrap gap-1">
                              {selectedNode.data.cases?.map((c: string) => (
                                <span key={c} className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded">{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-text-muted font-mono text-[0.625rem] italic py-6 select-none border border-dashed border-border-subtle/50 rounded-sm">
                Click any node on the graph canvas to inspect structural details.
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};
