class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isBgmPlaying: boolean = false;

  constructor() {
    // Initialize strictly on user interaction
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playBGM() {
    if (this.isMuted || !this.ctx || this.isBgmPlaying) return;
    
    // Create a simple synthwave drone loop
    const rootFreq = 110; // A2
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.value = rootFreq;
    osc2.type = 'square';
    osc2.frequency.value = rootFreq / 2; // Octave down

    // Filter for muffled sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    // LFO for movement
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.5; // 0.5 Hz
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 400;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.value = 0.1; // Low volume background

    osc1.start();
    osc2.start();
    lfo.start();

    this.bgmOscillators = [osc1, osc2, lfo];
    this.bgmGain = gain;
    this.isBgmPlaying = true;
  }

  public stopBGM() {
    if (this.bgmOscillators.length > 0) {
      this.bgmOscillators.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
      this.bgmOscillators = [];
    }
    this.isBgmPlaying = false;
  }

  public playSFX(type: 'PADDLE_HIT' | 'WALL_HIT' | 'BRICK_HIT' | 'EXPLOSION' | 'POWERUP' | 'LOSE_LIFE' | 'WIN') {
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    switch (type) {
      case 'PADDLE_HIT':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'WALL_HIT':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'BRICK_HIT':
        osc.type = 'square';
        osc.frequency.setValueAtTime(600 + Math.random() * 200, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      
      case 'EXPLOSION':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(10, t + 0.4);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;

      case 'POWERUP':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.1);
        osc.frequency.linearRampToValueAtTime(1500, t + 0.2);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case 'LOSE_LIFE':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.5);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;

      case 'WIN':
        osc.type = 'triangle';
        // Arpeggio
        [440, 554, 659, 880].forEach((freq, i) => {
           const o = this.ctx!.createOscillator();
           const g = this.ctx!.createGain();
           o.connect(g);
           g.connect(this.ctx!.destination);
           o.frequency.value = freq;
           const startTime = t + i * 0.1;
           g.gain.setValueAtTime(0.2, startTime);
           g.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
           o.start(startTime);
           o.stop(startTime + 0.4);
        });
        break;
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute) {
      this.stopBGM();
    } else if (this.ctx) {
      this.playBGM();
    }
  }
}

export const soundEngine = new SoundEngine();