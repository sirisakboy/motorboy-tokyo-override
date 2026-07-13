import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  Cpu, 
  Activity, 
  Layers, 
  Bike, 
  History, 
  Flame, 
  Zap, 
  Scale, 
  Terminal, 
  User, 
  Clock, 
  Settings, 
  HelpCircle,
  TrendingUp,
  Sliders,
  Sparkles,
  ChevronRight,
  Receipt,
  Printer,
  Coins,
  Check,
  CheckCircle2
} from "lucide-react";
import { MOTORCYCLE_MODELS, SPARE_PARTS } from "./data";
import { MotorcycleModel, SparePart } from "./types";
import DynoStage from "./components/DynoStage";
import CyberDiagnostics from "./components/CyberDiagnostics";
import BlueprintCatalog from "./components/BlueprintCatalog";

export default function App() {
  // Application Global States
  const [activeBike, setActiveBike] = useState<MotorcycleModel>(MOTORCYCLE_MODELS[0]);
  const [installedUpgrades, setInstalledUpgrades] = useState<SparePart[]>([]);
  const [activeTab, setActiveTab] = useState<"dyno" | "diagnose" | "blueprint" | "garage">("dyno");
  
  // Dyno Run Logs
  const [dynoHistory, setDynoHistory] = useState<Array<{
    id: string;
    bikeName: string;
    hp: number;
    torque: number;
    modsCount: number;
    timestamp: string;
  }>>([]);

  // Underground Service Invoice States
  const [invoiceCustomer, setInvoiceCustomer] = useState("sirisakkhacha@gmail.com");
  const [invoiceLaborHours, setInvoiceLaborHours] = useState(3);
  const [invoiceLaborRate, setInvoiceLaborRate] = useState(1500); // THB per hour
  const [invoiceStatus, setInvoiceStatus] = useState<"DRAFT" | "PENDING" | "PAID">("PENDING");
  const [invoiceNotes, setInvoiceNotes] = useState("System tuning executed on active PGM-FI parameter maps. Fuel trim delivery synchronized with mechanical bolt-ons.");
  const [invoiceId, setInvoiceId] = useState(`WO-${Math.floor(100000 + Math.random() * 900000)}`);

  // Live system clock for HUD realism
  const [systemTime, setSystemTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toISOString().replace("T", " ").substring(0, 19));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate cumulative upgrades impact
  const totalHpBonus = installedUpgrades.reduce((sum, item) => sum + item.hpBonus, 0);
  const totalTorqueBonus = installedUpgrades.reduce((sum, item) => sum + item.torqueBonus, 0);
  const totalWeightReduced = installedUpgrades.reduce((sum, item) => sum + item.weightReduction, 0);

  const finalHp = parseFloat((activeBike.baseHp + totalHpBonus).toFixed(1));
  const finalTorque = parseFloat((activeBike.baseTorque + totalTorqueBonus).toFixed(1));
  const finalWeightDelta = parseFloat(totalWeightReduced.toFixed(1));

  // Handle upgrade installations
  const handleToggleUpgrade = (part: SparePart) => {
    const exists = installedUpgrades.some((item) => item.id === part.id);
    if (exists) {
      setInstalledUpgrades((prev) => prev.filter((item) => item.id !== part.id));
      triggerMechanicMessage(`Uninstalled ${part.name}. Lost ${part.hpBonus} HP potential.`);
    } else {
      setInstalledUpgrades((prev) => [...prev, part]);
      triggerMechanicMessage(`Successfully hard-wired ${part.name} to the CAN-bus matrix! +${part.hpBonus} HP unleashed!`);
    }
  };

  // Cyber Mechanic Assistant Rei
  const [mechanicMessage, setMechanicMessage] = useState(
    "Welcome to the Tokyo Override underground tuning network. Ready to push your machine beyond manufacturer limitations? Choose a vehicle to start scanning."
  );
  const [isMessageTyping, setIsMessageTyping] = useState(false);

  const triggerMechanicMessage = (msg: string) => {
    setIsMessageTyping(true);
    setMechanicMessage(msg);
    setTimeout(() => {
      setIsMessageTyping(false);
    }, 500);
  };

  // Automatically update Rei's guidance based on active tab or selections
  useEffect(() => {
    if (activeTab === "dyno") {
      setMechanicMessage(
        `Dyno testing the ${activeBike.name}. Adjust the ECU slider parameters (Fuel, Spark, and Rev Limit) to find the optimum stoichiometric burning point. Hit 'RUN DYNO SWEEP' to execute a full speed sweep!`
      );
    } else if (activeTab === "diagnose") {
      setMechanicMessage(
        "Synaptic Gemini diagnostics online. Connect your bike to the OBD interface, enter the symptoms or select fault logs from the underground register, and I'll run an AI cyber-scan to outline a precise repair protocol."
      );
    } else if (activeTab === "blueprint") {
      setMechanicMessage(
        "Manga Parts Catalog. Explore interactive high-tech components on the custom chassis blueprint. Hover or select target nodes to install premium bolt-ons like programmable ECUs or titanium headers."
      );
    } else if (activeTab === "garage") {
      setMechanicMessage(
        `Underground Garage ledger. Here is a summary of your active build. Your ${activeBike.name} is currently running at ${finalHp} HP and ${finalTorque} Nm with ${installedUpgrades.length} cybernetic modifications installed.`
      );
    }
  }, [activeTab, activeBike]);

  // Log a completed run
  const handleLogDynoRun = (hp: number, torque: number) => {
    const newLog = {
      id: `RUN-${Math.floor(1000 + Math.random() * 9000)}`,
      bikeName: activeBike.name,
      hp,
      torque,
      modsCount: installedUpgrades.length,
      timestamp: new Date().toLocaleTimeString(),
    };
    setDynoHistory((prev) => [newLog, ...prev.slice(0, 9)]);
    triggerMechanicMessage(`Telemetry logged successfully: ${hp} Peak HP / ${torque} Peak Torque Nm under active profile.`);
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-slate-100 cyber-grid relative pb-12 flex flex-col font-sans selection:bg-cyber-orange selection:text-black">
      
      {/* SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 scanline opacity-20" />

      {/* HEADER SECTION */}
      <header className="border-b border-cyber-gray bg-cyber-darker/95 backdrop-blur sticky top-0 z-40 px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyber-orange/10 border border-cyber-orange/40 rounded-lg animate-pulse">
            <Wrench className="w-6 h-6 text-cyber-orange" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-wider text-white glow-orange">
                MOTORBOY
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cyber-orange text-black font-bold uppercase rounded skew-x-12">
                TOKYO OVERRIDE (2024)
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">
              UNDERGROUND CAN-BUS TUNING NETWORK & AI DIAGNOSTICS HUD
            </p>
          </div>
        </div>

        {/* HUD HARDWARE STATS */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyber-orange" />
            <span>PILOT: <span className="text-white font-bold uppercase">sirisakkhacha@gmail.com</span></span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyber-green" />
            <span>SYS_TIME: <span className="text-cyber-green font-bold">{systemTime}</span></span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyber-green animate-ping" />
            <span className="text-[10px] px-1.5 py-0.5 bg-green-950/40 border border-cyber-green text-cyber-green font-bold rounded">
              UPLINK LIVE
            </span>
          </div>
        </div>

      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SIDEBAR: ACTIVE VEHICLE SPEC & ASSISTANT REI (3 COLS) */}
        <div className="lg:col-span-3 flex flex-col gap-6" id="garage-sidebar">
          
          {/* VEHICLE PREVIEW HUD */}
          <div className="bg-cyber-card border border-cyber-orange/20 rounded-lg p-5 relative overflow-hidden flex flex-col gap-4 shadow-xl">
            <div className="absolute top-0 right-0 w-16 h-1 bg-cyber-orange" />
            
            <div className="flex items-center justify-between border-b border-cyber-gray pb-2">
              <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
                ACTIVE CHASSIS ENGINE
              </span>
              <Bike className="w-4 h-4 text-cyber-orange" />
            </div>

            <div>
              <h2 className="font-display font-black text-base text-white uppercase tracking-tight">
                {activeBike.name}
              </h2>
              <span className="font-mono text-xs text-cyber-orange bg-cyber-orange/10 px-2 py-0.5 rounded border border-cyber-orange/20 inline-block mt-1">
                Model Year: {activeBike.year}
              </span>
            </div>

            {/* UPGRADE STATS VISUAL */}
            <div className="space-y-3 bg-cyber-darker p-3.5 rounded border border-cyber-gray font-mono text-xs">
              
              {/* HP Stats */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-slate-400 text-[10px] uppercase">HORSEPOWER</span>
                  <span className="text-white font-bold">
                    {finalHp} <span className="text-[10px] text-cyber-orange">HP</span>
                    {totalHpBonus > 0 && <span className="text-[10px] text-cyber-green ml-1">+{totalHpBonus.toFixed(1)}</span>}
                  </span>
                </div>
                <div className="w-full h-1 bg-cyber-gray rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyber-orange transition-all duration-300"
                    style={{ width: `${Math.min(100, (finalHp / 210) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Torque Stats */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-slate-400 text-[10px] uppercase">TORQUE</span>
                  <span className="text-white font-bold">
                    {finalTorque} <span className="text-[10px] text-cyber-green">Nm</span>
                    {totalTorqueBonus > 0 && <span className="text-[10px] text-cyber-green ml-1">+{totalTorqueBonus.toFixed(1)}</span>}
                  </span>
                </div>
                <div className="w-full h-1 bg-cyber-gray rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyber-green transition-all duration-300"
                    style={{ width: `${Math.min(100, (finalTorque / 130) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Weight reduction status */}
              <div className="flex justify-between text-[11px] pt-1.5 border-t border-cyber-gray/30">
                <span className="text-slate-500 uppercase">WEIGHT DELTA:</span>
                <span className={`font-bold ${finalWeightDelta > 0 ? "text-cyber-blue" : "text-slate-400"}`}>
                  {finalWeightDelta > 0 ? `-${finalWeightDelta} kg` : "0.0 kg"}
                </span>
              </div>

              {/* Connected upgrades counter */}
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500 uppercase">CYBER-MODS:</span>
                <span className="text-white font-bold">
                  {installedUpgrades.length} / {SPARE_PARTS.length} Installed
                </span>
              </div>
            </div>

            {/* Quick action: Reset modifications */}
            {installedUpgrades.length > 0 && (
              <button
                id="reset-build-btn"
                onClick={() => {
                  setInstalledUpgrades([]);
                  triggerMechanicMessage("Stock build config restored. All performance upgrades uninstalled.");
                }}
                className="w-full py-1.5 border border-red-500/30 text-red-400 hover:bg-red-950/20 rounded font-mono text-[10px] uppercase tracking-wider transition-all"
              >
                RESTORE FACTORY MAP
              </button>
            )}
          </div>

          {/* CYBER-ASSISTANT REI PORTRAIT & SPEECH */}
          <div className="bg-cyber-card border border-cyber-gray rounded-lg p-5 flex flex-col gap-4 relative overflow-hidden" id="mechanic-assistant-hud">
            
            {/* Visual Header */}
            <div className="flex items-center gap-2 border-b border-cyber-gray pb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-orange" />
              <h3 className="font-display font-black text-xs text-white tracking-widest uppercase">
                MECHANIC REI // COMM_LINK
              </h3>
            </div>

            {/* Portrate of mechanic generated via image tool */}
            <div className="relative aspect-square w-full rounded border border-cyber-gray overflow-hidden group">
              <img
                src="/images/cyber_mechanic_1782577544540.jpg"
                alt="Cyber Mechanic Assistant Rei"
                className="w-full h-full object-cover grayscale contrast-[1.1] brightness-[0.9] hover:grayscale-0 transition-all duration-300"
              />
              {/* Retro HUD grid overlay on image */}
              <div className="absolute inset-0 bg-cyber-orange/10 pointer-events-none mix-blend-overlay" />
              <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded border border-cyber-orange/30 text-[9px] font-mono text-cyber-orange font-bold uppercase tracking-wider">
                Rank: Master Tuner
              </div>
            </div>

            {/* Speech message window */}
            <div className="bg-cyber-darker p-3 rounded border border-cyber-gray relative min-h-[90px] flex flex-col justify-between">
              <div className="absolute -top-1.5 left-6 w-3 h-3 bg-cyber-darker border-t border-l border-cyber-gray rotate-45" />
              <p className={`font-mono text-[11px] leading-relaxed text-slate-300 ${isMessageTyping ? "opacity-50" : "opacity-100"} transition-opacity duration-200`}>
                "{mechanicMessage}"
              </p>
              
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-cyber-gray/30 text-[9px] font-mono text-slate-500">
                <span>COMMS STATUS: SECURE</span>
                <span className="animate-pulse text-cyber-orange font-bold">● ONLINE</span>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT AREA: NAVIGATION TAB CONTAINER & PRIMARY HUD VIEW (9 COLS) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* HIGH-TECH HUD NAVIGATION TABS */}
          <div className="bg-cyber-card border border-cyber-gray p-2.5 rounded-lg flex flex-wrap gap-2" id="hud-navigation-bar">
            
            {/* DYNO TUNING STAGE */}
            <button
              id="tab-dyno-btn"
              onClick={() => setActiveTab("dyno")}
              className={`px-4 py-2.5 rounded font-display font-black tracking-wider text-xs uppercase flex items-center gap-2 transition-all border ${
                activeTab === "dyno"
                  ? "bg-cyber-orange border-orange-500 text-black shadow-[0_0_12px_rgba(255,94,0,0.3)] font-bold scale-[1.01]"
                  : "bg-cyber-darker border-cyber-gray text-slate-400 hover:text-white hover:bg-cyber-gray/30"
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>[01] Dyno Test Stage</span>
            </button>

            {/* CYBER AI DIAGNOSTICS */}
            <button
              id="tab-diagnose-btn"
              onClick={() => setActiveTab("diagnose")}
              className={`px-4 py-2.5 rounded font-display font-black tracking-wider text-xs uppercase flex items-center gap-2 transition-all border ${
                activeTab === "diagnose"
                  ? "bg-cyber-orange border-orange-500 text-black shadow-[0_0_12px_rgba(255,94,0,0.3)] font-bold scale-[1.01]"
                  : "bg-cyber-darker border-cyber-gray text-slate-400 hover:text-white hover:bg-cyber-gray/30"
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span>[02] AI Diagnostics HUD</span>
            </button>

            {/* BLUEPRINT CATALOG */}
            <button
              id="tab-blueprint-btn"
              onClick={() => setActiveTab("blueprint")}
              className={`px-4 py-2.5 rounded font-display font-black tracking-wider text-xs uppercase flex items-center gap-2 transition-all border ${
                activeTab === "blueprint"
                  ? "bg-cyber-orange border-orange-500 text-black shadow-[0_0_12px_rgba(255,94,0,0.3)] font-bold scale-[1.01]"
                  : "bg-cyber-darker border-cyber-gray text-slate-400 hover:text-white hover:bg-cyber-gray/30"
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>[03] Manga Blueprint Specs</span>
            </button>

            {/* UNDERGROUND WORKSHOP LEDGER */}
            <button
              id="tab-garage-btn"
              onClick={() => setActiveTab("garage")}
              className={`px-4 py-2.5 rounded font-display font-black tracking-wider text-xs uppercase flex items-center gap-2 transition-all border ${
                activeTab === "garage"
                  ? "bg-cyber-orange border-orange-500 text-black shadow-[0_0_12px_rgba(255,94,0,0.3)] font-bold scale-[1.01]"
                  : "bg-cyber-darker border-cyber-gray text-slate-400 hover:text-white hover:bg-cyber-gray/30"
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>[04] Tuner Logs Ledger</span>
            </button>

          </div>

          {/* ACTIVE CONTENT VIEW WINDOW */}
          <div className="flex-1" id="active-viewport-card">
            
            {activeTab === "dyno" && (
              <div className="animate-fade-in">
                <DynoStage 
                  activeBike={activeBike} 
                  installedUpgrades={installedUpgrades} 
                />
              </div>
            )}

            {activeTab === "diagnose" && (
              <div className="animate-fade-in">
                <CyberDiagnostics 
                  activeBike={activeBike} 
                  onSelectBike={(bike) => {
                    setActiveBike(bike);
                    triggerMechanicMessage(`Telemetry link established with new chassis: ${bike.name}. Synchronizing CAN-bus...`);
                  }}
                />
              </div>
            )}

            {activeTab === "blueprint" && (
              <div className="animate-fade-in">
                <BlueprintCatalog 
                  activeBike={activeBike}
                  installedUpgrades={installedUpgrades}
                  onToggleUpgrade={handleToggleUpgrade}
                />
              </div>
            )}

            {activeTab === "garage" && (
              <div className="bg-cyber-card border border-cyber-gray p-6 rounded-lg relative overflow-hidden scanline animate-fade-in" id="workshop-ledger-view">
                
                <div className="flex items-center gap-2 mb-6 border-b border-cyber-gray pb-4">
                  <History className="text-cyber-orange w-5 h-5" />
                  <div>
                    <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
                      TUNING SESSIONS & BUILDS LEDGER
                    </h3>
                    <p className="text-slate-400 text-xs font-mono mt-0.5">
                      Historically tracked tuning specifications and verified performance mappings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  
                  {/* SUMMARY SPECIFICATION BLOCK */}
                  <div className="bg-cyber-darker p-5 rounded border border-cyber-gray flex flex-col gap-4">
                    <span className="font-mono text-xs text-cyber-orange uppercase font-bold tracking-widest block">
                      CURRENT BUILD MATRIX VERIFICATION
                    </span>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="flex justify-between py-1 border-b border-cyber-gray/30">
                        <span className="text-slate-400">TARGET VEHICLE NODE:</span>
                        <span className="text-white font-bold">{activeBike.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-cyber-gray/30">
                        <span className="text-slate-400">TOTAL VERIFIED HORSEPOWER:</span>
                        <span className="text-cyber-orange font-black text-sm">{finalHp} HP</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-cyber-gray/30">
                        <span className="text-slate-400">TOTAL VERIFIED TORQUE:</span>
                        <span className="text-cyber-green font-black text-sm">{finalTorque} Nm</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-cyber-gray/30">
                        <span className="text-slate-400">CHASSIS WEIGHT REDUCTION:</span>
                        <span className="text-cyber-blue font-bold">-{totalWeightReduced.toFixed(1)} kg</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">INSTALLED BOLT-ON MODS:</span>
                        <span className="text-white font-bold">{installedUpgrades.length} Upgrades Active</span>
                      </div>
                    </div>

                    {/* Installed mods checklist */}
                    {installedUpgrades.length > 0 ? (
                      <div className="mt-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5">
                          ACTIVE CAN-BUS MODIFICATIONS
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {installedUpgrades.map((item) => (
                            <span key={item.id} className="text-[10px] font-mono bg-cyber-orange/10 border border-cyber-orange/30 text-cyber-orange px-2 py-0.5 rounded">
                              ● {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 font-mono italic mt-2 text-center py-4 bg-cyber-bg/50 rounded border border-cyber-gray/40">
                        No custom cyber-mods installed. System reporting stock factory configuration.
                      </div>
                    )}
                  </div>

                  {/* QUICK STATS HISTOGRAM OR RUN SAVER */}
                  <div className="bg-cyber-darker p-5 rounded border border-cyber-gray flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-cyber-green uppercase font-bold tracking-widest">
                        MANUAL TELEMETRY RECORDER
                      </span>
                      <TrendingUp className="w-4 h-4 text-cyber-green" />
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      You can log the current setup configuration's power gains to verify and compare differences between maps, exhaust modifications, or fuel delivery.
                    </p>

                    <button
                      id="log-current-telemetry-btn"
                      onClick={() => handleLogDynoRun(finalHp, finalTorque)}
                      className="w-full py-2.5 bg-cyber-green hover:bg-green-400 text-black font-mono font-bold text-xs uppercase rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      LOG CURRENT TELEMETRY BUILD
                    </button>

                    <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                      <span>VERIFIED: SHA-256 MATRIX</span>
                      <span>SECURE RECORD</span>
                    </div>
                  </div>

                </div>

                {/* CYBER-INVOICE & SERVICE WORK ORDER GENERATOR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6" id="underground-invoice-suite">
                  
                  {/* LEFT: WORK ORDER PARAMETERS */}
                  <div className="lg:col-span-5 bg-cyber-darker p-5 rounded border border-cyber-gray flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-cyber-gray">
                      <Receipt className="text-cyber-orange w-4 h-4" />
                      <span className="font-mono text-xs text-white uppercase font-bold tracking-widest">
                        WORK ORDER CONTROLLER
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                      Configure customer credentials and shop labor rates. Installed upgrades and performance telemetry are parsed in real-time to compute the total build ticket cost.
                    </p>

                    <div className="flex flex-col gap-3 font-mono text-xs">
                      
                      {/* Customer Name */}
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 uppercase text-[10px] font-bold">PILOT / CUSTOMER ID</label>
                        <input
                          type="text"
                          value={invoiceCustomer}
                          onChange={(e) => setInvoiceCustomer(e.target.value)}
                          className="bg-cyber-bg border border-cyber-gray p-2 rounded text-white text-xs focus:outline-none focus:border-cyber-orange"
                        />
                      </div>

                      {/* Labor stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-500 uppercase text-[10px] font-bold">LABOR HOURS</label>
                          <input
                            type="number"
                            min="1"
                            max="48"
                            value={invoiceLaborHours}
                            onChange={(e) => setInvoiceLaborHours(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-cyber-bg border border-cyber-gray p-2 rounded text-white text-xs focus:outline-none focus:border-cyber-orange"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-500 uppercase text-[10px] font-bold">RATE (THB/HR)</label>
                          <input
                            type="number"
                            step="100"
                            min="500"
                            value={invoiceLaborRate}
                            onChange={(e) => setInvoiceLaborRate(Math.max(100, parseInt(e.target.value) || 100))}
                            className="bg-cyber-bg border border-cyber-gray p-2 rounded text-white text-xs focus:outline-none focus:border-cyber-orange"
                          />
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 uppercase text-[10px] font-bold">PAYMENT UPLINK STATUS</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["DRAFT", "PENDING", "PAID"] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                setInvoiceStatus(status);
                                if (status === "PAID") {
                                  triggerMechanicMessage(`Build transaction complete! Transaction finalized under id ${invoiceId}. Stamp of approval verified.`);
                                }
                              }}
                              className={`py-1.5 rounded font-bold text-[10px] border transition-all cursor-pointer ${
                                invoiceStatus === status
                                  ? status === "PAID"
                                    ? "bg-cyber-green text-black border-cyber-green font-black"
                                    : status === "PENDING"
                                      ? "bg-cyber-orange text-black border-cyber-orange font-black"
                                      : "bg-yellow-500 text-black border-yellow-500 font-black"
                                  : "bg-cyber-darker text-slate-400 border-cyber-gray hover:text-slate-200"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Diagnostic Notes */}
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 uppercase text-[10px] font-bold">TICKET TUNING NOTES</label>
                        <textarea
                          rows={3}
                          value={invoiceNotes}
                          onChange={(e) => setInvoiceNotes(e.target.value)}
                          className="bg-cyber-bg border border-cyber-gray p-2 rounded text-white text-xs focus:outline-none focus:border-cyber-orange resize-none"
                        />
                      </div>

                      {/* Button to cycle order ID */}
                      <button
                        onClick={() => {
                          setInvoiceId(`WO-${Math.floor(100000 + Math.random() * 900000)}`);
                          triggerMechanicMessage("Generated a fresh cryptographic invoice order signature.");
                        }}
                        className="py-1 px-2 border border-cyber-gray text-slate-400 hover:text-white hover:bg-cyber-gray/30 rounded text-[9px] uppercase tracking-wider transition-colors mt-1 text-center cursor-pointer"
                      >
                        CYPHER RE-SIGN ORDER ID
                      </button>

                    </div>
                  </div>

                  {/* RIGHT: LIVE CYBER-TICKET / RECEIPT PRINT VIEW */}
                  <div className="lg:col-span-7 bg-black p-6 rounded border border-cyber-orange/30 relative flex flex-col justify-between overflow-hidden shadow-xl" id="cyber-work-receipt">
                    
                    {/* Retro Grid background purely for the ticket aesthetic */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ff5e0008_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                    {/* NEON APPROVAL STAMP */}
                    <div className="absolute top-12 right-12 pointer-events-none select-none z-10 rotate-12 transition-transform duration-300">
                      {invoiceStatus === "PAID" && (
                        <div className="border-4 border-cyber-green text-cyber-green font-display font-black text-xs md:text-sm px-4 py-2 uppercase rounded-lg tracking-widest animate-pulse scale-110 bg-black/80 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                          APPROVED // PAID
                        </div>
                      )}
                      {invoiceStatus === "PENDING" && (
                        <div className="border-4 border-cyber-orange text-cyber-orange font-display font-black text-xs md:text-sm px-4 py-2 uppercase rounded-lg tracking-widest scale-105 bg-black/80 shadow-[0_0_15px_rgba(255,94,0,0.15)]">
                          PENDING PAYMENT
                        </div>
                      )}
                      {invoiceStatus === "DRAFT" && (
                        <div className="border-4 border-yellow-500 text-yellow-500 font-display font-black text-xs md:text-sm px-4 py-2 uppercase rounded-lg tracking-widest bg-black/80">
                          DRAFT ESTIMATE
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-4 font-mono text-xs z-10">
                      
                      {/* Ticket Header */}
                      <div className="flex justify-between items-start border-b border-dashed border-cyber-gray/60 pb-3">
                        <div>
                          <span className="font-display font-black text-sm text-white tracking-widest">
                            MOTORBOY REPAIR HARNESS
                          </span>
                          <span className="text-[9px] text-slate-500 block uppercase mt-0.5">
                            CAN-bus Synapse Sync // Tokyo Autonomous Sector
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-cyber-orange">{invoiceId}</span>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{systemTime}</span>
                        </div>
                      </div>

                      {/* Meta stats */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-cyber-darker/60 p-2 rounded border border-cyber-gray/40">
                        <div>
                          <span className="text-slate-500 block">PILOT ID / EMAIL:</span>
                          <span className="text-slate-300 font-bold truncate block">{invoiceCustomer}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">VEHICLE NODE:</span>
                          <span className="text-slate-300 font-bold truncate block">{activeBike.name} ({activeBike.year})</span>
                        </div>
                      </div>

                      {/* Itemized list of parts & labor */}
                      <div className="mt-2 flex flex-col gap-1.5">
                        <div className="flex justify-between text-[9px] text-slate-500 uppercase border-b border-cyber-gray/40 pb-1 font-bold font-mono">
                          <span>BILLABLE DESCRIPTION</span>
                          <span>COST (THB)</span>
                        </div>

                        {/* Labor Row */}
                        <div className="flex justify-between text-slate-300">
                          <span>ECU Interception Labor ({invoiceLaborHours} hours @ {invoiceLaborRate}/hr)</span>
                          <span>{(invoiceLaborHours * invoiceLaborRate).toLocaleString()}</span>
                        </div>

                        {/* Parts Rows */}
                        {installedUpgrades.map((part) => (
                          <div key={part.id} className="flex justify-between text-slate-300">
                            <span className="truncate max-w-[280px]">Node Mod: {part.name}</span>
                            <span>{(part.price || 5000).toLocaleString()}</span>
                          </div>
                        ))}

                        {/* Empty placeholder if no parts */}
                        {installedUpgrades.length === 0 && (
                          <div className="text-[10px] text-slate-500 italic py-1">
                            * No upgrade mods installed on current work ticket.
                          </div>
                        )}
                      </div>

                      {/* System Spec Verification stamp inside invoice */}
                      <div className="border-t border-dashed border-cyber-gray/50 pt-2.5 mt-2">
                        <span className="text-[9px] text-slate-500 uppercase block font-bold mb-1">
                          TUNED PEAK TELEMETRY SIGNATURE
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 bg-cyber-darker/30 p-1.5 rounded">
                          <div>
                            <span>POWER:</span>
                            <span className="text-cyber-orange font-bold ml-1">{finalHp} HP</span>
                          </div>
                          <div>
                            <span>TORQUE:</span>
                            <span className="text-cyber-green font-bold ml-1">{finalTorque} Nm</span>
                          </div>
                          <div>
                            <span>WEIGHT DELTA:</span>
                            <span className="text-cyber-blue font-bold ml-1">-{totalWeightReduced} kg</span>
                          </div>
                        </div>
                      </div>

                      {/* Work Notes */}
                      <div className="mt-2 text-[10px] text-slate-400 leading-normal bg-cyber-darker/40 p-2 rounded border border-cyber-gray/30">
                        <span className="text-slate-500 font-bold uppercase block mb-0.5">MECHANIC LOG COMMENTS:</span>
                        <p className="italic">"{invoiceNotes}"</p>
                      </div>

                    </div>

                    {/* Totals Section */}
                    <div className="mt-4 pt-3 border-t border-dashed border-cyber-gray/60 z-10">
                      <div className="flex flex-col gap-1.5 font-mono text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>SUBTOTAL COMPILATION:</span>
                          <span>
                            {(
                              invoiceLaborHours * invoiceLaborRate +
                              installedUpgrades.reduce((sum, item) => sum + (item.price || 5000), 0)
                            ).toLocaleString()}{" "}
                            THB
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>GOVERNMENT VAT (7.0%):</span>
                          <span>
                            {Math.round(
                              (invoiceLaborHours * invoiceLaborRate +
                                installedUpgrades.reduce((sum, item) => sum + (item.price || 5000), 0)) *
                                0.07
                            ).toLocaleString()}{" "}
                            THB
                          </span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-sm bg-cyber-orange/10 p-2 rounded border border-cyber-orange/20 mt-1">
                          <span className="text-cyber-orange">GRAND TOTAL CREDITS:</span>
                          <span className="text-cyber-orange glow-orange">
                            {Math.round(
                              (invoiceLaborHours * invoiceLaborRate +
                                installedUpgrades.reduce((sum, item) => sum + (item.price || 5000), 0)) *
                                1.07
                            ).toLocaleString()}{" "}
                            THB
                          </span>
                        </div>
                      </div>

                      {/* Printing and Simulation Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            window.print();
                          }}
                          className="flex-1 py-2 bg-cyber-darker border border-cyber-gray hover:border-cyber-orange/40 hover:text-white text-slate-300 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          PRINT TICKET SLIP
                        </button>
                        {invoiceStatus !== "PAID" ? (
                          <button
                            onClick={() => {
                              setInvoiceStatus("PAID");
                              triggerMechanicMessage("Uplink successful! Bill cleared under encrypted system protocols.");
                            }}
                            className="flex-1 py-2 bg-cyber-green text-black hover:bg-green-400 rounded font-mono text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            EXECUTE PAYMENT
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setInvoiceStatus("PENDING");
                              triggerMechanicMessage("Order reset to pending payment status.");
                            }}
                            className="flex-1 py-2 bg-red-950/40 border border-red-500/50 text-red-400 hover:bg-red-900/20 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            VOID RECEIPT
                          </button>
                        )}
                      </div>

                      {/* Barcode representation */}
                      <div className="flex flex-col items-center gap-1 mt-4 opacity-50">
                        <div className="h-6 w-full max-w-[280px] bg-slate-300 rounded-sm" style={{
                          backgroundImage: "repeating-linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 5px, #000 5px, #000 8px, transparent 8px, transparent 10px)"
                        }} />
                        <span className="text-[8px] text-slate-500 font-mono tracking-widest">
                          * {invoiceId} *
                        </span>
                      </div>

                    </div>
                  </div>

                </div>

                {/* RUNS LEDGER TABLE */}
                <div className="bg-cyber-darker p-4 rounded border border-cyber-gray" id="dyno-history-ledger">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs text-slate-400 font-bold uppercase tracking-wider">
                      VERIFIED TELEMETRY LOGS HISTORY
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {dynoHistory.length} Record(s) Found
                    </span>
                  </div>

                  {dynoHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-cyber-gray text-slate-500 text-[10px] uppercase">
                            <th className="pb-2">LOG ID</th>
                            <th className="pb-2">VEHICLE NODE</th>
                            <th className="pb-2">PEAK POWER</th>
                            <th className="pb-2">PEAK TORQUE</th>
                            <th className="pb-2">MODS</th>
                            <th className="pb-2 text-right">TIME</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-gray/30 text-slate-300">
                          {dynoHistory.map((log) => (
                            <tr key={log.id} className="hover:bg-cyber-gray/10">
                              <td className="py-2.5 font-bold text-cyber-orange">{log.id}</td>
                              <td className="py-2.5">{log.bikeName}</td>
                              <td className="py-2.5 text-cyber-orange font-bold">{log.hp} HP</td>
                              <td className="py-2.5 text-cyber-green font-bold">{log.torque} Nm</td>
                              <td className="py-2.5">
                                <span className="px-1.5 py-0.5 bg-cyber-gray rounded text-[10px]">
                                  {log.modsCount} active
                                </span>
                              </td>
                              <td className="py-2.5 text-right text-slate-500">{log.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 font-mono text-xs text-slate-500 italic">
                      No validated telemetry records logged yet. Hit "LOG CURRENT TELEMETRY BUILD" to populate session records.
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* DYNAMIC SPARTAN EXPLAINER ROW */}
          <div className="bg-cyber-card border border-cyber-gray/70 p-5 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono" id="underground-notice">
            <div className="flex items-center gap-2">
              <Terminal className="text-cyber-orange w-4 h-4" />
              <p className="text-slate-300 leading-normal">
                Looking for Tokyo tuning inspiration? Try selecting the <span className="text-cyber-orange font-bold">CBR650R</span>, install the <span className="text-cyber-orange font-bold">V4 Cyber-Link ECU</span> and <span className="text-cyber-orange font-bold">Electric Turbocharger</span>, set spark ignition to <span className="text-cyber-green font-bold">+11° BTDC</span>, and test its redline peak!
              </p>
            </div>
            <div className="shrink-0 flex gap-2">
              <a 
                href="https://ais-dev-ykxvkbxvxvrx47qq5mue2j-259384889317.asia-east1.run.app" 
                target="_blank"
                className="px-3 py-1 bg-cyber-orange/10 border border-cyber-orange/30 text-cyber-orange rounded font-mono hover:bg-cyber-orange/20 transition-all text-[11px]"
              >
                OPEN NODE IN NEW TAB
              </a>
            </div>
          </div>

        </div>

      </main>

      {/* COMPREHENSIVE FOOTER */}
      <footer className="max-w-7xl w-full mx-auto px-6 mt-12 pt-6 border-t border-cyber-gray flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-500">
        <div>
          <span>MOTORBOY TOKYO OVERRIDE v2.4.15 (GENETIC CORE ENGINE)</span>
        </div>
        <div className="flex gap-4">
          <span>SECURE CAN-BUS UPLINK // NO ROOT DESTRUCTORS DETECTED</span>
          <span>© 2026 MOTORBOY GARAGE SYSTEMS INC</span>
        </div>
      </footer>

    </div>
  );
}
