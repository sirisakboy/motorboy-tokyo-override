export class BikeAudioEngine {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private distortion: WaveShaperNode | null = null;
  private isRunning: boolean = false;
  private volume: number = 0.3; // Default 30% volume

  constructor() {}

  public init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser:", e);
    }
  }

  private makeDistortionCurve(amount: number = 50) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public start() {
    this.init();
    if (!this.ctx || this.isRunning) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    // Create Nodes
    this.osc1 = this.ctx.createOscillator();
    this.osc2 = this.ctx.createOscillator();
    this.filter = this.ctx.createBiquadFilter();
    this.distortion = this.ctx.createWaveShaper();
    this.gainNode = this.ctx.createGain();

    // Set Node Parameters
    // Oscillator 1: Sawtooth for raw aggressive exhaust growl
    this.osc1.type = "sawtooth";
    this.osc1.frequency.value = 45; // Idle low hum

    // Oscillator 2: Triangle for sub-bass power stroke
    this.osc2.type = "triangle";
    this.osc2.frequency.value = 22.5; // sub octave

    // Filter to roll off harsh highs and sound more muffled-exhaust-like
    this.filter.type = "lowpass";
    this.filter.frequency.value = 280;
    this.filter.Q.value = 4.0; // Resonant peak for rev character

    // Custom distortion to simulate exhaust pipe acoustics
    this.distortion.curve = this.makeDistortionCurve(35);
    this.distortion.oversample = "4x";

    // Set Volume
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    // Smooth ramp up
    this.gainNode.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);

    // Connections
    this.osc1.connect(this.distortion);
    this.osc2.connect(this.distortion);
    this.distortion.connect(this.filter);
    this.filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    // Start Oscillators
    this.osc1.start();
    this.osc2.start();
    this.isRunning = true;
  }

  public updateRpm(rpm: number, maxRpm: number, throttlePercent: number) {
    if (!this.isRunning || !this.osc1 || !this.osc2 || !this.filter || !this.gainNode || !this.ctx) return;

    // Normalised RPM value
    const rpmFactor = rpm / maxRpm; // 0.0 to 1.0

    // Pitch: maps from 40Hz (idle) to ~420Hz (redline)
    const baseFreq = 40 + rpmFactor * 380;
    
    // Add micro jitter to make the engine sound organic
    const jitter = Math.sin(this.ctx.currentTime * 45) * (1 + rpmFactor * 8);

    this.osc1.frequency.setTargetAtTime(baseFreq + jitter, this.ctx.currentTime, 0.05);
    this.osc2.frequency.setTargetAtTime((baseFreq / 2) + (jitter / 2), this.ctx.currentTime, 0.05);

    // Filter frequency: opens up as RPM and throttle increase, simulating raw airflow
    const filterFreq = 220 + (rpmFactor * 800) + (throttlePercent * 400);
    this.filter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.05);
    this.filter.Q.setTargetAtTime(3.0 + (throttlePercent * 3.0), this.ctx.currentTime, 0.05);

    // Volume modulation: get slightly louder and deeper under full throttle
    const dynamicVolume = this.volume * (0.65 + (throttlePercent * 0.35) + (rpmFactor * 0.1));
    this.gainNode.gain.setTargetAtTime(dynamicVolume, this.ctx.currentTime, 0.03);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx && this.isRunning) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public stop() {
    if (!this.isRunning) return;

    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    }

    setTimeout(() => {
      try {
        if (this.osc1) { this.osc1.stop(); this.osc1.disconnect(); }
        if (this.osc2) { this.osc2.stop(); this.osc2.disconnect(); }
        if (this.distortion) { this.distortion.disconnect(); }
        if (this.filter) { this.filter.disconnect(); }
        if (this.gainNode) { this.gainNode.disconnect(); }
      } catch (e) {
        console.warn("Error stopping audio components:", e);
      }
      this.osc1 = null;
      this.osc2 = null;
      this.filter = null;
      this.distortion = null;
      this.gainNode = null;
      this.isRunning = false;
    }, 200);
  }
}

// Global single instance of audio engine
export const bikeAudio = new BikeAudioEngine();
