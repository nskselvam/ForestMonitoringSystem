import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { AnalysisRequest, AnalysisResponse } from "@shared/schema";
import { useState } from "react";

// Mock data to display before an analysis is run - REALISTIC TAMIL NADU COORDINATES
export const MOCK_ANALYSIS_DATA: AnalysisResponse = {
  deforestation: {
    areaLost: 14.2,
    pixelsLost: 4250,
    hotspotsFound: 12,
    ndviDecline: 0.15,
    hotspots: [
      { id: "HS-001", location: [13.12, 80.28], pixels: 850, area: "Chennai Outer Ring" },
      { id: "HS-002", location: [11.67, 78.15], pixels: 820, area: "Coimbatore West" },
      { id: "HS-003", location: [11.42, 79.70], pixels: 780, area: "Salem Forest Division" },
      { id: "HS-004", location: [12.97, 79.15], pixels: 750, area: "Vellore District" },
      { id: "HS-005", location: [10.79, 78.69], pixels: 720, area: "Tiruchirappalli Periphery" },
      { id: "HS-006", location: [9.92, 78.12], pixels: 680, area: "Madurai Hills" },
      { id: "HS-007", location: [11.02, 76.97], pixels: 650, area: "Nilgiris Foothills" },
      { id: "HS-008", location: [12.25, 78.82], pixels: 620, area: "Dharmapuri Reserve" },
      { id: "HS-009", location: [10.36, 77.96], pixels: 590, area: "Dindigul Forest" },
      { id: "HS-010", location: [13.62, 79.42], pixels: 560, area: "Tiruvallur Zone" },
      { id: "HS-011", location: [11.75, 79.82], pixels: 540, area: "Villupuram District" },
      { id: "HS-012", location: [12.68, 79.98], pixels: 520, area: "Kanchipuram Outskirts" },
    ]
  },
  urbanExpansion: {
    treesToBuildings: 8.5,
    pixelsConverted: 2100,
    urbanGrowthRate: 3.2,
    expansionZones: 8,
    zones: [
      { id: "UZ-001", location: [13.08, 80.27], pixels: 1200, area: "Chennai South Suburbs" },
      { id: "UZ-002", location: [11.02, 76.96], pixels: 950, area: "Coimbatore IT Corridor" },
      { id: "UZ-003", location: [9.93, 78.12], pixels: 880, area: "Madurai Ring Road" },
      { id: "UZ-004", location: [10.79, 78.70], pixels: 820, area: "Trichy Industrial Zone" },
      { id: "UZ-005", location: [11.42, 79.69], pixels: 780, area: "Salem Township" },
      { id: "UZ-006", location: [12.92, 80.13], pixels: 750, area: "Kanchipuram Expansion" },
      { id: "UZ-007", location: [13.65, 79.43], pixels: 680, area: "Tiruvallur New Town" },
      { id: "UZ-008", location: [8.73, 77.72], pixels: 620, area: "Tirunelveli Industrial Area" },
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
  },
  prediction: {
    nextYearVegetationLoss: 3.2,
    nextYearUrbanGrowth: 3.8,
    predictedRiskScore: 82.5,
    confidence: 0.89,
    recommendation: "Critical risk trajectory detected. Immediate large-scale reforestation and strict urban control measures required to prevent irreversible environmental damage.",
    projectedYear: 2027
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
