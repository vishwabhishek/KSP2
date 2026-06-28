"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BrainCircuit, Loader2, ShieldAlert, AlertTriangle, TrendingUp, Info } from "lucide-react";

export const PredictiveView = () => {
  const [patrolDensity, setPatrolDensity] = useState(50);
  const [weatherFactor, setWeatherFactor] = useState(30);
  const [socialRisk, setSocialRisk] = useState(40);
  
  const [initialData, setInitialData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch initial predictive data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/predictive");
        if (res.ok) {
          const { data, modelInfo } = await res.json();
          setInitialData(data);
          setChartData(data);
          setModelInfo(modelInfo);
        }
      } catch (err) {
        console.error("Failed to load predictive data", err);
      }
    };
    fetchData();
  }, []);

  const handleSimulate = async () => {
    if (!initialData.length) return;

    // Generate new simulated predictive series
    const simulated = initialData.map(item => {
      const multiplier = 1 + (weatherFactor - 30) / 120 + (socialRisk - 40) / 100 - (patrolDensity - 50) / 140;
      return {
        ...item,
        Simulation: Math.round(item.Baseline * multiplier)
      };
    });
    setChartData(simulated);

    // Call Qwen AI for insights
    setIsAiLoading(true);
    setAiInsight(null);
    try {
      const aiRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyze the current simulated conditions (Patrol: ${patrolDensity}%, Weather: ${weatherFactor}%, Social Ingress Risk: ${socialRisk}%). Identify hidden correlations, detect anomalies, and predict emerging crime risks. Respond strictly in this tag-structured format:
[RISK LEVEL]
<level text>

[CORRELATIONS]
<point 1>
<point 2>

[ANOMALIES]
<point 1>
<point 2>

[PROJECTIONS]
<point 1>
<point 2>`,
          context: { patrolDensity, weatherFactor, socialRisk }
        })
      });
      
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setAiInsight(aiData.result);
      } else {
        setAiInsight("Failed to load AI insights. Engine unreachable.");
      }
    } catch (err) {
      setAiInsight("Failed to connect to AI engine.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Parser logic to extract tag structured sections from AI response
  const parsedAiDetails = useMemo(() => {
    const sections = {
      riskLevel: "RUN MODEL TO ANALYZE",
      correlations: [] as string[],
      anomalies: [] as string[],
      projections: [] as string[]
    };

    if (!aiInsight) return sections;

    const riskMatch = aiInsight.match(/\[RISK LEVEL\]\n*([\s\S]*?)(?=\n*\[|$)/i);
    const correlationsMatch = aiInsight.match(/\[CORRELATIONS\]\n*([\s\S]*?)(?=\n*\[|$)/i);
    const anomaliesMatch = aiInsight.match(/\[ANOMALIES\]\n*([\s\S]*?)(?=\n*\[|$)/i);
    const projectionsMatch = aiInsight.match(/\[PROJECTIONS\]\n*([\s\S]*?)(?=\n*\[|$)/i);

    if (riskMatch) sections.riskLevel = riskMatch[1].trim();
    
    if (correlationsMatch) {
      sections.correlations = correlationsMatch[1]
        .split("\n")
        .map(line => line.replace(/^[-•*]\s*/, "").trim())
        .filter(line => line.length > 0);
    }
    
    if (anomaliesMatch) {
      sections.anomalies = anomaliesMatch[1]
        .split("\n")
        .map(line => line.replace(/^[-•*]\s*/, "").trim())
        .filter(line => line.length > 0);
    }
    
    if (projectionsMatch) {
      sections.projections = projectionsMatch[1]
        .split("\n")
        .map(line => line.replace(/^[-•*]\s*/, "").trim())
        .filter(line => line.length > 0);
    }

    // Fallback if parsing yielded no sections (e.g. unformatted LLM response)
    if (sections.correlations.length === 0 && sections.anomalies.length === 0 && sections.projections.length === 0) {
      sections.correlations = [aiInsight];
    }

    return sections;
  }, [aiInsight]);

  // Determine risk level badge color
  const riskBadgeStyles = useMemo(() => {
    const text = parsedAiDetails.riskLevel.toUpperCase();
    if (text.includes("CRITICAL") || text.includes("HIGH")) {
      return "bg-severity-level3/10 border-severity-level3 text-severity-level3";
    }
    if (text.includes("ELEVATED") || text.includes("WARNING")) {
      return "bg-brand-gold/10 border-brand-gold text-brand-gold";
    }
    return "bg-severity-level1/10 border-severity-level1 text-severity-level1";
  }, [parsedAiDetails.riskLevel]);

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            AI/ML PREDICTIVE RISK CO-EFFICIENT SIMULATOR
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Configure multi-variable predictive parameters, analyze hidden correlations, and detect sector anomalies.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Side Control Panel */}
        <div className="flex flex-col gap-3">
          <Card title="Simulation Variables">
            <div className="flex flex-col gap-4 font-mono text-[0.6875rem]">
              {/* Patrol density */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[0.625rem] text-text-secondary uppercase">PATROL CO-EFFICIENT:</span>
                  <span className="text-brand-accent font-bold">{patrolDensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={patrolDensity}
                  onChange={(e) => setPatrolDensity(parseInt(e.target.value))}
                  className="w-full accent-brand-accent cursor-pointer"
                />
              </div>

              {/* Weather index */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[0.625rem] text-text-secondary uppercase">WEATHER FACTOR INDEX:</span>
                  <span className="text-brand-accent font-bold">{weatherFactor}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weatherFactor}
                  onChange={(e) => setWeatherFactor(parseInt(e.target.value))}
                  className="w-full accent-brand-accent cursor-pointer"
                />
              </div>

              {/* Socio-Economic Ingress */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-[0.625rem] text-text-secondary uppercase">SOCIO-ECONOMIC INGRESS:</span>
                  <span className="text-brand-accent font-bold">{socialRisk}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={socialRisk}
                  onChange={(e) => setSocialRisk(parseInt(e.target.value))}
                  className="w-full accent-brand-accent cursor-pointer"
                />
              </div>

              {/* Trigger Button */}
              <Button variant="primary" className="w-full mt-2" onClick={handleSimulate}>
                RUN MODEL FORECAST
              </Button>
            </div>
          </Card>

          <Card title="Model Parameters Info">
            <div className="flex flex-col gap-2 font-mono text-[0.625rem] text-text-secondary leading-relaxed">
              <p>• Model: {modelInfo?.name || "Qwen-2.5-72B-Instruct Inference Hub"}</p>
              <p>• Training Set: {modelInfo?.trainingSet || "KSP 5-Year Historical Registry & CDR Mesh"}</p>
              <p>• Accuracy: {modelInfo?.accuracy || "91.8% F1 Score"}</p>
            </div>
          </Card>
        </div>

        {/* Right Side Forecast Chart & Segmented AI Intelligence */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Spatial Chart Forecast */}
          <Card
            title="7-Day Spatial Hotspot Forecast"
            subtitle="Comparing baseline model forecasts against dynamic co-efficient simulations"
            headerAction={
              <div className="flex items-center gap-1.5 text-[0.625rem] font-mono text-brand-accent font-bold">
                <BrainCircuit className="h-4 w-4 animate-pulse" /> MODEL SIMULATION READY
              </div>
            }
          >
            <div className="w-full h-[220px] mt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -30, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid stroke="#1f293d" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#121826",
                        borderColor: "#1f293d",
                        color: "#f3f4f6",
                        fontFamily: "monospace",
                        fontSize: "10px"
                      }}
                    />
                    <Area type="monotone" dataKey="Baseline" stroke="#6b7280" fill="#6b7280" fillOpacity={0.05} />
                    <Area type="monotone" dataKey="Simulation" stroke="#00d8f6" fill="#00d8f6" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-text-muted font-mono text-sm">
                  Loading Forecast Data...
                </div>
              )}
            </div>
          </Card>

          {/* AI/ML Anomaly & Correlation Dashboard */}
          <Card title="AI/ML-Driven Intelligence Analysis">
            <div className="flex flex-col gap-4 font-mono text-[0.6875rem] min-h-[220px]">
              
              {/* Loader */}
              {isAiLoading && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-brand-accent">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Deploying ML models to identify correlations & detect anomalies...</span>
                </div>
              )}

              {/* Empty state */}
              {!isAiLoading && !aiInsight && (
                <div className="flex flex-col items-center justify-center gap-1.5 py-12 text-center text-text-muted leading-normal">
                  <Info className="h-5 w-5 text-text-muted/60" />
                  <span>Configure parameters and run the model forecast to generate AI risk assessment reports.</span>
                </div>
              )}

              {/* Render Structured AI Output */}
              {!isAiLoading && aiInsight && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  
                  {/* Risk Level Badge */}
                  <div className={`p-2 rounded border font-bold text-center text-[0.7rem] uppercase tracking-wide ${riskBadgeStyles}`}>
                    Threat Risk Level: {parsedAiDetails.riskLevel}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hidden Correlations */}
                    <div className="flex flex-col gap-2 bg-bg-surface-elevated/20 border border-border-subtle p-3 rounded-sm">
                      <span className="text-[0.5625rem] text-text-muted uppercase font-bold tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-brand-primary shrink-0" />
                        Discovered Correlations
                      </span>
                      <ul className="flex flex-col gap-1.5 text-[0.625rem] leading-relaxed text-text-secondary">
                        {parsedAiDetails.correlations.map((pt, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-brand-primary">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Detected Anomalies */}
                    <div className="flex flex-col gap-2 bg-bg-surface-elevated/20 border border-border-subtle p-3 rounded-sm">
                      <span className="text-[0.5625rem] text-text-muted uppercase font-bold tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-brand-gold shrink-0" />
                        Statistical Anomalies
                      </span>
                      <ul className="flex flex-col gap-1.5 text-[0.625rem] leading-relaxed text-text-secondary">
                        {parsedAiDetails.anomalies.map((pt, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-brand-gold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Emerging Risk Projections */}
                  <div className="flex flex-col gap-2 bg-bg-surface-elevated/25 border border-border-subtle p-3 rounded-sm border-t-2 border-t-brand-accent">
                    <span className="text-[0.5625rem] text-text-muted uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-brand-accent shrink-0" />
                      48-Hour Emerging Crime Risk Projections
                    </span>
                    <ul className="flex flex-col gap-1.5 text-[0.625rem] leading-relaxed text-text-secondary">
                      {parsedAiDetails.projections.map((pt, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span className="text-brand-accent">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}

            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
