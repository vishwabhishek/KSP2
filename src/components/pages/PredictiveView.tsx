"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { BrainCircuit, Loader2 } from "lucide-react";

export const PredictiveView = () => {
  const [patrolDensity, setPatrolDensity] = useState(50);
  const [weatherFactor, setWeatherFactor] = useState(30);
  
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
      const multiplier = 1 + (weatherFactor - 30) / 100 - (patrolDensity - 50) / 150;
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
          prompt: "Analyze the current simulated conditions and provide risk insights.",
          context: { patrolDensity, weatherFactor }
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

  return (
    <div className="flex flex-col gap-4 flex-1 h-full overflow-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-mono font-bold tracking-tight text-text-primary uppercase">
            HOTSPOT PREDICTIVE SIMULATOR
          </h1>
          <span className="text-[0.6875rem] text-text-muted">
            Configure predictive model variables, simulation metrics, and AI-driven insights via Qwen 2.5 (72B).
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Side Control Panel */}
        <div className="flex flex-col gap-3">
          <Card title="Simulation Sliders">
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

              {/* Trigger Button */}
              <Button variant="primary" className="w-full mt-2" onClick={handleSimulate}>
                RUN MODEL FORECAST
              </Button>
            </div>
          </Card>

          <Card title="Model Parameters Info">
            <div className="flex flex-col gap-2 font-mono text-[0.625rem] text-text-secondary leading-relaxed">
              <p>• Model: {modelInfo?.name || "Loading..."}</p>
              <p>• Training Set: {modelInfo?.trainingSet || "Loading..."}</p>
              <p>• Accuracy: {modelInfo?.accuracy || "Loading..."}</p>
            </div>
          </Card>
          
          <Card title="Qwen AI Insights">
            <div className="flex flex-col gap-2 font-mono text-[0.625rem] text-text-primary leading-relaxed whitespace-pre-wrap">
              {isAiLoading && (
                <div className="flex items-center gap-2 text-brand-accent">
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing simulation parameters...
                </div>
              )}
              {!isAiLoading && !aiInsight && (
                <span className="text-text-muted">Run model forecast to generate AI insights.</span>
              )}
              {!isAiLoading && aiInsight && (
                <div className="p-2 bg-bg-surface-elevated border border-border-subtle rounded text-[0.6875rem] text-brand-accent">
                  {aiInsight}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side Forecast Chart */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <Card
            className="flex-1"
            title="7-Day Spatial Hotspot Forecast"
            subtitle="Comparing baseline model forecasts against dynamic co-efficient simulations"
            headerAction={
              <div className="flex items-center gap-1.5 text-[0.625rem] font-mono text-brand-accent font-bold">
                <BrainCircuit className="h-4 w-4 animate-pulse" /> MODEL SIMULATION READY
              </div>
            }
          >
            <div className="w-full h-[380px] mt-2">
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
        </div>
      </div>
    </div>
  );
};
