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
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Helper function to generate random value in range
      const random = (min: number, max: number) => Math.random() * (max - min) + min;
      const randomInt = (min: number, max: number) => Math.floor(random(min, max));

      // Tamil Nadu hotspot locations (realistic coordinates with city names)
      const tnHotspots = [
        { base: [13.12, 80.28], area: "Chennai Outer Ring" },
        { base: [11.67, 78.15], area: "Coimbatore West" },
        { base: [11.42, 79.70], area: "Salem Forest Division" },
        { base: [12.97, 79.15], area: "Vellore District" },
        { base: [10.79, 78.69], area: "Tiruchirappalli Periphery" },
        { base: [9.92, 78.12], area: "Madurai Hills" },
        { base: [11.02, 76.97], area: "Nilgiris Foothills" },
        { base: [12.25, 78.82], area: "Dharmapuri Reserve" },
        { base: [10.36, 77.96], area: "Dindigul Forest" },
        { base: [13.62, 79.42], area: "Tiruvallur Zone" },
        { base: [11.75, 79.82], area: "Villupuram District" },
        { base: [12.68, 79.98], area: "Kanchipuram Outskirts" },
      ];

      const urbanZones = [
        { base: [13.08, 80.27], area: "Chennai South Suburbs" },
        { base: [11.02, 76.96], area: "Coimbatore IT Corridor" },
        { base: [9.93, 78.12], area: "Madurai Ring Road" },
        { base: [10.79, 78.70], area: "Trichy Industrial Zone" },
        { base: [11.42, 79.69], area: "Salem Township" },
        { base: [12.92, 80.13], area: "Kanchipuram Expansion" },
        { base: [13.65, 79.43], area: "Tiruvallur New Town" },
        { base: [8.73, 77.72], area: "Tirunelveli Industrial Area" },
      ];

      // Generate random hotspots with slight coordinate variations
      const hotspots = tnHotspots.map((spot, idx) => ({
        id: `HS-${String(idx + 1).padStart(3, '0')}`,
        location: [
          Number((spot.base[0] + random(-0.1, 0.1)).toFixed(2)),
          Number((spot.base[1] + random(-0.1, 0.1)).toFixed(2))
        ],
        pixels: randomInt(500, 900),
        area: spot.area
      }));

      const zones = urbanZones.map((zone, idx) => ({
        id: `UZ-${String(idx + 1).padStart(3, '0')}`,
        location: [
          Number((zone.base[0] + random(-0.08, 0.08)).toFixed(2)),
          Number((zone.base[1] + random(-0.08, 0.08)).toFixed(2))
        ],
        pixels: randomInt(600, 1300),
        area: zone.area
      }));

      // Random analysis results
      const vegetationLoss = Number(random(20, 35).toFixed(2));
      const urbanExpansion = Number(random(25, 40).toFixed(2));
      const totalPixelsLost = randomInt(8000, 15000);
      const totalPixelsConverted = randomInt(10000, 18000);

      const year1Vegetation = Number(random(70, 85).toFixed(1));
      const year1BuiltUp = Number((100 - year1Vegetation).toFixed(1));
      const year2Vegetation = Number((year1Vegetation - vegetationLoss).toFixed(1));
      const year2BuiltUp = Number((100 - year2Vegetation).toFixed(1));

      const ndviChange = Number(random(-0.08, -0.01).toFixed(3));
      const ndbiChange = Number(random(0.01, 0.05).toFixed(3));

      const riskScore = Number(random(45, 85).toFixed(1));
      const riskLevel = riskScore > 70 ? "HIGH RISK" : riskScore > 50 ? "MEDIUM RISK" : "LOW RISK";

      const predictedVegLoss = Number(random(2.5, 4.5).toFixed(1));
      const predictedUrbanGrowth = Number(random(3.0, 5.0).toFixed(1));
      const predictedRisk = Number(Math.min(riskScore + random(5, 15), 95).toFixed(1));
      const confidence = Number(random(0.80, 0.94).toFixed(2));

      const response = {
        deforestation: {
          areaLost: vegetationLoss,
          pixelsLost: totalPixelsLost,
          hotspotsFound: hotspots.length,
          ndviDecline: Math.abs(ndviChange),
          hotspots
        },
        urbanExpansion: {
          treesToBuildings: urbanExpansion,
          pixelsConverted: totalPixelsConverted,
          urbanGrowthRate: Number(random(6, 12).toFixed(1)),
          expansionZones: zones.length,
          zones
        },
        indices: {
          ndvi: {
            year1: Number(random(0.60, 0.75).toFixed(3)),
            year2: Number(random(0.55, 0.70).toFixed(3)),
            change: ndviChange
          },
          ndbi: {
            year1: Number(random(-0.20, -0.10).toFixed(3)),
            year2: Number(random(-0.15, -0.05).toFixed(3)),
            change: ndbiChange
          }
        },
        visualChange: {
          vegetationLoss,
          vegetationLossPixels: totalPixelsLost,
          urbanExpansion,
          urbanExpansionPixels: totalPixelsConverted,
          totalChange: Number(random(30, 45).toFixed(2))
        },
        landCover: {
          year1: {
            water: Number(random(0, 3).toFixed(1)),
            vegetation: year1Vegetation,
            builtUp: year1BuiltUp,
            barren: Number(random(0, 2).toFixed(1))
          },
          year2: {
            water: Number(random(0, 2).toFixed(1)),
            vegetation: year2Vegetation,
            builtUp: year2BuiltUp,
            barren: Number(random(0, 3).toFixed(1))
          }
        },
        risk: {
          score: riskScore,
          level: riskLevel,
          transitionVelocity: Number(random(30, 45).toFixed(2))
        },
        changeSummary: {
          waterToBarren: Number(random(0, 2).toFixed(2)),
          vegetationToBuiltUp: Number(random(15, 25).toFixed(2)),
          vegetationToBarren: Number(random(0, 5).toFixed(2)),
          totalChanged: Number(random(30, 45).toFixed(2))
        },
        prediction: {
          nextYearVegetationLoss: predictedVegLoss,
          nextYearUrbanGrowth: predictedUrbanGrowth,
          predictedRiskScore: predictedRisk,
          confidence,
          recommendation: predictedRisk > 75 
            ? "Critical risk trajectory detected. Immediate large-scale reforestation and strict urban control measures required to prevent irreversible environmental damage."
            : predictedRisk > 60
            ? "High risk trajectory. Immediate conservation measures and sustainable development practices required."
            : "Moderate risk levels. Continue monitoring and implement preventive conservation strategies.",
          projectedYear: input.endYear + 1
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
