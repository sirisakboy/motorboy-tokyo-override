import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Cpu, Search, AlertTriangle, ShieldAlert, Sparkles, RefreshCw, Send, Bike, CheckCircle } from "lucide-react";
import { MotorcycleModel, DTCError, SensorStatus } from "../types";
import { MOTORCYCLE_MODELS, DTC_ERRORS } from "../data";

interface CyberDiagnosticsProps {
  activeBike: MotorcycleModel;
  onSelectBike: (bike: MotorcycleModel) => void;
}

const PRESET_SYMPTOMS = [
  "รอบเครื่องวอดดับทันทีเมื่อบิดคันเร่งสุดปลอก (Engine bogs down and cuts at wide-open throttle)",
  "สตาร์ทติดยากมากหลังจากจอดรถทิ้งไว้ค่ำคืน (Engine hesitates and fails cold starts)",
  "รอบเครื่องยนต์สวิง ไม่ยอมนิ่ง และมีควันดำกลิ่นน้ำมันแรง (Unstable fluctuating idle speed with heavy fuel smell)",
  "เครื่องยนต์วิด ดับกลางอากาศเมื่อเบรกกะทันหัน (Engine cuts out suddenly when decelerating or braking)",
  "บิดไม่ออก รอบตันที่ 8000 RPM แล้วตื้อเหมือนไฟจุดระเบิดไม่พอ (Power caps out at 8000 RPM, spark delivery failure)"
];

const SCAN_LOG_STEPS = [
  "INTERCEPTING CAN-BUS OBD CONNECTION...",
  "EXTRACTING ACTIVE MEMORY BUFFER FAULT REGISTERS...",
  "SAMPLING THROTTLE POSITION SENSOR FEEDBACK VOLTAGE...",
  "INTERROGATING FUEL PRESSURE & OXYGEN SENSORS FEEDBACK...",
  "COMPILING TELEMETRY DATA MATRIX FOR CYBER-MECHANIC...",
  "INITIATING SECURE GEMINI AI DIAGNOSTIC RECONSTRUCTION..."
];

