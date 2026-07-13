export interface MotorcycleModel {
  id: string;
  name: string;
  year: string;
  baseHp: number;
  baseTorque: number;
  maxRpm: number;
  ecuSystem: string;
  imageSeed: string;
}

export interface DTCError {
  code: string;
  title: string;
  system: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "CRITICAL";
}

export interface SparePart {
  id: string;
  name: string;
  japaneseName: string;
  category: string;
  description: string;
  hpBonus: number;
  torqueBonus: number;
  weightReduction: number;
  price: number;
  blueprintCoordinates: { x: number; y: number }; // Percentage coordinate on blueprint
  specs: { [key: string]: string };
}

export interface ECUConfig {
  fuelTrim: number; // -20% to +20%
  ignitionTiming: number; // -5 to +15 degrees
  revLimit: number; // RPM
  turboBoost?: number; // bar
}

export interface TuningProfile {
  id: string;
  name: string;
  fuelTrim: number;
  ignitionTiming: number;
  revLimit: number;
  isCustom?: boolean;
}

export interface SensorStatus {
  id: string;
  name: string;
  japaneseName: string;
  value: string;
  unit: string;
  connected: boolean;
  errorCode: string;
  normalRange: string;
}
