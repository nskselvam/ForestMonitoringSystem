import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { AnalysisRequest, AnalysisResponse } from "@shared/schema";
import { useState } from "react";

// Mock data to display before an analysis is run
export const MOCK_ANALYSIS_DATA: AnalysisResponse = {
  deforestation: {
    areaLost: 14.2,
    pixelsLost: 4250,
    hotspotsFound: 12,
    ndviDecline: 0.15,
    hotspots: [
      { id: "HS-001", location: [11.3, 78.4], pixels: 850, area: "Coimbatore Forest Reserve" },
      { id: "HS-002", location: [10.8, 77.9], pixels: 620, area: "Anaimalai Slopes" },
      { id: "HS-003", location: [11.5, 79.1], pixels: 410, area: "Salem Periphery" },
      { id: "HS-004", location: [11.9, 78.8], pixels: 380, area: "Dharmapuri Woods" },
    ]
  },
  urbanExpansion: {
    treesToBuildings: 8.5,
    pixelsConverted: 2100,
    urbanGrowthRate: 3.2,
    expansionZones: 5,
    zones: [
      { id: "UZ-001", location: [13.0, 80.2], pixels: 1200, area: "Chennai Suburbs (South)" },
      { id: "UZ-002", location: [10.8, 78.7], pixels: 450, area: "Tiruchirappalli Outskirts" },
      { id: "UZ-003", location: [9.9, 78.1], pixels: 320, area: "Madurai Ring Road" },
    ]
  },
  indices: {
    ndvi: { year1: 0.65, year2: 0.50, change: -0.15 },
    ndbi: { year1: -0.20, year2: 0.10, change: 0.30 }
  },
  visualChange: {
    vegetationLoss: 12.4,
    vegetationLossPixels: 3800,
    urbanExpansion: 5.1,
    urbanExpansionPixels: 1500,
    totalChange: 17.5
  },
  landCover: {
    year1: { water: 15, vegetation: 60, builtUp: 10, barren: 15 },
    year2: { water: 14, vegetation: 45, builtUp: 20, barren: 21 }
  },
  risk: {
    score: 78,
    level: "High",
    transitionVelocity: 4.2
  },
  changeSummary: {
    waterToBarren: 2.1,
    vegetationToBuiltUp: 8.5,
    vegetationToBarren: 6.5,
    totalChanged: 17.1
  }
};

export function useAnalysis() {
  const [data, setData] = useState<AnalysisResponse>(MOCK_ANALYSIS_DATA);

  const mutation = useMutation({
    mutationFn: async (request: AnalysisRequest) => {
      const validated = api.analysis.run.input.parse(request);
      const res = await fetch(api.analysis.run.path, {
        method: api.analysis.run.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        throw new Error('Analysis failed to run');
      }
      return api.analysis.run.responses[200].parse(await res.json());
    },
    onSuccess: (newData) => {
      setData(newData);
    }
  });

  return {
    data,
    runAnalysis: mutation.mutate,
    isRunning: mutation.isPending,
    error: mutation.error
  };
}
