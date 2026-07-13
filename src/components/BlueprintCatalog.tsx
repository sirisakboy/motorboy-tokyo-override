import React, { useState } from "react";
import { Hammer, CircleDollarSign, Check, ChevronRight, Zap, Flame, Scale, Plus } from "lucide-react";
import { SparePart, MotorcycleModel } from "../types";
import { SPARE_PARTS } from "../data";

interface BlueprintCatalogProps {
  activeBike: MotorcycleModel;
  installedUpgrades: SparePart[];
  onToggleUpgrade: (part: SparePart) => void;
}

export default function BlueprintCatalog({ activeBike, installedUpgrades, onToggleUpgrade }: BlueprintCatalogProps) {
  const [selectedPart, setSelectedPart] = useState<SparePart>(SPARE_PARTS[0]);
  const [hoveredPart, setHoveredPart] = useState<SparePart | null>(null);

  // Check if active part is installed
  const isInstalled = installedUpgrades.some((item) => item.id === selectedPart.id);

  // We can use the image we generated earlier
  const blueprintImg = "/images/tokyo_override_bike_1782577526674.jpg";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="blueprint-catalog-stage">
      
      {/* LEFT COLUMN: BLUPRINT HOTSPOTS DISPLAY (7 COLS) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        
        {/* INTERACTIVE BLUEPRINT PANEL */}
        <div className="bg-cyber-card border border-cyber-gray rounded-lg p-4 relative overflow-hidden flex flex-col justify-center" id="blueprint-canvas-container">
          <div className="absolute top-4 left-4 z-10 bg-cyber-darker/80 border border-cyber-gray px-3 py-1.5 rounded text-[10px] font-mono text-slate-400">
            BLUEPRINT VIEWPORT // ACTIVE SENSORS
          </div>

          <div className="absolute top-4 right-4 z-10 bg-cyber-orange/15 border border-cyber-orange/40 px-2 py-1 rounded text-[10px] font-mono text-cyber-orange font-bold uppercase">
            Tokyo Override Blueprint v1.02
          </div>

          {/* THE IMAGE WITH HOTSPOTS OVERLAY */}
          <div className="relative w-full aspect-video rounded overflow-hidden border border-cyber-gray mt-6" id="blueprint-viewport">
            <img
              src={blueprintImg}
              alt="Tokyo Override Motorcycle Blueprint"
              className="w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
            />
            
            {/* Dark tint overlay */}
            <div className="absolute inset-0 bg-cyber-bg/25 pointer-events-none" />

            {/* HOTSPOTS LOOP */}
            {SPARE_PARTS.map((part) => {
              const isPartInstalled = installedUpgrades.some((item) => item.id === part.id);
              const isActive = selectedPart.id === part.id;
              const isHovered = hoveredPart?.id === part.id;

              return (
                <button
                  key={part.id}
                  id={`blueprint-hotspot-${part.id}`}
                  onClick={() => setSelectedPart(part)}
                  onMouseEnter={() => setHoveredPart(part)}
                  onMouseLeave={() => setHoveredPart(null)}
                  className="absolute group z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${part.blueprintCoordinates.x}%`,
                    top: `${part.blueprintCoordinates.y}%`,
                  }}
                >
                  {/* Outer pulsating ring */}
                  <div className={`w-8 h-8 rounded-full border-2 absolute -left-4 -top-4 animate-ping ${
                    isPartInstalled 
                      ? "border-cyber-green/50" 
                      : isActive 
                        ? "border-cyber-orange/50" 
                        : "border-cyber-blue/30"
                  }`} />

                  {/* Intersecting target indicator lines */}
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all ${
                    isPartInstalled 
                      ? "bg-cyber-green/20 border-cyber-green" 
                      : isActive 
                        ? "bg-cyber-orange/30 border-cyber-orange scale-125" 
                        : "bg-cyber-blue/10 border-cyber-blue group-hover:scale-110"
                  }`}>
                    {/* Inner core dot */}
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isPartInstalled 
                        ? "bg-cyber-green" 
                        : isActive 
                          ? "bg-cyber-orange" 
                          : "bg-cyber-blue"
                    }`} />
                  </div>

                  {/* Hover Floating Label */}
                  {(isHovered || isActive) && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-cyber-darker border border-cyber-gray px-2 py-1 rounded text-[10px] font-mono text-white whitespace-nowrap z-30 flex items-center gap-1.5 shadow-xl">
                      <span className={isPartInstalled ? "text-cyber-green" : "text-cyber-orange"}>
                        {isPartInstalled ? "●" : "○"}
                      </span>
                      {part.name}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Aesthetic Tech HUD Overlays */}
            <div className="absolute bottom-4 left-4 font-mono text-[9px] text-slate-500 pointer-events-none">
              GRID REF: TKY-7729 // MULTISPECTRAL COMPRESSION ACTIVE
            </div>
          </div>

          {/* QUICK BOTTOM SELECTION TILES */}
          <div className="grid grid-cols-5 gap-2 mt-4" id="blueprint-parts-scroller">
            {SPARE_PARTS.map((part) => {
              const partInstalled = installedUpgrades.some((item) => item.id === part.id);
              const isActive = selectedPart.id === part.id;
              
              return (
                <button
                  key={part.id}
                  id={`parts-tile-${part.id}`}
                  onClick={() => setSelectedPart(part)}
                  className={`p-2 rounded text-center flex flex-col items-center justify-center transition-all border ${
                    isActive
                      ? "bg-cyber-orange/15 border-cyber-orange text-cyber-orange shadow-[0_0_8px_rgba(255,94,0,0.15)]"
                      : "bg-cyber-darker border-cyber-gray text-slate-400 hover:text-slate-300 hover:bg-cyber-gray/30"
                  }`}
                >
                  <span className="font-mono text-[9px] block uppercase truncate max-w-full">
                    {part.japaneseName}
                  </span>
                  <span className="font-sans font-bold text-[10px] block truncate max-w-full mt-1">
                    {part.name.split(" ")[0]}
                  </span>
                  {partInstalled && (
                    <span className="text-[9px] text-cyber-green font-mono font-bold mt-1 uppercase flex items-center justify-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> INSTALLED
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: TECHNICAL SPECIFICATIONS SHEET (5 COLS) */}
      <div className="lg:col-span-5 flex flex-col">
        
        {/* SPEC SHEET WRAPPER */}
        <div className="bg-cyber-card border border-cyber-gray rounded-lg p-6 flex flex-col flex-1 relative overflow-hidden" id="tech-specs-sheet">
          {/* Manga angled decorative border */}
          <div className="absolute top-0 right-0 w-20 h-2 bg-cyber-orange" />

          {/* Part Main Header */}
          <div className="border-b border-cyber-gray pb-4 mb-4" id="part-sheet-header">
            <span className="font-mono text-cyber-orange text-xs font-bold tracking-widest block uppercase">
              {selectedPart.japaneseName} // {selectedPart.category}
            </span>
            <h3 className="font-display font-black text-lg text-white mt-1 uppercase tracking-tight">
              {selectedPart.name}
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
              {selectedPart.description}
            </p>
          </div>

          {/* STATS IMPACT BARS */}
          <div className="flex flex-col gap-3 bg-cyber-darker p-4 rounded border border-cyber-gray mb-4" id="stats-impact">
            <h4 className="font-mono text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              SIMULATED DYNO PERFORMANCE IMPACT
            </h4>

            {/* HP bonus impact bar */}
            <div>
              <div className="flex justify-between font-mono text-xs mb-1">
                <span className="text-slate-400">HORSEPOWER INCREASE</span>
                <span className="text-cyber-orange font-bold">+{selectedPart.hpBonus} HP</span>
              </div>
              <div className="w-full h-1.5 bg-cyber-gray rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyber-orange shadow-[0_0_8px_#ff5e00] transition-all duration-300" 
                  style={{ width: `${(selectedPart.hpBonus / 15) * 100}%` }}
                />
              </div>
            </div>

            {/* Torque bonus impact bar */}
            <div>
              <div className="flex justify-between font-mono text-xs mb-1">
                <span className="text-slate-400">TORQUE OUTPUT BOOST</span>
                <span className="text-cyber-green font-bold">+{selectedPart.torqueBonus} Nm</span>
              </div>
              <div className="w-full h-1.5 bg-cyber-gray rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyber-green shadow-[0_0_8px_#39ff14] transition-all duration-300" 
                  style={{ width: `${(selectedPart.torqueBonus / 12) * 100}%` }}
                />
              </div>
            </div>

            {/* Weight Reduction impact bar */}
            <div>
              <div className="flex justify-between font-mono text-xs mb-1">
                <span className="text-slate-400">WEIGHT REDUCTION</span>
                <span className={`font-bold ${selectedPart.weightReduction > 0 ? "text-cyber-blue" : "text-red-400"}`}>
                  {selectedPart.weightReduction > 0 ? `-${selectedPart.weightReduction} kg` : `+${Math.abs(selectedPart.weightReduction)} kg`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-cyber-gray rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${selectedPart.weightReduction > 0 ? "bg-cyber-blue shadow-[0_0_8px_#00f0ff]" : "bg-red-500"}`} 
                  style={{ width: `${Math.max(10, Math.min(100, (selectedPart.weightReduction + 2) * 15))}%` }}
                />
              </div>
            </div>
          </div>

          {/* DETAILED SPECS TABLE */}
          <div className="flex-1 flex flex-col gap-2" id="blueprint-specs-table">
            <span className="font-mono text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 block">
              CAN-BUS SPECIFICATIONS MATRICES
            </span>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(selectedPart.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-cyber-darker/55 rounded border border-cyber-gray/40 font-mono text-xs">
                  <span className="text-slate-400">{key}</span>
                  <span className="text-white font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIONS AND COST BANNER */}
          <div className="mt-6 pt-4 border-t border-cyber-gray flex flex-col gap-3" id="parts-sheet-actions">
            
            <div className="flex justify-between items-center bg-cyber-darker p-3 rounded border border-cyber-gray font-mono">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <CircleDollarSign className="w-4 h-4 text-cyber-orange" /> TOKYO BLACK MARKET COST
              </span>
              <span className="text-lg font-black text-white glow-orange">
                {selectedPart.price.toLocaleString()} ฿
              </span>
            </div>

            {/* Giant Glowing Action button as requested by user guidelines */}
            <button
              id={`install-upgrade-btn-${selectedPart.id}`}
              onClick={() => onToggleUpgrade(selectedPart)}
              className={`w-full py-3 font-display font-black tracking-widest text-xs uppercase rounded cursor-pointer transition-all flex items-center justify-center gap-2 border shadow-lg ${
                isInstalled
                  ? "bg-cyber-darker text-cyber-green border-cyber-green hover:bg-green-950/20 shadow-green-950/20"
                  : "bg-cyber-orange hover:bg-orange-400 text-black border-orange-500 shadow-orange-950/20 hover:scale-[1.01]"
              }`}
            >
              {isInstalled ? (
                <>
                  <Check className="w-4 h-4" />
                  UNINSTALL UPGRADE FROM BUILD
                </>
              ) : (
                <>
                  <Hammer className="w-4 h-4" />
                  INSTALL UPGRADE (APPLY HP BOOST)
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
