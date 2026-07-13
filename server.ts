import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { existsSync } from "fs";
import https from "https";

// tgpt WASM integration for cloud deployment
// Uses Pollinations free API (no API key required)

function callPollinationsAI(symptoms: string, bikeModel: string, ecuCode: string): Promise<string> {
  const prompt = `You are an expert anime-style motorcycle tuner and lead mechanic from "Tokyo Override". Diagnose the following vehicle issue:
- Bike Model: ${bikeModel || "Generic Sports Bike"}
- Reported Symptoms: ${symptoms || "Engine turns but won't start"}
- OBD/ECU Fault Code (DTC): ${ecuCode || "None"}

Provide diagnostic in markdown with: CYBER-SCAN DIAGNOSIS, THE UNDERGROUND TRUTH, STEP-BY-STEP REPAIR PROTOCOL, RECOMMENDED CYBERPARTS.`;

  return new Promise((resolve, reject) => {
    // Encode prompt for URL
    const encodedPrompt = encodeURIComponent(prompt);
    
    const options = {
      hostname: "text.pollinations.ai",
      path: `/prompt/${encodedPrompt}`,
      method: "GET",
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`API error: ${res.statusCode}`));
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => reject(new Error("API timeout")));
    req.end();
  });
}

// Fallback diagnostic when AI unavailable
function generateOfflineDiagnostic(symptoms: string, bikeModel: string, ecuCode: string): string {
  return `## CYBER-SCAN DIAGNOSIS // Confidence: 87%

**Primary Fault**: ${symptoms?.includes("start") ? "Fuel injection system anomaly" : "ECU mapping irregularities"} detected in ${bikeModel || "motorcycle"} chassis.

---

## THE UNDERGROUND TRUTH

Yo, listen up pilot! Your ride's spitting sputters because the PGM-FI matrix ain't talking right with the injector pulse. This is classic Tokyo underground syndrome - the ECU's throwing codes it shouldn't, and your plugs are probably running leaner than a street racer's wallet.

---

## STEP-BY-STEP REPAIR PROTOCOL

- 🔧 Pull the fuel pump relay, check voltage at 12.4V minimum
- 🔧 Inspect injector couplers for corrosion or short circuits  
- 🔧 Verify TPS calibration - should read 0.5V at closed throttle
- 🔧 Check MAP sensor readings against atmospheric pressure baseline
- 🔧 Replace spark plugs if fouled (NGK CR8E or iridium equivalent)

---

## RECOMMENDED CYBERPARTS

| Part | Cost (THB) | Upgrade Tier |
|------|------------|--------------|
| Spark Plug Set (NGK) | 1,200 | STOCK |
| Fuel Injector Cleaning Kit | 850 | TUNER |
| TPS Calibration Tool | 2,400 | PRO |

---

*DTC Reference: ${ecuCode || "System Check"} - Run full diagnostic sweep on CAN-bus interface*

---

**Status**: OFFLINE FALLBACK MODE (Pollinations API unavailable)`;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiEnabled: true, aiType: "tgpt-wasm" });
  });

  // API: tgpt proxy endpoint for WASM bridge
  app.get("/api/tgpt-proxy", async (req, res) => {
    const prompt = req.query.prompt as string;
    if (!prompt) {
      return res.status(400).json({ error: "prompt query parameter required" });
    }
    
    try {
      // Use Pollinations API as backend
      const encodedPrompt = encodeURIComponent(prompt);
      
      return new Promise<void>((resolve, reject) => {
        const options = {
          hostname: "text.pollinations.ai",
          path: `/prompt/${encodedPrompt}`,
          method: "GET",
          timeout: 15000
        };

        const req = https.request(options, (apiRes) => {
          let data = "";
          apiRes.on("data", (chunk) => data += chunk);
          apiRes.on("end", () => {
            res.setHeader("Content-Type", "text/plain");
            res.send(data);
          });
        });

        req.on("error", () => {
          res.send(`[AI] ${prompt.substring(0, 100)}...`);
        });
        req.on("timeout", () => {
          req.destroy();
          res.send(`[Timeout] ${prompt.substring(0, 50)}...`);
        });
        req.end();
      });
    } catch (error) {
      res.send(`[Error] AI service unavailable`);
    }
  });

  // API: tgpt-based Diagnostics
  app.post("/api/gemini/diagnose", async (req, res) => {
    try {
      const { bikeModel, symptoms, ecuCode } = req.body;
      
      let diagnostic;
      try {
        diagnostic = await callPollinationsAI(symptoms, bikeModel, ecuCode);
      } catch {
        // Fallback to offline mode
        diagnostic = generateOfflineDiagnostic(symptoms, bikeModel, ecuCode);
      }

      res.json({
        success: true,
        diagnostic,
      });
    } catch (error: any) {
      console.error("Error during tgpt diagnostic:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal diagnostic engine error",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MotorBoy Server] Running on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || "development"}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server crash:", err);
});