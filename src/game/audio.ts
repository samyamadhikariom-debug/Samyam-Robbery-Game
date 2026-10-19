/**
 * Pure Web Audio API Sound Synthesizer Engine
 * No external sound files needed. 100% resilient procedural sound design.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private isMuted: boolean = false;
  private sfxVolume: number = 0.7;
  private musicVolume: number = 0.4;

  // Siren oscillator nodes
  private sirenOsc: OscillatorNode | null = null;
  private sirenLfo: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenActive: boolean = false;

  // Engine sound oscillator
  private engineOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;
  private engineActive: boolean = false;

  // Radio synthesizer
  private radioPlaying: boolean = true;
  private radioTimer: number | null = null;
  private radioStation: number = 0; // 0 = Synthwave Heat, 1 = Electro Fugitive, 2 = Off
  private radioTempo: number = 120;
  private radioStep: number = 0;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.startRadio();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public userInteraction() {
    this.initContext();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setVolume(sfx: number, music: number) {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    if (this.ctx) {
      if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.05);
      if (this.musicGain) this.musicGain.gain.setTargetAtTime(music, this.ctx.currentTime, 0.05);
    }
  }

  // --- POLICE SIREN ---
  public updateSiren(wantedLevel: number) {
    if (!this.ctx || this.isMuted) return;

    if (wantedLevel > 0) {
      if (!this.sirenActive) {
        this.startSiren(wantedLevel);
      } else if (this.sirenGain && this.ctx) {
        const targetGain = Math.min(0.25, 0.08 + wantedLevel * 0.035);
        this.sirenGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
        if (this.sirenLfo) {
          // Higher wanted level = faster wail
          this.sirenLfo.frequency.setTargetAtTime(wantedLevel >= 3 ? 3.0 : 1.8, this.ctx.currentTime, 0.2);
        }
      }
    } else {
      if (this.sirenActive) {
        this.stopSiren();
      }
    }
  }

  private startSiren(wantedLevel: number) {
    if (!this.ctx || !this.sfxGain) return;
    try {
      this.stopSiren();

      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(wantedLevel >= 3 ? 3.0 : 1.8, this.ctx.currentTime);

      lfoGain.gain.setValueAtTime(260, this.ctx.currentTime);
      lfo.connect(osc.frequency);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      lfo.start();
      osc.start();

      this.sirenOsc = osc;
      this.sirenLfo = lfo;
      this.sirenGain = gain;
      this.sirenActive = true;
    } catch {
      // Audio fallback
    }
  }

  private stopSiren() {
    if (this.sirenGain && this.ctx) {
      this.sirenGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.2);
      setTimeout(() => {
        try {
          this.sirenOsc?.stop();
          this.sirenLfo?.stop();
          this.sirenOsc?.disconnect();
          this.sirenLfo?.disconnect();
          this.sirenGain?.disconnect();
        } catch {
          // clean
        }
        this.sirenOsc = null;
        this.sirenLfo = null;
        this.sirenGain = null;
        this.sirenActive = false;
      }, 250);
    } else {
      this.sirenActive = false;
    }
  }

  // --- ENGINE SOUND ---
  public updateEngine(inVehicle: boolean, speedRatio: number) {
    if (!this.ctx || this.isMuted) return;

    if (inVehicle) {
      if (!this.engineActive) {
        this.startEngine();
      }
      if (this.engineOsc && this.engineFilter && this.engineGain && this.ctx) {
        const baseFreq = 45 + speedRatio * 85;
        this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.08);
        this.engineFilter.frequency.setTargetAtTime(150 + speedRatio * 400, this.ctx.currentTime, 0.08);
        this.engineGain.gain.setTargetAtTime(0.08 + speedRatio * 0.09, this.ctx.currentTime, 0.05);
      }
    } else {
      if (this.engineActive) {
        this.stopEngine();
      }
    }
  }

  private startEngine() {
    if (!this.ctx || !this.sfxGain) return;
    try {
      this.stopEngine();
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      this.engineOsc = osc;
      this.engineFilter = filter;
      this.engineGain = gain;
      this.engineActive = true;
    } catch {
      // Audio fallback
    }
  }

  private stopEngine() {
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.1);
      setTimeout(() => {
        try {
          this.engineOsc?.stop();
          this.engineOsc?.disconnect();
          this.engineGain?.disconnect();
        } catch {
          // clean
        }
        this.engineOsc = null;
        this.engineFilter = null;
        this.engineGain = null;
        this.engineActive = false;
      }, 150);
    } else {
      this.engineActive = false;
    }
  }

  // --- SOUND EFFECTS ---

  public playHorn() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(370, now);
    osc2.frequency.setValueAtTime(440, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.23);
    osc2.stop(now + 0.23);
  }

  public playFootstep(isRunning: boolean) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const pitch = isRunning ? 180 + Math.random() * 40 : 130 + Math.random() * 30;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

    const vol = isRunning ? 0.08 : 0.04;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playRoll() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(now);
  }

  public playNitro() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.6;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.25);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(now);
  }

  public playMedkit() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C E G C
    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.06);
      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.22);
    });
  }

  public playGunshot(type: 'pistol' | 'deagle' | 'smg' | 'shotgun' | 'rifle' | 'sniper' | 'minigun' | 'grenade') {
    if (!this.ctx || this.isMuted) return;
    this.initContext();

    const now = this.ctx.currentTime;
    const duration = type === 'sniper' ? 0.35 : type === 'deagle' ? 0.25 : type === 'shotgun' ? 0.22 : 0.12;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = type === 'shotgun' || type === 'sniper' || type === 'deagle' ? 'lowpass' : 'bandpass';
    const cutoff = type === 'deagle' ? 850 : type === 'sniper' ? 600 : type === 'shotgun' ? 700 : type === 'smg' || type === 'minigun' ? 1500 : 1000;
    filter.frequency.setValueAtTime(cutoff, now);

    const gain = this.ctx.createGain();
    const peak = type === 'sniper' ? 0.55 : type === 'deagle' ? 0.5 : type === 'shotgun' ? 0.45 : type === 'minigun' ? 0.22 : 0.3;
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Add bass punch
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'triangle';
    const startBass = type === 'sniper' ? 180 : type === 'deagle' ? 160 : 130;
    subOsc.frequency.setValueAtTime(startBass, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(type === 'sniper' || type === 'deagle' ? 0.45 : 0.25, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain!);

    noise.start(now);
    subOsc.start(now);
    subOsc.stop(now + 0.15);
  }

  public playPunch() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playTireSkid() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(6, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(now);
  }

  public playCrash() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playCashPickup() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.07); // E6

    osc2.frequency.setValueAtTime(1975.53, now); // B6
    osc2.frequency.setValueAtTime(2637.02, now + 0.07); // E7

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain!);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);
  }

  public playStoreAlarm() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1760, now);
    osc.frequency.setValueAtTime(1320, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playExplosion() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(now);
  }

  public playSprayPaint() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2500, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(now);
  }

  public playWasted() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Dramatic descending minor chord
    const freqs = [330, 311, 293, 261];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.2, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.85);
    });
  }

  public playBusted() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(164.81, now + 0.2);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.85);
  }

  // --- PROCEDURAL RADIO STATIONS ---
  public toggleRadio() {
    this.radioStation = (this.radioStation + 1) % 3;
    return this.getStationName();
  }

  public getStationName(): string {
    if (this.radioStation === 0) return 'Wave 98.4 FM (Retro Synth)';
    if (this.radioStation === 1) return 'Heatwave FM (Dark Electro)';
    return 'Radio Off';
  }

  public getCurrentStation(): number {
    return this.radioStation;
  }

  private startRadio() {
    if (this.radioTimer) clearInterval(this.radioTimer);

    const stepInterval = (60 / this.radioTempo) * 1000 / 4; // 16th notes
    this.radioTimer = window.setInterval(() => {
      if (this.isMuted || this.radioStation === 2 || !this.ctx || !this.musicGain) {
        return;
      }
      this.stepRadioPattern();
      this.radioStep = (this.radioStep + 1) % 16;
    }, stepInterval);
  }

  private stepRadioPattern() {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    // Station 0: 80s Synthwave Bassline (A minor / F / G)
    if (this.radioStation === 0) {
      // Kick drum on beats 0, 4, 8, 12
      if (this.radioStep % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(130, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.08);
        kickGain.gain.setValueAtTime(0.2, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.1);
      }

      // Snare on 4 and 12
      if (this.radioStep === 4 || this.radioStep === 12) {
        const snareOsc = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(180, now);
        snareGain.gain.setValueAtTime(0.12, now);
        snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        snareOsc.connect(snareGain);
        snareGain.connect(this.musicGain);
        snareOsc.start(now);
        snareOsc.stop(now + 0.13);
      }

      // Rolling bassline (16th notes)
      const bassNotes = [110, 110, 130.8, 110, 110, 110, 146.8, 110, 87.3, 87.3, 110, 87.3, 98, 98, 110, 123.47];
      const freq = bassNotes[this.radioStep];
      const bassOsc = this.ctx.createOscillator();
      const bassFilter = this.ctx.createBiquadFilter();
      const bassGain = this.ctx.createGain();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(freq / 2, now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(380, now);

      bassGain.gain.setValueAtTime(0.08, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.1);
    } else if (this.radioStation === 1) {
      // Station 1: Dark Electro Beat
      if (this.radioStep % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        const notes = [65.41, 65.41, 73.42, 65.41, 77.78, 65.41, 87.31, 73.42];
        osc.frequency.setValueAtTime(notes[(this.radioStep / 2) % notes.length], now);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    }
  }

  public destroy() {
    if (this.radioTimer) clearInterval(this.radioTimer);
    this.stopSiren();
    this.stopEngine();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const soundEngine = new SoundEngine();
