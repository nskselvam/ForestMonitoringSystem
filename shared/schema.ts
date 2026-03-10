import { z } from "zod";

export const analysisRequestSchema = z.object({
  startYear: z.number(),
  endYear: z.number(),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

export const hotspotSchema = z.object({
  id: z.string(),
  location: z.tuple([z.number(), z.number()]),
  pixels: z.number(),
  area: z.string(),
});

export const zoneSchema = z.object({
  id: z.string(),
  location: z.tuple([z.number(), z.number()]),
  pixels: z.number(),
  area: z.string(),
});

export const analysisResponseSchema = z.object({
  deforestation: z.object({
    areaLost: z.number(),
    pixelsLost: z.number(),
    hotspotsFound: z.number(),
    ndviDecline: z.number(),
    hotspots: z.array(hotspotSchema)
  }),
  urbanExpansion: z.object({
    treesToBuildings: z.number(),
    pixelsConverted: z.number(),
    urbanGrowthRate: z.number(),
    expansionZones: z.number(),
    zones: z.array(zoneSchema)
  }),
  indices: z.object({
    ndvi: z.object({
      year1: z.number(),
      year2: z.number(),
      change: z.number()
    }),
    ndbi: z.object({
      year1: z.number(),
      year2: z.number(),
      change: z.number()
    })
  }),
  visualChange: z.object({
    vegetationLoss: z.number(),
    vegetationLossPixels: z.number(),
    urbanExpansion: z.number(),
    urbanExpansionPixels: z.number(),
    totalChange: z.number()
  }),
  landCover: z.object({
    year1: z.object({
      water: z.number(),
      vegetation: z.number(),
      builtUp: z.number(),
      barren: z.number()
    }),
    year2: z.object({
      water: z.number(),
      vegetation: z.number(),
      builtUp: z.number(),
      barren: z.number()
    })
  }),
  risk: z.object({
    score: z.number(),
    level: z.string(),
    transitionVelocity: z.number()
  }),
  changeSummary: z.object({
    waterToBarren: z.number(),
    vegetationToBuiltUp: z.number(),
    vegetationToBarren: z.number(),
    totalChanged: z.number()
  }),
  prediction: z.object({
    nextYearVegetationLoss: z.number(),
    nextYearUrbanGrowth: z.number(),
    predictedRiskScore: z.number(),
    confidence: z.number(),
    recommendation: z.string(),
    projectedYear: z.number()
  }).optional()
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
