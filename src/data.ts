import { MotorcycleModel, DTCError, SparePart } from "./types";

export const MOTORCYCLE_MODELS: MotorcycleModel[] = [
  {
    id: "lead125",
    name: "Honda LEAD 125 (Cyber-Modified)",
    year: "2024",
    baseHp: 11.2,
    baseTorque: 12.1,
    maxRpm: 9500,
    ecuSystem: "PGM-FI Gen 8",
    imageSeed: "lead",
  },
  {
    id: "wave125i",
    name: "Honda Wave 125i (Underground Street)",
    year: "2023",
    baseHp: 9.5,
    baseTorque: 10.4,
    maxRpm: 9000,
    ecuSystem: "Keihin Race EFI",
    imageSeed: "wave",
  },
  {
    id: "cbr650r",
    name: "Honda CBR650R (Neon Stealth)",
    year: "2024",
    baseHp: 94.0,
    baseTorque: 64.0,
    maxRpm: 12500,
    ecuSystem: "Denso Multi-Map V3",
    imageSeed: "cbr",
  },
  {
    id: "tmax560",
    name: "Yamaha TMAX 560 (Tokyo Overlord)",
    year: "2024",
    baseHp: 47.6,
    baseTorque: 55.7,
    maxRpm: 8500,
    ecuSystem: "YCC-T Smart ECU",
    imageSeed: "tmax",
  },
  {
    id: "yzf-r1",
    name: "Yamaha YZF-R1 (Overrider S1)",
    year: "2024",
    baseHp: 198.0,
    baseTorque: 113.0,
    maxRpm: 14500,
    ecuSystem: "Yamaha Racing ECU Pro",
    imageSeed: "r1",
  }
];

export const DTC_ERRORS: DTCError[] = [
  {
    code: "P0107",
    title: "MAP Sensor Circuit Low Input",
    system: "Intake / Fuel Delivery",
    description: "Manifold Absolute Pressure sensor signal voltage is below normal limits. Causes hesitation and rich fuel mixtures.",
    severity: "MEDIUM",
  },
  {
    code: "P0113",
    title: "IAT Sensor Circuit High Input",
    system: "Intake System",
    description: "Intake Air Temperature sensor circuit reports open or extremely cold temperatures, causing incorrect ECU air density calculations.",
    severity: "LOW",
  },
  {
    code: "P0122",
    title: "TPS Circuit Low Input",
    system: "Throttle Body",
    description: "Throttle Position Sensor reporting voltage below 0.2V. Leads to flat spots, sudden engine cutting, and poor acceleration response.",
    severity: "MEDIUM",
  },
  {
    code: "P0171",
    title: "System Too Lean (Fuel Trim)",
    system: "Fuel Delivery / Oxygen Sensor",
    description: "The engine is getting too much air or too little fuel. High risk of engine detonation and high temperatures under load.",
    severity: "CRITICAL",
  },
  {
    code: "P0217",
    title: "Engine Coolant Overtemperature Condition",
    system: "Cooling System",
    description: "Engine temperature has breached safety thresholds. Shut down immediately to avoid seizing cylinder pistons.",
    severity: "CRITICAL",
  },
  {
    code: "P0335",
    title: "Crankshaft Position Sensor Circuit A Malfunction",
    system: "Ignition / Timing",
    description: "ECU has lost the engine speed reference. Causes immediate stall, failure to restart, and ignition backfiring.",
    severity: "CRITICAL",
  },
  {
    code: "P0505",
    title: "Idle Control System Malfunction",
    system: "Intake System (IACV)",
    description: "Idle Air Control Valve circuit failure. Results in unstable engine idling or cold starting stall issues.",
    severity: "LOW",
  }
];

export const SPARE_PARTS: SparePart[] = [
  {
    id: "part-ecu",
    name: "V4 Cyber-Link Programmable ECU",
    japaneseName: "サイバーリンク ECU",
    category: "Electronics",
    description: "Next-gen direct injection custom ECU. Unlocks high RPM limits, real-time wireless fuel trim controls, and custom telemetry mappings.",
    hpBonus: 4.8,
    torqueBonus: 3.2,
    weightReduction: 0.4,
    price: 18500,
    blueprintCoordinates: { x: 38, y: 35 },
    specs: {
      Processor: "Quad-Core Cortex 180MHz",
      Connectivity: "Secure Bluetooth 6.0 BLE",
      "Mapping Resolution": "32x32 Spark & Fuel Matrices",
      "Waterproofing": "IP69K Mil-Spec Case"
    }
  },
  {
    id: "part-injector",
    name: "18-Hole High-Flow Plasma Injector",
    japaneseName: "プラズマインジェクター",
    category: "Fuel System",
    description: "Ultrasonic atomization fuel injector. Delivers extremely fine fuel particles for clean burning, high power, and perfect combustion.",
    hpBonus: 2.2,
    torqueBonus: 1.8,
    weightReduction: 0.1,
    price: 4500,
    blueprintCoordinates: { x: 50, y: 44 },
    specs: {
      "Flow Rate": "320cc/min at 3 Bar",
      "Spray Pattern": "Conical 18-Hole Micro-Splay",
      Response: "1.1ms Open/Close Cycle",
      Compatible: "E20, E85, 95 Gasohol"
    }
  },
  {
    id: "part-exhaust",
    name: "Hyperflow Titanium Exhaust System",
    japaneseName: "ハイパーフローマフラー",
    category: "Exhaust",
    description: "Hand-welded grade 5 titanium exhaust with integrated resonator. Backpressure-optimized expansion chamber for rich tone and top speed.",
    hpBonus: 6.5,
    torqueBonus: 4.5,
    weightReduction: 4.8,
    price: 29000,
    blueprintCoordinates: { x: 74, y: 70 },
    specs: {
      Material: "Pure Grade-5 Titanium",
      "Db Level": "92dB @ 4000 RPM (Under limit)",
      Header: "Staged Expansion 32mm to 48mm",
      "Heat Shield": "Vacuum-formed Carbon Fiber"
    }
  },
  {
    id: "part-turbo",
    name: "Micro-Active Electric Turbocharger",
    japaneseName: "過給機ターボチャージャー",
    category: "Induction",
    description: "Instant response electric turbine system. Spin-up controlled by engine throttle percentage, completely eliminating turbo-lag.",
    hpBonus: 12.0,
    torqueBonus: 10.5,
    weightReduction: -1.2, // Increases weight slightly
    price: 42000,
    blueprintCoordinates: { x: 58, y: 38 },
    specs: {
      "Boost Range": "0.4 Bar to 1.1 Bar (Adjustable)",
      Impeller: "Billet Aluminum 3D CNC",
      Drive: "48V High-Torque Brushless Motor",
      "Peak RPM": "140,000 RPM (Instant)"
    }
  },
  {
    id: "part-shocks",
    name: "Monoshock Nitrox Carbon Suspension",
    japaneseName: "カーボンサスペンション",
    category: "Chassis",
    description: "Fully adjustable rear monoshock with carbon-fiber sleeved remote reservoir. 32-click compression and rebound dial.",
    hpBonus: 0,
    torqueBonus: 0,
    weightReduction: 1.5,
    price: 14800,
    blueprintCoordinates: { x: 71, y: 52 },
    specs: {
      "Damper Type": "Nitrox Gas Charged Monotube",
      Adjustability: "Preload, Rebound, Compression",
      Spring: "Titanium Alloy Progressive Rate",
      Stroke: "65mm with Hydraulic Stopper"
    }
  }
];