export default function CyberDiagnostics({ activeBike, onSelectBike }: CyberDiagnosticsProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string>("");
  const [selectedDtcCode, setSelectedDtcCode] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScanLog, setCurrentScanLog] = useState("");
  const [diagnosticReport, setDiagnosticReport] = useState<string>("");

  // Sensor harness connectivity statuses
  const [sensors, setSensors] = useState<SensorStatus[]>([
    { id: "tps", name: "Throttle Position Sensor", japaneseName: "スロットルポジション", value: "0.85", unit: "V", connected: true, errorCode: "P0122", normalRange: "0.5V - 4.5V" },
    { id: "o2", name: "Oxygen (O2) Lambda Sensor", japaneseName: "酸素センサー", value: "0.45", unit: "V", connected: true, errorCode: "P0171", normalRange: "0.1V - 0.9V" },
    { id: "map", name: "Manifold Absolute Pressure", japaneseName: "吸気圧センサー", value: "98", unit: "kPa", connected: true, errorCode: "P0107", normalRange: "20 - 110 kPa" },
    { id: "ect", name: "Engine Coolant Temp Sensor", japaneseName: "水温センサー", value: "84", unit: "°C", connected: true, errorCode: "P0217", normalRange: "70°C - 105°C" },
    { id: "ckp", name: "Crankshaft Position Sensor", japaneseName: "クランク角センサー", value: "1150", unit: "Hz", connected: true, errorCode: "P0335", normalRange: "1000 - 12000 Hz" }
  ]);

  // Fluctuate live sensor readings slightly to represent a running motor
  useEffect(() => {
    const timer = setInterval(() => {
      setSensors(prev => prev.map(sensor => {
        if (!sensor.connected) return sensor;
        
        let val = parseFloat(sensor.value);
        if (sensor.id === "tps") {
          val = parseFloat((0.8 + Math.random() * 0.1).toFixed(2));
        } else if (sensor.id === "o2") {
          val = parseFloat((0.3 + Math.random() * 0.3).toFixed(2));
        } else if (sensor.id === "map") {
          val = Math.round(96 + Math.random() * 4);
        } else if (sensor.id === "ect") {
          val = Math.round(83 + Math.sin(Date.now() / 10000) * 2);
        } else if (sensor.id === "ckp") {
          val = Math.round(1120 + Math.random() * 40);
        }
        return { ...sensor, value: val.toString() };
      }));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSensorConnection = (id: string) => {
    setSensors(prev => prev.map(s => {
      if (s.id === id) {
        const nextState = !s.connected;
        if (!nextState) {
          // Unplugged -> trigger the DTC error!
          setSelectedDtcCode(s.errorCode);
          setSelectedSymptoms(`ระบบตรวจพบว่าเซ็นเซอร์ ${s.name} (OBD Code ${s.errorCode}) ขาดการเชื่อมต่อหรือมีกระแสไฟต่ำผิดปกติ มีอาการวอดเร่งไม่ขึ้น`);
        } else {
          // Connected -> clear the specific DTC error if it was selected
          if (selectedDtcCode === s.errorCode) {
            setSelectedDtcCode("");
          }
        }
        return { 
          ...s, 
          connected: nextState,
          value: nextState ? s.value : "ERR"
        };
      }
      return s;
    }));
  };

  const handleResetAllSensors = () => {
    setSensors(prev => prev.map(s => ({ ...s, connected: true })));
    setSelectedDtcCode("");
    setSelectedSymptoms("");
  };


  // Scan progress simulator
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      setScanProgress(0);
      setDiagnosticReport("");
      setCurrentScanLog(SCAN_LOG_STEPS[0]);

      interval = setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + 1.25; // Reaches 100 in 4-5 seconds
          
          // Rotate scan logs based on progress percentage
          const stepIndex = Math.floor((next / 100) * SCAN_LOG_STEPS.length);
          if (stepIndex < SCAN_LOG_STEPS.length) {
            setCurrentScanLog(SCAN_LOG_STEPS[stepIndex]);
          }

          if (next >= 100) {
            clearInterval(interval);
            // Trigger actual API request
            fetchDiagnosticResult();
            return 100;
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const fetchDiagnosticResult = async () => {
    try {
      const response = await fetch("/api/gemini/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bikeModel: activeBike.name,
          symptoms: selectedSymptoms || "Engine hesitates under full throttle acceleration.",
          ecuCode: selectedDtcCode || "None"
        }),
      });
      const data = await response.json();
      if (data.success || data.offline) {
        setDiagnosticReport(data.diagnostic);
      } else {
        setDiagnosticReport(`### ⚠️ CONNECTIONS MALFUNCTION\n\nFailed to establish synaptic uplink to the central diagnostic processor. Core feedback details:\n- **Error**: ${data.error || "Uplink timed out"}`);
      }
    } catch (e: any) {
      setDiagnosticReport(`### ⚠️ CAN-BUS BRIDGE MALFUNCTION\n\nFailed to dispatch packets to remote diagnosis engine.\n\n- **Details**: ${e.message || "Network socket error"}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePresetSelect = (preset: string) => {
    setSelectedSymptoms(preset);
  };

  const activeDtcObj = DTC_ERRORS.find(d => d.code === selectedDtcCode);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="diagnostics-panel">
      
      {/* INPUT PANEL - 5 COLS */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* VEHICLE PROFILE CARD */}
        <div className="bg-cyber-card border border-cyber-gray p-6 rounded-lg relative overflow-hidden" id="vehicle-profile-diagnostics">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cyber-gray">
            <Cpu className="text-cyber-orange w-5 h-5" />
            <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
              SCANNER UPLINK // TARGET SELECT
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            {/* Bike Model selector */}
            <div className="flex flex-col gap-1.5" id="diagnostic-bike-select">
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                ACTIVE VEHICLE NODE
              </label>
              <select
                id="bike-select-dropdown"
                value={activeBike.id}
                onChange={(e) => {
                  const found = MOTORCYCLE_MODELS.find(m => m.id === e.target.value);
                  if (found) onSelectBike(found);
                }}
                className="w-full bg-cyber-darker text-white border border-cyber-gray p-2.5 rounded font-mono text-xs focus:outline-none focus:border-cyber-orange"
              >
                {MOTORCYCLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.year})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Tech Specs */}
            <div className="bg-cyber-darker p-3 rounded border border-cyber-gray grid grid-cols-2 gap-2 font-mono text-xs text-slate-400">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">ECU UNIT</span>
                <p className="font-bold text-slate-200">{activeBike.ecuSystem}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">MAX REDLINE</span>
                <p className="font-bold text-cyber-orange">{activeBike.maxRpm} RPM</p>
              </div>
            </div>
          </div>
        </div>

        {/* OBD LIVE SENSOR STREAM HARNESS */}
        <div className="bg-cyber-card border border-cyber-gray p-6 rounded-lg relative overflow-hidden" id="obd-sensor-stream">
          <div className="absolute top-0 right-0 w-2 h-full bg-cyber-blue/10 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-cyber-gray">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyber-blue rounded-full animate-ping" />
              <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
                LIVE OBD SENSOR STREAM
              </h3>
            </div>
            {sensors.some(s => !s.connected) && (
              <button
                onClick={handleResetAllSensors}
                className="text-[9px] font-mono bg-cyber-green/10 border border-cyber-green/40 text-cyber-green px-2 py-0.5 rounded hover:bg-cyber-green/20 transition-all cursor-pointer"
              >
                CONNECT ALL
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400 font-mono mb-3 leading-relaxed">
            Interrogating the running CAN-bus signals. Toggle/click a sensor harness to unplug it and simulate a wiring failure or sensor fault.
          </p>

          <div className="flex flex-col gap-2">
            {sensors.map((sensor) => (
              <div 
                key={sensor.id}
                className={`p-2 rounded border font-mono text-xs flex justify-between items-center transition-all ${
                  sensor.connected 
                    ? "bg-cyber-darker/60 border-cyber-gray/50 hover:border-cyber-blue/40" 
                    : "bg-red-950/25 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.1)]"
                }`}
              >
                <div className="truncate pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${sensor.connected ? "bg-cyber-blue" : "bg-red-500 animate-pulse"}`} />
                    <span className="text-white font-bold">{sensor.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block uppercase">
                    {sensor.japaneseName} // RANGE: {sensor.normalRange}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`font-black text-xs ${sensor.connected ? "text-cyber-blue glow-blue" : "text-red-400"}`}>
                      {sensor.value}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-0.5">{sensor.unit}</span>
                  </div>

                  <button
                    onClick={() => handleToggleSensorConnection(sensor.id)}
                    className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all border cursor-pointer ${
                      sensor.connected
                        ? "bg-cyber-darker border-cyber-gray text-slate-400 hover:text-white hover:bg-cyber-gray/40"
                        : "bg-red-500 text-black border-red-600 font-black animate-pulse"
                    }`}
                  >
                    {sensor.connected ? "UNPLUG" : "RE-CONNECT"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OBD CODES & SYMPTOMS FORM */}
        <div className="bg-cyber-card border border-cyber-gray p-6 rounded-lg flex flex-col gap-4" id="diagnostics-form-inputs">
          <div className="flex items-center gap-2 pb-2 border-b border-cyber-gray">
            <Search className="text-cyber-orange w-5 h-5" />
            <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
              FAULT FEEDBACK REGISTER
            </h3>
          </div>

          {/* DTC Select */}
          <div className="flex flex-col gap-1.5" id="dtc-fault-select">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
                OBD DTC SYSTEM FAULT
              </label>
              {activeDtcObj && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                  activeDtcObj.severity === "CRITICAL" ? "bg-red-950/40 border-red-500 text-red-400" :
                  activeDtcObj.severity === "MEDIUM" ? "bg-yellow-950/40 border-yellow-500 text-yellow-400" :
                  "bg-blue-950/40 border-blue-500 text-blue-400"
                }`}>
                  {activeDtcObj.severity} ALERT
                </span>
              )}
            </div>
            <select
              id="dtc-code-dropdown"
              value={selectedDtcCode}
              onChange={(e) => setSelectedDtcCode(e.target.value)}
              className="w-full bg-cyber-darker text-white border border-cyber-gray p-2.5 rounded font-mono text-xs focus:outline-none focus:border-cyber-orange"
            >
              <option value="">No Active ECU Fault Code (All sensors green)</option>
              {DTC_ERRORS.map((dtc) => (
                <option key={dtc.code} value={dtc.code}>
                  {dtc.code} - {dtc.title}
                </option>
              ))}
            </select>

            {activeDtcObj && (
              <div className="bg-cyber-darker/60 p-2.5 rounded border border-cyber-gray/40 text-[11px] text-slate-400 font-mono mt-1">
                <span className="text-slate-300 font-bold uppercase text-[10px]">Fault Details:</span>
                <p className="mt-0.5">{activeDtcObj.description}</p>
              </div>
            )}
          </div>

          {/* Symptoms Input */}
          <div className="flex flex-col gap-1.5" id="symptoms-entry">
            <label className="text-xs font-mono text-slate-400 uppercase font-semibold">
              SYMPTOMS IN DETAIL (ภาษาไทย / ENGLISH)
            </label>
            <textarea
              id="symptoms-text-area"
              value={selectedSymptoms}
              onChange={(e) => setSelectedSymptoms(e.target.value)}
              placeholder="ระบุอาการเสียที่เจอ เช่น บิดหมดปลอกแล้วรอบวอด หรืออธิบายความผิดปกติอื่นๆ..."
              rows={3}
              className="w-full bg-cyber-darker text-white border border-cyber-gray p-2.5 rounded font-mono text-xs focus:outline-none focus:border-cyber-orange resize-none"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-col gap-1.5" id="preset-symptoms-scroller">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
              UNDERGROUND GARAGE PRESETS
            </span>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
              {PRESET_SYMPTOMS.map((preset, index) => (
                <button
                  key={index}
                  id={`preset-symptom-btn-${index}`}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`text-left p-2 rounded text-[11px] font-mono transition-all border ${
                    selectedSymptoms === preset
                      ? "bg-cyber-orange/10 border-cyber-orange text-cyber-orange"
                      : "bg-cyber-darker border-cyber-gray text-slate-400 hover:text-slate-300 hover:bg-cyber-gray/20"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Scan Action trigger */}
          <button
            id="diagnostics-scan-btn"
            onClick={() => setIsScanning(true)}
            disabled={isScanning}
            className="w-full mt-2 py-3 bg-cyber-orange hover:bg-orange-400 disabled:bg-cyber-gray disabled:text-slate-500 text-black font-display font-black tracking-widest text-xs uppercase rounded flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-950/40 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                CYBER-SCANNING OBD CODES...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                EXECUTE CYBER-SCAN WITH GEMINI
              </>
            )}
          </button>
        </div>

      </div>

      {/* RESULTS DISPLAY COLS (7 COLS) */}
      <div className="lg:col-span-7 flex flex-col min-h-[500px]">
        
        {/* HOLO TERMINAL REPORT DISPLAY */}
        <div className="bg-cyber-card border border-cyber-gray rounded-lg flex-1 flex flex-col relative overflow-hidden scanline" id="diagnostics-results-console">
          
          {/* Neon Orange Glowing scanning overlay when active */}
          {isScanning && (
            <div className="absolute inset-0 bg-cyber-orange/[0.04] pointer-events-none z-10 flex flex-col items-center justify-center">
              {/* Vertical scanning bar */}
              <div className="absolute left-0 right-0 h-0.5 bg-cyber-orange/50 shadow-[0_0_15px_#ff5e00] scan-bar" />
              
              {/* Radar pulse target */}
              <div className="w-48 h-48 border border-cyber-orange/20 rounded-full flex items-center justify-center animate-ping opacity-60">
                <div className="w-32 h-32 border border-cyber-orange/40 rounded-full flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-cyber-orange animate-spin" />
                </div>
              </div>
            </div>
          )}

          {/* Terminal Title Bar */}
          <div className="bg-cyber-darker border-b border-cyber-gray px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyber-orange animate-pulse" />
              <span className="font-display font-bold text-xs tracking-widest text-slate-200">
                CYBER-DIAGNOSTIC TERMINAL REPORT
              </span>
            </div>
            <span className="font-mono text-[10px] text-cyber-orange bg-cyber-orange/10 px-2 py-0.5 rounded border border-cyber-orange/30">
              {isScanning ? `${Math.round(scanProgress)}% SCAN` : diagnosticReport ? "UPLINK SOLID" : "UPLINK STANDBY"}
            </span>
          </div>

          {/* Content window */}
          <div className="flex-1 p-6 font-mono text-sm overflow-y-auto max-h-[550px] relative bg-cyber-darker/30">
            
            {/* SCANNING ACTIVE PROGRESS READOUT */}
            {isScanning && (
              <div id="scanning-progress-logs" className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <p className="text-cyber-orange font-bold text-xs uppercase tracking-widest animate-pulse">
                  SYSTEM DIAGNOSIS TELEMETRY SWEEP IN PROGRESS...
                </p>
                
                {/* Visual Progress bar */}
                <div className="w-64 h-2 bg-cyber-gray rounded-full overflow-hidden border border-cyber-gray">
                  <div 
                    className="h-full bg-cyber-orange shadow-[0_0_8px_#ff5e00] transition-all duration-75"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 font-bold max-w-sm h-6 overflow-hidden">
                  {currentScanLog}
                </div>
              </div>
            )}

            {/* STANDBY STATE */}
            {!isScanning && !diagnosticReport && (
              <div id="diagnostics-standby-view" className="flex flex-col items-center justify-center h-full text-center py-20 opacity-60">
                <Cpu className="w-16 h-16 text-cyber-gray mb-4" />
                <h4 className="font-display font-bold text-sm tracking-widest text-slate-300 uppercase">
                  READY FOR TELEMETRY INPUT
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-normal">
                  Connect active vehicle model CAN-bus, enter fault symptoms or OBD trouble registers, and hit "EXECUTE CYBER-SCAN" to analyze issues with AI guidance.
                </p>
              </div>
            )}

            {/* LIVE MARKDOWN REPORT RENDER */}
            {!isScanning && diagnosticReport && (
              <div id="diagnostics-report-render" className="markdown-body text-slate-300 leading-relaxed space-y-4">
                <Markdown
                  components={{
                    h1: ({ ...props }) => <h1 className="font-display font-black text-lg text-white tracking-widest uppercase border-b border-cyber-gray pb-2 mt-4 glow-orange" {...props} />,
                    h2: ({ ...props }) => <h2 className="font-display font-bold text-sm text-cyber-orange tracking-widest uppercase mt-4" {...props} />,
                    h3: ({ ...props }) => <h3 className="font-display font-bold text-xs text-cyber-blue tracking-wide uppercase mt-3" {...props} />,
                    p: ({ ...props }) => <p className="text-xs font-sans text-slate-300" {...props} />,
                    ul: ({ ...props }) => <ul className="list-disc pl-5 space-y-1 my-2 text-xs font-sans text-slate-300" {...props} />,
                    ol: ({ ...props }) => <ol className="list-decimal pl-5 space-y-1 my-2 text-xs font-sans text-slate-300" {...props} />,
                    li: ({ ...props }) => <li className="text-xs text-slate-300" {...props} />,
                    code: ({ ...props }) => <code className="bg-cyber-darker text-cyber-green px-1.5 py-0.5 rounded text-xs border border-cyber-gray/50" {...props} />,
                    pre: ({ ...props }) => <pre className="bg-cyber-darker/90 p-3 rounded border border-cyber-gray my-3 overflow-x-auto text-[11px] text-cyber-green" {...props} />
                  }}
                >
                  {diagnosticReport}
                </Markdown>
              </div>
            )}

          </div>

          {/* Terminal Footer banner */}
          <div className="bg-cyber-darker/70 border-t border-cyber-gray px-6 py-3 flex justify-between items-center font-mono text-[10px] text-slate-500">
            <span>UPLINK CODE: OBDSYN-9762</span>
            <span>POWERED BY GEMINI-3.5-FLASH</span>
          </div>

        </div>

      </div>

    </div>
  );
}
