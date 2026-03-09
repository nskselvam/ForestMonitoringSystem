import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.analysis.run.path, async (req, res) => {
    try {
      const input = api.analysis.run.input.parse(req.body);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response matching the screenshot
      const response = {
        deforestation: {
          areaLost: 27.32,
          pixelsLost: 10930,
          hotspotsFound: 10,
          ndviDecline: 2.0,
          hotspots: [
            { id: "1", location: [48, 70], pixels: 27, area: "2700 m²" },
            { id: "2", location: [184, 68], pixels: 22, area: "2200 m²" },
            { id: "3", location: [188, 184], pixels: 22, area: "2200 m²" },
            { id: "4", location: [103, 173], pixels: 19, area: "1900 m²" },
            { id: "5", location: [9, 7], pixels: 18, area: "1800 m²" }
          ]
        },
        urbanExpansion: {
          treesToBuildings: 33.06,
          pixelsConverted: 13226,
          urbanGrowthRate: 9.9,
          expansionZones: 10,
          zones: [
            { id: "1", location: [6, 4], pixels: 36, area: "3600 m²" },
            { id: "2", location: [103, 172], pixels: 32, area: "3200 m²" },
            { id: "3", location: [48, 72], pixels: 30, area: "3000 m²" },
            { id: "4", location: [131, 91], pixels: 29, area: "2900 m²" },
            { id: "5", location: [136, 126], pixels: 26, area: "2600 m²" }
          ]
        },
        indices: {
          ndvi: {
            year1: 0.618,
            year2: 0.598,
            change: -0.020
          },
          ndbi: {
            year1: -0.154,
            year2: -0.127,
            change: 0.027
          }
        },
        visualChange: {
          vegetationLoss: 27.32,
          vegetationLossPixels: 10930,
          urbanExpansion: 33.06,
          urbanExpansionPixels: 13226,
          totalChange: 36.19
        },
        landCover: {
          year1: {
            water: 0,
            vegetation: 78.0,
            builtUp: 22.0,
            barren: 0
          },
          year2: {
            water: 0,
            vegetation: 74.3,
            builtUp: 25.7,
            barren: 0
          }
        },
        risk: {
          score: 52.6,
          level: "MEDIUM RISK",
          transitionVelocity: 36.19
        },
        changeSummary: {
          waterToBarren: 0,
          vegetationToBuiltUp: 19.92,
          vegetationToBarren: 0,
          totalChanged: 36.19
        }
      };

      res.status(200).json(response);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
