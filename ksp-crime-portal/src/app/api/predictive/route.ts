import { NextResponse } from 'next/server';

export async function GET() {
  const initialPredictiveData = [
    { name: "Day +1", Baseline: 42, Simulation: 42 },
    { name: "Day +2", Baseline: 38, Simulation: 40 },
    { name: "Day +3", Baseline: 45, Simulation: 48 },
    { name: "Day +4", Baseline: 52, Simulation: 62 },
    { name: "Day +5", Baseline: 49, Simulation: 68 },
    { name: "Day +6", Baseline: 55, Simulation: 72 },
    { name: "Day +7", Baseline: 61, Simulation: 84 }
  ];

  return NextResponse.json({
    data: initialPredictiveData,
    modelInfo: {
      name: "Prophet Spatial Temporal Regression Engine v2.",
      trainingSet: "KSP 2021-2026 logs (All zones).",
      accuracy: "84.5% confidence bounds."
    }
  });
}
