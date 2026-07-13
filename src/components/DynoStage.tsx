import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Play, Square, Activity, Flame, Zap, Thermometer, ShieldAlert, Sliders, Volume2, VolumeX, Save, Trash, FileSpreadsheet } from "lucide-react";
import { MotorcycleModel, ECUConfig, SparePart, TuningProfile } from "../types";
import { bikeAudio } from "../utils/audio";

interface DynoStageProps {
  activeBike: MotorcycleModel;
  installedUpgrades: SparePart[];
}

export default function DynoStage({ activeBike, installedUpgrades }: DynoStageProps) {
  // ECU Tuning States
  const [ecu, setEcu] = useState<ECUConfig>({
    fuelTrim: 5, // +5% default optimized
    ignitionTiming: 4, // +4 degrees default optimized
    revLimit: activeBike.maxRpm,
  });

  // Custom Saved Maps & Preset Maps States
  const [customMaps, setCustomMaps] = useState<TuningProfile[]>(() => {
    try {
      const saved = localStorage.getItem(`custom_ecu_maps_${activeBike.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newMapName, setNewMapName] = useState("");

  // Update custom maps when bike changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`custom_ecu_maps_${activeBike.id}`);
      setCustomMaps(saved ? JSON.parse(saved) : []);
    } catch {
      setCustomMaps([]);
    }
  }, [activeBike]);

  const presetMaps: TuningProfile[] = [
    { id: "stock", name: "STOCK ECU FACTORY", fuelTrim: 0, ignitionTiming: 0, revLimit: activeBike.maxRpm },
    { id: "tokyo_sport", name: "TOKYO SPORT MAP", fuelTrim: 8, ignitionTiming: 6, revLimit: activeBike.maxRpm + 800 },
    { id: "shutoko_drag", name: "SHUTOKO DRAG OVERRIDE", fuelTrim: 14, ignitionTiming: 11, revLimit: activeBike.maxRpm + 2000 },
    { id: "stealth_eco", name: "STEALTH ECO COMMUTE", fuelTrim: -5, ignitionTiming: 2, revLimit: activeBike.maxRpm - 600 }
  ];

  const handleSaveCustomMap = () => {
    if (!newMapName.trim()) return;
    const newMap: TuningProfile = {
      id: `custom-${Date.now()}`,
      name: newMapName.trim().toUpperCase(),
      fuelTrim: ecu.fuelTrim,
      ignitionTiming: ecu.ignitionTiming,
      revLimit: ecu.revLimit,
      isCustom: true
    };
    const updated = [...customMaps, newMap];
    setCustomMaps(updated);
    localStorage.setItem(`custom_ecu_maps_${activeBike.id}`, JSON.stringify(updated));
    setNewMapName("");
  };

  const handleDeleteCustomMap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customMaps.filter(m => m.id !== id);
    setCustomMaps(updated);
    localStorage.setItem(`custom_ecu_maps_${activeBike.id}`, JSON.stringify(updated));
  };


  // Simulator Running States
  const [isRunning, setIsRunning] = useState(false);
  const [currentRpm, setCurrentRpm] = useState(1500);
  const [throttle, setThrottle] = useState(0); // percentage 0 - 100
  const [peakHp, setPeakHp] = useState(0);
  const [peakTorque, setPeakTorque] = useState(0);
  const [runStats, setRunStats] = useState<{ hp: number; torque: number; rpm: number } | null>(null);

  // Audio Control
  const [isMuted, setIsMuted] = useState(false);

  // Chart Data Sweep
  const [chartData, setChartData] = useState<any[]>([]);
  const [liveTraceData, setLiveTraceData] = useState<any[]>([]);

  // Refs for animation and sound loops
  const animationRef = useRef<number | null>(null);
  const rpmTargetRef = useRef<number>(1500);

  // Recalculate Rev limit when active bike shifts
  useEffect(() => {
    setEcu((prev) => ({ ...prev, revLimit: activeBike.maxRpm }));
    setCurrentRpm(1500);
    setThrottle(0);
    setLiveTraceData([]);
    setRunStats(null);
  }, [activeBike]);

  // Handle engine sound engine loop
  useEffect(() => {
    if (isRunning && !isMuted) {
      bikeAudio.start();
    } else {
      bikeAudio.stop();
    }
    return () => {
      bikeAudio.stop();
    };
  }, [isRunning, isMuted]);

  // Update audio pitch based on live RPM and throttle
  useEffect(() => {
    if (isRunning && !isMuted) {
      bikeAudio.updateRpm(currentRpm, activeBike.maxRpm, throttle / 100);
    }
  }, [currentRpm, throttle, isRunning, isMuted, activeBike.maxRpm]);

  // Calculate tuning multipliers
  const getTuningStats = (rpm: number) => {
    // 1. Base engine characteristics
    const bikeBonusHp = installedUpgrades.reduce((sum, item) => sum + item.hpBonus, 0);
    const bikeBonusTorque = installedUpgrades.reduce((sum, item) => sum + item.torqueBonus, 0);

    const baseMaxHp = activeBike.baseHp + bikeBonusHp;
    const baseMaxTorque = activeBike.baseTorque + bikeBonusTorque;

    // 2. ECU tuning modifiers
    // Fuel multiplier: Peak efficiency at +8% fuel trim. Too lean (negative) or too rich (high positive) reduces power.
    const optimalFuelTrim = 8;
    const fuelDelta = Math.abs(ecu.fuelTrim - optimalFuelTrim);
    const fuelMultiplier = Math.max(0.7, 1 - (fuelDelta * 0.015));

    // Spark advance: More advance increases power but too much leads to heat/detonation
    // Peak power at +10 degrees, over +12 power degrades or knocks
    const sparkMultiplier = ecu.ignitionTiming <= 10 
      ? 1 + (ecu.ignitionTiming * 0.015) 
      : 1.15 - ((ecu.ignitionTiming - 10) * 0.03);

    // Combine into final peak stats
    const finalPeakHp = baseMaxHp * fuelMultiplier * sparkMultiplier;
    const finalPeakTorque = baseMaxTorque * fuelMultiplier * sparkMultiplier;

    // 3. Curves shaped as parabolic functions over RPM
    // peak HP is usually around 85% of rev limit, peak Torque at 70% of rev limit
    const peakHpRpm = activeBike.maxRpm * 0.85;
    const peakTorqueRpm = activeBike.maxRpm * 0.70;

    // HP curve: parabolic dropoff away from peak HP RPM
    const hpSpread = activeBike.maxRpm * 0.5;
    const hpFactor = Math.max(0.1, 1 - Math.pow((rpm - peakHpRpm) / hpSpread, 2));
    const currentHp = finalPeakHp * hpFactor;

    // Torque curve: parabolic dropoff away from peak Torque RPM
    const torqueSpread = activeBike.maxRpm * 0.45;
    const torqueFactor = Math.max(0.1, 1 - Math.pow((rpm - peakTorqueRpm) / torqueSpread, 2));
    const currentTorque = finalPeakTorque * torqueFactor;

    return {
      hp: parseFloat(Math.max(0.5, currentHp).toFixed(1)),
      torque: parseFloat(Math.max(0.5, currentTorque).toFixed(1)),
      rpm,
      finalPeakHp,
      finalPeakTorque,
    };
  };

  // Generate complete reference curves for background chart
  useEffect(() => {
    const data = [];
    const step = activeBike.maxRpm / 40;
    for (let r = 1000; r <= ecu.revLimit; r += step) {
      const stats = getTuningStats(r);
      data.push({
        rpm: Math.round(r),
        hp: stats.hp,
        torque: stats.torque,
      });
    }
    setChartData(data);
  }, [activeBike, installedUpgrades, ecu.fuelTrim, ecu.ignitionTiming, ecu.revLimit]);

  // Handle manual/live dyno sweep loop
  const stepDynoRun = () => {
    if (!isRunning) return;

    setCurrentRpm((prevRpm) => {
      // Accelerate towards target based on throttle
      const rpmStep = (throttle * 0.02 + 0.1) * (activeBike.maxRpm * 0.035);
      let nextRpm = prevRpm;

      if (throttle > 0) {
        nextRpm = Math.min(ecu.revLimit, prevRpm + rpmStep);
      } else {
        // Drop back to idle
        nextRpm = Math.max(1500, prevRpm - (activeBike.maxRpm * 0.05));
      }

      // Record live points on sweep
      const stats = getTuningStats(nextRpm);
      
      setLiveTraceData((prev) => {
        // Prevent duplicate RPM logs in tracing
        const filtered = prev.filter(p => Math.abs(p.rpm - nextRpm) > 100);
        return [...filtered, {
          rpm: Math.round(nextRpm),
          hp: stats.hp,
          torque: stats.torque,
        }].sort((a, b) => a.rpm - b.rpm);
      });

      // Update peak run accomplishments
      setPeakHp(p => Math.max(p, stats.hp));
      setPeakTorque(t => Math.max(t, stats.torque));

      // Trigger automatic engine cutting at rev limit (soft limiter bouncing)
      if (nextRpm >= ecu.revLimit) {
        // Bounce limiter
        setThrottle(50); // Cut throttle slightly to simulate rev-limit ignition cut
        return ecu.revLimit - 300;
      }

      return nextRpm;
    });

    animationRef.current = requestAnimationFrame(stepDynoRun);
  };

  // Manage start/stop loops
  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(stepDynoRun);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, throttle, ecu.revLimit]);

  // Auto trigger dynamic run sweep (one-click full dyno test)
  const triggerAutoDynoSweep = () => {
    if (isRunning) {
      stopEngine();
      return;
    }

    setPeakHp(0);
    setPeakTorque(0);
    setLiveTraceData([]);
    setCurrentRpm(1500);
    setThrottle(100);
    setIsRunning(true);

    // Gradually sweep engine RPM up to limit
    let currentSweepThrottle = 100;
    const sweepInterval = setInterval(() => {
      setThrottle(currentSweepThrottle);
    }, 50);

    // Stop sweep after reaching rev limiter
    const timeout = setTimeout(() => {
      clearInterval(sweepInterval);
      setThrottle(0);
      setIsRunning(false);
      
      // Calculate final peek logs
      const fullStats = getTuningStats(activeBike.maxRpm * 0.85);
      const torqueStats = getTuningStats(activeBike.maxRpm * 0.7);
      setRunStats({
        hp: parseFloat(fullStats.finalPeakHp.toFixed(1)),
        torque: parseFloat(torqueStats.finalPeakTorque.toFixed(1)),
        rpm: activeBike.maxRpm,
      });
    }, 5500);

    return () => {
      clearInterval(sweepInterval);
      clearTimeout(timeout);
    };
  };

  const stopEngine = () => {
    setIsRunning(false);
    setThrottle(0);
    setCurrentRpm(1500);
  };

  // Warnings diagnostic
  const isTooLean = ecu.fuelTrim < 3;
  const isKnocking = ecu.ignitionTiming > 11;
  const isRich = ecu.fuelTrim > 15;

  // Render Tachometer Arc Path
  const getTachArc = () => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    // We want a semi-circle or 3/4 circle. Let's make 240 degrees (from 150 to 390 deg)
    const arcLength = (240 / 360) * circumference;
    const rpmFraction = (currentRpm - 1000) / (activeBike.maxRpm - 1000);
    const strokeDashoffset = arcLength - Math.max(0, Math.min(1, rpmFraction)) * arcLength;

    return {
      strokeDasharray: `${arcLength} ${circumference}`,
      strokeDashoffset: strokeDashoffset,
    };
  };

  const calculatedCurrent = getTuningStats(currentRpm);
  const activeHp = calculatedCurrent.hp;
  const activeTorque = calculatedCurrent.torque;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative" id="dyno-stage-container">
      {/* LEFT COLUMN: ECU CONTROLS & GAUGES (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* GAUGES HUD PANEL */}
        <div className="bg-cyber-card border border-cyber-gray p-6 rounded-lg relative overflow-hidden scanline" id="gauges-hud">
          {/* Neon orange top corner trim */}
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyber-orange pointer-events-none opacity-80" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyber-orange pointer-events-none opacity-80" />
          
          <div className="flex justify-between items-center mb-6 border-b border-cyber-gray pb-2">
            <div className="flex items-center gap-2">
              <Activity className="text-cyber-orange w-5 h-5" />
              <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
                COCKPIT HUD // DYNO MONITOR
              </h3>
            </div>
            
            {/* Audio Toggle */}
            <button 
              id="audio-toggle-btn"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 rounded border transition-colors ${
                isMuted 
                  ? "border-cyber-gray text-slate-500 hover:text-slate-300" 
                  : "border-cyber-orange/40 text-cyber-orange hover:bg-cyber-orange/10"
              }`}
              title={isMuted ? "Enable Sound Simulator" : "Mute Sound"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-4 relative">
            
            {/* DIGITAL ARC GAUGE (RPM TACHOMETER) */}
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full -rotate-[210deg] transform" viewBox="0 0 200 200">
                {/* Background Track */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#1e2638"
                  strokeWidth="12"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: `${(240/360) * 2 * Math.PI * 80} ${2 * Math.PI * 80}`,
                  }}
                />
                
                {/* Active Glow Sweep */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={currentRpm > activeBike.maxRpm * 0.88 ? "#ff003c" : "#ff5e00"}
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="transition-all duration-75 ease-out"
                  style={getTachArc()}
                />
              </svg>

              {/* Digital Core readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-6">
                <span className="font-mono text-3xl font-black text-white tracking-widest leading-none glow-orange">
                  {Math.round(currentRpm)}
                </span>
                <span className="font-mono text-xs text-cyber-orange tracking-widest mt-1 uppercase font-bold">
                  RPM LIMITER
                </span>
                <div className="flex gap-2 mt-3 text-[10px] font-mono text-slate-400">
                  <span className="px-1.5 py-0.5 bg-cyber-darker rounded border border-cyber-gray">
                    MAX: {ecu.revLimit}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded border ${currentRpm > activeBike.maxRpm * 0.88 ? "bg-red-950 border-red-500 text-red-400" : "bg-cyber-darker border-cyber-gray"}`}>
                    LIMIT
                  </span>
                </div>
              </div>
            </div>

            {/* SPEED & SENSORS BENTO LAYOUT */}
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <div className="bg-cyber-darker p-3 border border-cyber-gray rounded text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-cyber-orange" />
                  Horsepower
                </div>
                <div className="font-display font-black text-2xl text-white tracking-tight glow-orange">
                  {isRunning ? activeHp : (runStats?.hp || "--")} <span className="text-xs text-cyber-orange font-normal">HP</span>
                </div>
              </div>

              <div className="bg-cyber-darker p-3 border border-cyber-gray rounded text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-cyber-green" />
                  Torque Nm
                </div>
                <div className="font-display font-black text-2xl text-white tracking-tight glow-green">
                  {isRunning ? activeTorque : (runStats?.torque || "--")} <span className="text-xs text-cyber-green font-normal">Nm</span>
                </div>
              </div>

              <div className="bg-cyber-darker p-3 border border-cyber-gray rounded text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-cyber-blue" />
                  Sim Speed
                </div>
                <div className="font-display font-black text-xl text-white tracking-tight">
                  {isRunning ? Math.round(currentRpm * 0.014) : 0} <span className="text-xs text-slate-400 font-normal">km/h</span>
                </div>
              </div>

              <div className="bg-cyber-darker p-3 border border-cyber-gray rounded text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-semibold">
                  <Thermometer className="w-3.5 h-3.5 text-yellow-500" />
                  ECU Core Temp
                </div>
                <div className="font-display font-black text-xl text-white tracking-tight">
                  {isRunning ? Math.round(55 + (currentRpm * 0.004) + (throttle * 0.15)) : 32} <span className="text-xs text-slate-400 font-normal">°C</span>
                </div>
              </div>
            </div>

            {/* TUNING WARNING ALERTS */}
            {(isTooLean || isKnocking || isRich) && (
              <div id="safety-warnings" className="w-full mt-4 p-2.5 bg-red-950/40 border border-red-500/40 rounded flex items-start gap-2 text-xs text-red-300 font-mono">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <div className="font-bold text-red-400 uppercase tracking-wider text-[10px]">
                    CRITICAL TUNING WARNING:
                  </div>
                  <div className="text-[11px] leading-tight mt-0.5">
                    {isTooLean && "⚠️ Lean Air/Fuel Ratio! Detonation danger under full boost."}
                    {isKnocking && " ⚠️ Severe Ignition Advance! High risk of pre-ignition knocking."}
                    {isRich && " ⚠️ Rich mixture! Incomplete combustion reduces power and clogs injector."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* THROTTLE MANUAL CONTROL */}
        <div className="bg-cyber-card border border-cyber-gray p-4 rounded-lg flex flex-col gap-3" id="throttle-controls">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs uppercase text-slate-400 tracking-wider">
              MANUAL THROTTLE SIMULATOR
            </span>
            <span className="font-mono text-xs text-cyber-orange font-bold">
              {throttle}% WOT
            </span>
          </div>
          <div className="flex items-center gap-4">
            <input
              id="throttle-slider"
              type="range"
              min="0"
              max="100"
              value={throttle}
              onChange={(e) => {
                setThrottle(parseInt(e.target.value));
                if (parseInt(e.target.value) > 0 && !isRunning) {
                  setIsRunning(true);
                } else if (parseInt(e.target.value) === 0) {
                  // Keep running on idle for engine simulation, or let starting sweep manage
                }
              }}
              className="w-full h-2 bg-cyber-darker rounded-lg appearance-none cursor-pointer accent-cyber-orange"
            />
            <button
              id="wot-trigger-btn"
              onMouseDown={() => { setThrottle(100); setIsRunning(true); }}
              onMouseUp={() => setThrottle(0)}
              onMouseLeave={() => setThrottle(0)}
              onTouchStart={() => { setThrottle(100); setIsRunning(true); }}
              onTouchEnd={() => setThrottle(0)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-mono font-bold text-xs rounded uppercase shrink-0 transition-colors border border-red-500 shadow-lg shadow-red-950"
            >
              PUSH FOR NITRO / WOT
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: REAL-TIME SWEEP CHART & ECU MAPPING (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6">

        {/* ECU TUNER CONSOLE */}
        <div className="bg-cyber-card border border-cyber-gray p-6 rounded-lg relative overflow-hidden" id="ecu-tuning-console">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cyber-gray">
            <Sliders className="text-cyber-orange w-5 h-5" />
            <h3 className="font-display font-bold text-sm tracking-widest text-slate-100 uppercase">
              ECU SIGNAL INTERCEPTION MODULE
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* FUEL TRIM SLIDER */}
            <div className="flex flex-col gap-2" id="fuel-trim-setting">
              <div className="flex justify-between font-mono text-xs text-slate-400">
                <span>FUEL TRIM TARGET</span>
                <span className={`font-bold ${isTooLean ? "text-red-500" : isRich ? "text-yellow-500" : "text-cyber-green"}`}>
                  {ecu.fuelTrim > 0 ? `+${ecu.fuelTrim}` : ecu.fuelTrim}%
                </span>
              </div>
              <input
                id="fuel-trim-slider"
                type="range"
                min="-15"
                max="25"
                step="1"
                value={ecu.fuelTrim}
                onChange={(e) => setEcu((prev) => ({ ...prev, fuelTrim: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-cyber-darker rounded appearance-none cursor-pointer accent-cyber-orange"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>LEAN (ECO)</span>
                <span>RICH (RACE)</span>
              </div>
            </div>

            {/* IGNITION TIMING ADVANCE */}
            <div className="flex flex-col gap-2" id="ignition-timing-setting">
              <div className="flex justify-between font-mono text-xs text-slate-400">
                <span>IGNITION ADVANCE</span>
                <span className={`font-bold ${isKnocking ? "text-red-500" : "text-cyber-green"}`}>
                  {ecu.ignitionTiming > 0 ? `+${ecu.ignitionTiming}` : ecu.ignitionTiming}° BTDC
                </span>
              </div>
              <input
                id="ignition-timing-slider"
                type="range"
                min="-2"
                max="16"
                step="1"
                value={ecu.ignitionTiming}
                onChange={(e) => setEcu((prev) => ({ ...prev, ignitionTiming: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-cyber-darker rounded appearance-none cursor-pointer accent-cyber-orange"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>RETARD</span>
                <span>ADVANCED</span>
              </div>
            </div>

            {/* REV LIMIT OFFSET */}
            <div className="flex flex-col gap-2" id="rev-limit-setting">
              <div className="flex justify-between font-mono text-xs text-slate-400">
                <span>REV LIMIT OFFSET</span>
                <span className="font-bold text-cyber-blue">
                  {ecu.revLimit} RPM
                </span>
              </div>
              <input
                id="rev-limit-slider"
                type="range"
                min={activeBike.maxRpm - 1500}
                max={activeBike.maxRpm + 2500}
                step="100"
                value={ecu.revLimit}
                onChange={(e) => setEcu((prev) => ({ ...prev, revLimit: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-cyber-darker rounded appearance-none cursor-pointer accent-cyber-orange"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>STOCK</span>
                <span>OVERCLOCK</span>
              </div>
            </div>

          </div>

          {/* MAP PRESETS & CUSTOM SAVED MAPS */}
          <div className="mt-6 pt-5 border-t border-cyber-gray/50 flex flex-col gap-4">
            <div>
              <span className="font-mono text-[10px] text-slate-500 uppercase font-bold tracking-widest block">
                SYSTEM ECU CALIBRATION PRESETS & CUSTOM SAVED MAPS
              </span>
            </div>

            {/* Grid of Preset Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {presetMaps.map((map) => (
                <button
                  key={map.id}
                  id={`preset-map-${map.id}`}
                  onClick={() => {
                    setEcu({
                      fuelTrim: map.fuelTrim,
                      ignitionTiming: map.ignitionTiming,
                      revLimit: map.revLimit
                    });
                  }}
                  className="p-2 bg-cyber-darker hover:bg-cyber-gray/30 border border-cyber-gray/60 hover:border-cyber-orange/40 rounded text-left transition-all group cursor-pointer"
                >
                  <span className="font-mono text-[8px] text-cyber-orange block truncate uppercase">
                    {map.id === "stock" ? "FACTORY" : "PRESET SYSTEM"}
                  </span>
                  <span className="font-display font-black text-[11px] text-white block mt-0.5 group-hover:text-cyber-orange truncate uppercase">
                    {map.name.split(" ")[0]} {map.name.split(" ")[1] || ""}
                  </span>
                  <span className="font-mono text-[9px] text-slate-400 block mt-1">
                    F:{map.fuelTrim > 0 ? `+${map.fuelTrim}` : map.fuelTrim}% // I:{map.ignitionTiming}°
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Saved Maps */}
            {customMaps.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">
                  CUSTOM UNDERGROUND MAPS DEPOSITED
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {customMaps.map((map) => (
                    <div
                      key={map.id}
                      onClick={() => {
                        setEcu({
                          fuelTrim: map.fuelTrim,
                          ignitionTiming: map.ignitionTiming,
                          revLimit: map.revLimit
                        });
                      }}
                      className="p-2 bg-cyber-orange/5 hover:bg-cyber-orange/10 border border-cyber-orange/20 hover:border-cyber-orange/50 rounded text-left transition-all cursor-pointer flex justify-between items-start group"
                    >
                      <div className="truncate pr-2">
                        <span className="font-mono text-[8px] text-cyber-green block uppercase">
                          CUSTOM TUNER
                        </span>
                        <span className="font-display font-black text-[11px] text-slate-200 block mt-0.5 truncate uppercase text-[10px]">
                          {map.name}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 block mt-1">
                          F:{map.fuelTrim}% // I:{map.ignitionTiming}°
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteCustomMap(map.id, e)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title="Delete Custom Calibration"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Custom Map Action */}
            <div className="bg-cyber-darker p-3 rounded border border-cyber-gray/60 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <FileSpreadsheet className="w-4 h-4 text-cyber-orange shrink-0" />
                <span className="font-mono text-[11px] text-slate-300">
                  DEPOSIT CURRENT CALIBRATION TIMING AS NEW MAP
                </span>
              </div>
              <div className="flex gap-2 w-full md:w-auto shrink-0">
                <input
                  type="text"
                  placeholder="MAP NAME (E.G. STAGE1)"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  className="bg-cyber-bg border border-cyber-gray px-2.5 py-1.5 rounded font-mono text-[10px] text-white uppercase focus:outline-none focus:border-cyber-orange w-full md:w-40"
                />
                <button
                  onClick={handleSaveCustomMap}
                  disabled={!newMapName.trim()}
                  className="px-3 py-1.5 bg-cyber-orange disabled:bg-cyber-gray disabled:text-slate-500 text-black rounded font-mono font-bold text-[10px] uppercase flex items-center gap-1 hover:bg-orange-400 transition-colors shrink-0 cursor-pointer animate-pulse"
                >
                  <Save className="w-3 h-3" />
                  SAVE MAP
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* SWEEP SWEEP GRAPHS */}
        <div className="bg-cyber-card border border-cyber-gray p-6 rounded-lg flex-1 flex flex-col relative overflow-hidden" id="dyno-charts-container">
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-6 border-b border-cyber-gray pb-4">
            <div>
              <h4 className="font-display font-black text-sm tracking-widest text-white uppercase">
                DYNO POWER & TORQUE CURVES
              </h4>
              <p className="text-slate-400 text-xs font-mono mt-0.5">
                Real-time mapping sweep overlay vs active engine telemetry
              </p>
            </div>

            {/* Dyno trigger sweep action */}
            <div className="flex gap-2">
              <button
                id="dyno-sweep-btn"
                onClick={triggerAutoDynoSweep}
                className={`px-4 py-2 rounded font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition-all ${
                  isRunning 
                    ? "bg-red-600 hover:bg-red-500 text-white animate-pulse" 
                    : "bg-cyber-orange text-black hover:bg-orange-400"
                }`}
              >
                {isRunning ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    STOP SCANNING
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    RUN DYNO SWEEP
                  </>
                )}
              </button>
              
              <button
                id="dyno-reset-btn"
                onClick={stopEngine}
                className="px-3 py-2 border border-cyber-gray text-slate-300 hover:text-white hover:bg-cyber-gray/30 rounded font-mono text-xs uppercase transition-all"
              >
                RESET ENG
              </button>
            </div>
          </div>

          {/* RECHARTS SWEEP CONTAINER */}
          <div className="flex-1 min-h-[300px] w-full" id="dyno-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#121624" />
                <XAxis
                  dataKey="rpm"
                  stroke="#475569"
                  fontFamily="Share Tech Mono"
                  fontSize={11}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#ff5e00"
                  fontFamily="Share Tech Mono"
                  fontSize={11}
                  domain={[0, 'auto']}
                  label={{ value: 'HP', angle: -90, position: 'insideLeft', fill: '#ff5e00', offset: 10 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#39ff14"
                  fontFamily="Share Tech Mono"
                  fontSize={11}
                  domain={[0, 'auto']}
                  label={{ value: 'Nm', angle: 90, position: 'insideRight', fill: '#39ff14', offset: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#05070c",
                    borderColor: "#ff5e00",
                    color: "#fff",
                    fontFamily: "Share Tech Mono",
                    fontSize: "12px",
                  }}
                />
                
                {/* Reference Background Curves */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="hp"
                  stroke="#ff5e00"
                  strokeWidth={2}
                  dot={false}
                  name="Interception HP Target"
                  opacity={0.3}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="torque"
                  stroke="#39ff14"
                  strokeWidth={2}
                  dot={false}
                  name="Interception Torque Target"
                  opacity={0.3}
                />

                {/* Traced Actual Live Data Runs */}
                {liveTraceData.length > 0 && (
                  <>
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="hp"
                      data={liveTraceData}
                      stroke="#ff3700"
                      strokeWidth={4}
                      dot={false}
                      name="Active Run HP"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="torque"
                      data={liveTraceData}
                      stroke="#00f0ff"
                      strokeWidth={4}
                      dot={false}
                      name="Active Run Torque"
                    />
                  </>
                )}

                {/* Live RPM marker line during sweeps */}
                {isRunning && (
                  <ReferenceLine
                    yAxisId="left"
                    x={Math.round(currentRpm)}
                    stroke="#ff5e00"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: 'ACTIVE TELESWEEP', fill: '#ff5e00', fontSize: 10, fontFamily: 'Share Tech Mono' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* DYNO RUN SUMMARY DATA CARD */}
          {runStats && (
            <div id="dyno-results-card" className="mt-4 p-4 bg-cyber-darker border border-cyber-orange/30 rounded flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyber-orange/10 rounded border border-cyber-orange/40">
                  <Activity className="text-cyber-orange w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h5 className="font-display font-black text-xs text-white uppercase tracking-wider">
                    TUNED PROFILE COMPLETED SUCCESSFULLY
                  </h5>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Tuned against PGM-FI parameters with {installedUpgrades.length} cyber-mods installed.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">PEAK POWER</div>
                  <div className="text-xl font-bold text-cyber-orange">{runStats.hp} HP</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">PEAK TORQUE</div>
                  <div className="text-xl font-bold text-cyber-green">{runStats.torque} Nm</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">REDLINE BAR</div>
                  <div className="text-xl font-bold text-cyber-blue">{runStats.rpm} RPM</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
