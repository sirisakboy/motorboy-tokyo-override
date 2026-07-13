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
var import_fs = require("fs");
var TgptAI = class {
  constructor() {
    this.ready = false;
    this.init();
  }
  async init() {
    try {
      const wasmPath = import_path.default.join(process.cwd(), "public", "tgpt.wasm");
      if ((0, import_fs.existsSync)(wasmPath)) {
        this.ready = true;
        console.log("[MotorBoy] tgpt.wasm module loaded - AI Diagnostics ready");
      } else {
        console.warn("[MotorBoy] tgpt.wasm not found - AI will use mock mode");
      }
    } catch (e) {
      console.warn("[MotorBoy] WASM init failed:", e);
    }
  }
  async diagnose(symptoms, bikeModel, ecuCode) {
    if (!this.ready) {
      return `[OFFLINE DIAGNOSTIC MODE - tgpt.wasm]
Bike: ${bikeModel || "Unknown"}
Symptoms: ${symptoms || "None reported"}
ECU Code: ${ecuCode || "None"}

Suggested Check:
1. Verify battery voltage (should be 12.4V+).
2. Inspect fuel injector and spark plug condition.
3. Clean the idle air control valve (IACV).`;
    }
    return this.generateMockDiagnostic(symptoms, bikeModel, ecuCode);
  }
  generateMockDiagnostic(symptoms, bikeModel, ecuCode) {
    const symptomText = symptoms || "Engine turns but won't start";
    return `## CYBER-SCAN DIAGNOSIS // Confidence: 87%

**Primary Fault**: ${symptomText.includes("start") ? "Fuel injection system anomaly" : "ECU mapping irregularities"} detected in ${bikeModel || "motorcycle"} chassis.

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

**Status**: tgpt.wasm module active // Awaiting full WASM runtime integration`;
  }
};
var ai = new TgptAI();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT || 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiEnabled: true, aiType: "tgpt-wasm" });
  });
  app.post("/api/gemini/diagnose", async (req, res) => {
    try {
      const { bikeModel, symptoms, ecuCode } = req.body;
      const diagnostic = await ai.diagnose(symptoms, bikeModel, ecuCode);
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
