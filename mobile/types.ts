// Types matching the backend schema

export interface Hotspot {
  id: string;
  location: [number, number];
  pixels: number;
  area: string;
}

export interface Zone {
  id: string;
  location: [number, number];
  pixels: number;
  area: string;
}

export interface AnalysisRequest {
  startYear: number;
  endYear: number;
}

export interface AnalysisResponse {
  deforestation: {
    areaLost: number;
    pixelsLost: number;
    hotspotsFound: number;
    ndviDecline: number;
    hotspots: Hotspot[];
  };
  urbanExpansion: {
    treesToBuildings: number;
    pixelsConverted: number;
    urbanGrowthRate: number;
    expansionZones: number;
    zones: Zone[];
  };
  indices: {
    ndvi: {
      year1: number;
      year2: number;
      change: number;
    };
    ndbi: {
      year1: number;
      year2: number;
      change: number;
    };
  };
  visualChange: {
    vegetationLoss: number;
    vegetationLossPixels: number;
    urbanExpansion: number;
    urbanExpansionPixels: number;
    totalChange: number;
  };
  landCover: {
    year1: {
      water: number;
      vegetation: number;
      builtUp: number;
      barren: number;
    };
    year2: {
      water: number;
      vegetation: number;
      builtUp: number;
      barren: number;
    };
  };
  risk: {
    score: number;
    level: string;
    transitionVelocity: number;
  };
  changeSummary: {
    waterToBarren: number;
    vegetationToBuiltUp: number;
    vegetationToBarren: number;
    totalChanged: number;
  };
  prediction?: {
    nextYearVegetationLoss: number;
    nextYearUrbanGrowth: number;
    predictedRiskScore: number;
    confidence: number;
    recommendation: string;
    projectedYear: number;
  };
}
