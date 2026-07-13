var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_https = __toESM(require("https"), 1);
function callPollinationsAI(symptoms, bikeModel, ecuCode) {
  const prompt = `You are an expert anime-style motorcycle tuner and lead mechanic from "Tokyo Override". Diagnose the following vehicle issue:
- Bike Model: ${bikeModel || "Generic Sports Bike"}
- Reported Symptoms: ${symptoms || "Engine turns but won't start"}
- OBD/ECU Fault Code (DTC): ${ecuCode || "None"}

Provide diagnostic in markdown with: CYBER-SCAN DIAGNOSIS, THE UNDERGROUND TRUTH, STEP-BY-STEP REPAIR PROTOCOL, RECOMMENDED CYBERPARTS.`;
  return new Promise((resolve, reject) => {
    const encodedPrompt = encodeURIComponent(prompt);
    const options = {
      hostname: "text.pollinations.ai",
      path: `/prompt/${encodedPrompt}`,
      method: "GET",
      timeout: 15e3
    };
    const req = import_https.default.request(options, (res) => {
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
function generateOfflineDiagnostic(symptoms, bikeModel, ecuCode) {
  return `## CYBER-SCAN DIAGNOSIS // Confidence: 87%

**Primary Fault**: ${symptoms?.includes("start") ? "Fuel injection system anomaly" : "ECU mapping irregularities"} detected in ${bikeModel || "motorcycle"} chassis.

---

## THE UNDERGROUND TRUTH

Yo, listen up pilot! Your ride's spitting sputters because the PGM-FI matrix ain't talking right with the injector pulse. This is classic Tokyo underground syndrome - the ECU's throwing codes it shouldn't, and your plugs are probably running leaner than a street racer's wallet.

---

## STEP-BY-STEP REPAIR PROTOCOL

- \u{1F527} Pull the fuel pump relay, check voltage at 12.4V minimum
- \u{1F527} Inspect injector couplers for corrosion or short circuits  
- \u{1F527} Verify TPS calibration - should read 0.5V at closed throttle
- \u{1F527} Check MAP sensor readings against atmospheric pressure baseline
- \u{1F527} Replace spark plugs if fouled (NGK CR8E or iridium equivalent)

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
  const app = (0, import_express.default)();
  const PORT = process.env.PORT || 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiEnabled: true, aiType: "tgpt-wasm" });
  });
  app.get("/api/tgpt-proxy", async (req, res) => {
    const prompt = req.query.prompt;
    if (!prompt) {
      return res.status(400).json({ error: "prompt query parameter required" });
    }
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      return new Promise((resolve, reject) => {
        const options = {
          hostname: "text.pollinations.ai",
          path: `/prompt/${encodedPrompt}`,
          method: "GET",
          timeout: 15e3
        };
        const req2 = import_https.default.request(options, (apiRes) => {
          let data = "";
          apiRes.on("data", (chunk) => data += chunk);
          apiRes.on("end", () => {
            res.setHeader("Content-Type", "text/plain");
            res.send(data);
          });
        });
        req2.on("error", () => {
          res.send(`[AI] ${prompt.substring(0, 100)}...`);
        });
        req2.on("timeout", () => {
          req2.destroy();
          res.send(`[Timeout] ${prompt.substring(0, 50)}...`);
        });
        req2.end();
      });
    } catch (error) {
      res.send(`[Error] AI service unavailable`);
    }
  });
  app.post("/api/gemini/diagnose", async (req, res) => {
    try {
      const { bikeModel, symptoms, ecuCode } = req.body;
      let diagnostic;
      try {
        diagnostic = await callPollinationsAI(symptoms, bikeModel, ecuCode);
      } catch {
        diagnostic = generateOfflineDiagnostic(symptoms, bikeModel, ecuCode);
      }
      res.json({
        success: true,
        diagnostic
      });
    } catch (error) {
      console.error("Error during tgpt diagnostic:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal diagnostic engine error"
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MotorBoy Server] Running on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || "development"}`);
  });
}
startServer().catch((err) => {
  console.error("Fatal server crash:", err);
});
//# sourceMappingURL=server.cjs.map
