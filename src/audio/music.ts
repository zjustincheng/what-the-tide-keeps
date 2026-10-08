// Plays the game's themes with instruments synthesised in Web Audio: no sound files.
// A look-ahead scheduler queues each loop a little before it is due, and themes crossfade as places change.
import { frequency, loopBeats, THEMES } from './themes';
import type { NoteEvent, ThemeId, Voice } from './themes';

const SETTINGS = 'tide-keeps.settings.v1';
const LOOKAHEAD = 0.5; // seconds of music queued ahead of the clock
const FADE = 1.6; // seconds to crossfade between themes

// A playing theme: its notes in time order, where the current loop began, and the next note to queue.
type Track = { id: ThemeId; gain: GainNode; order: readonly NoteEvent[]; loopStart: number; index: number };

class Music {
  private context?: BaseAudioContext;
  private output?: GainNode;
  private room?: ConvolverNode;
  private noise?: AudioBuffer;
  private track?: Track;
  private timer?: ReturnType<typeof setInterval>;
  // The theme the game wants, even before the player has made a sound possible.
  current?: ThemeId;
  volume = 0.6;
  muted = false;

  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS) ?? '{}') as { music?: unknown; muted?: unknown };
      if (typeof saved.music === 'number' && saved.music >= 0 && saved.music <= 1) this.volume = saved.music;
      if (typeof saved.muted === 'boolean') this.muted = saved.muted;
    } catch { /* Unavailable storage just means default volume. */ }
  }

  // Browsers only allow sound after the player has pressed or clicked something.
  unlock() {
    if (!this.context) {
      const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Context) return;
      this.context = new Context();
      this.build();
      this.timer = setInterval(() => this.schedule(), 100);
    }
    if (this.context.state === 'suspended') void (this.context as AudioContext).resume();
    if (this.current && this.track?.id !== this.current) this.start(this.current);
  }

  play(id: ThemeId) {
    if (this.current === id && this.track?.id === id) return;
    this.current = id;
    if (this.context) this.start(id);
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.apply(); this.save();
  }

  toggleMute() {
    this.muted = !this.muted;
    this.apply(); this.save();
  }

  get playing(): ThemeId | undefined { return this.track?.id; }

  private save() {
    try { localStorage.setItem(SETTINGS, JSON.stringify({ music: this.volume, muted: this.muted })); } catch { /* Not saved; still applies now. */ }
  }

  private apply() {
    if (!this.context || !this.output) return;
    this.output.gain.setTargetAtTime(this.muted ? 0 : this.volume * 0.5, this.context.currentTime, 0.1);
  }

  // A compressor, a generated hall reverb, and the master volume.
  private build() {
    const context = this.context!;
    this.output = context.createGain();
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -18; compressor.ratio.value = 3;
    this.output.connect(compressor).connect(context.destination);
    this.room = context.createConvolver();
    const length = Math.floor(context.sampleRate * 3.2);
    const impulse = context.createBuffer(2, length, context.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.6;
    }
    this.room.buffer = impulse;
    const wet = context.createGain(); wet.gain.value = 0.42;
    this.room.connect(wet).connect(this.output);
    this.noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.apply();
  }

  private start(id: ThemeId) {
    const context = this.context!;
    const now = context.currentTime;
    if (this.track) {
      const old = this.track;
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.setValueAtTime(old.gain.gain.value, now);
      old.gain.gain.linearRampToValueAtTime(0, now + FADE);
      setTimeout(() => old.gain.disconnect(), (FADE + LOOKAHEAD + 4) * 1000);
    }
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + FADE);
    gain.connect(this.output!);
    gain.connect(this.room!);
    this.track = { id, gain, order: [...THEMES[id].events].sort((a, b) => a.beat - b.beat), loopStart: now + 0.1, index: 0 };
    this.schedule();
  }

  // Queue only the notes due in the next moment. Timing never depends on the frame rate, and building
  // a few notes at a time never stalls the page the way a whole loop at once would.
  private schedule(horizon = (this.context?.currentTime ?? 0) + LOOKAHEAD) {
    const track = this.track;
    if (!this.context || !track) return;
    const theme = THEMES[track.id];
    const beat = 60 / theme.bpm;
    for (;;) {
      const event = track.order[track.index];
      const time = track.loopStart + event.beat * beat;
      if (time > horizon) break;
      this.note(track.gain, event, time, event.beats * beat);
      if (++track.index === track.order.length) { track.index = 0; track.loopStart += loopBeats(theme) * beat; }
    }
  }

  private note(destination: AudioNode, event: NoteEvent, time: number, length: number) {
    const context = this.context!;
    const pitch = frequency(event.midi);
    const amp = context.createGain();
    amp.connect(destination);
    const envelope = (attack: number, sustain: number, release: number) => {
      amp.gain.setValueAtTime(0, time);
      amp.gain.linearRampToValueAtTime(event.velocity, time + attack);
      amp.gain.setValueAtTime(event.velocity * sustain, time + Math.max(attack, length));
      amp.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(attack, length) + release);
      return time + Math.max(attack, length) + release + 0.05;
    };
    const decay = (seconds: number) => {
      amp.gain.setValueAtTime(0, time);
      amp.gain.linearRampToValueAtTime(event.velocity, time + 0.006);
      amp.gain.exponentialRampToValueAtTime(0.0001, time + seconds);
      return time + seconds + 0.05;
    };
    const oscillator = (type: OscillatorType, freq: number, detune = 0, into: AudioNode = amp, level = 1) => {
      const osc = context.createOscillator();
      osc.type = type; osc.frequency.value = freq; osc.detune.value = detune;
      if (level === 1) osc.connect(into);
      else { const scale = context.createGain(); scale.gain.value = level; osc.connect(scale).connect(into); }
      return osc;
    };
    const filter = (type: BiquadFilterType, freq: number, q = 0.7) => {
      const node = context.createBiquadFilter();
      node.type = type; node.frequency.value = freq; node.Q.value = q;
      node.connect(amp);
      return node;
    };
    const vibrato = (osc: OscillatorNode, depth: number, delay: number) => {
      const lfo = context.createOscillator(); lfo.frequency.value = 5.2;
      const amount = context.createGain();
      amount.gain.setValueAtTime(0, time); amount.gain.linearRampToValueAtTime(depth, time + delay);
      lfo.connect(amount).connect(osc.frequency);
      return lfo;
    };
    const sources: AudioScheduledSourceNode[] = [];
    let end = time + length;
    const voices: Record<Voice, () => void> = {
      harp: () => { end = decay(length + 1.4); const tone = filter('lowpass', 2800); sources.push(oscillator('triangle', pitch, 0, tone), oscillator('sine', pitch * 2, 0, tone, 0.25)); },
      pluck: () => {
        end = decay(0.7);
        const tone = filter('lowpass', 3200);
        tone.frequency.setValueAtTime(3200, time); tone.frequency.exponentialRampToValueAtTime(420, time + 0.3);
        sources.push(oscillator('sawtooth', pitch, 0, tone, 0.6));
      },
      flute: () => {
        end = envelope(0.08, 0.85, 0.3);
        const osc = oscillator('sine', pitch);
        sources.push(osc, oscillator('triangle', pitch * 2, 0, amp, 0.08), vibrato(osc, pitch * 0.005, 0.3));
      },
      strings: () => { end = envelope(0.55, 1, 0.9); const tone = filter('lowpass', 1500); sources.push(oscillator('sawtooth', pitch, -7, tone, 0.5), oscillator('sawtooth', pitch, 7, tone, 0.5)); },
      staccato: () => { end = envelope(0.015, 0.7, 0.12); const tone = filter('lowpass', 2200); sources.push(oscillator('sawtooth', pitch, -5, tone, 0.5), oscillator('sawtooth', pitch, 5, tone, 0.5)); },
      organ: () => { end = envelope(0.2, 1, 0.5); sources.push(oscillator('sine', pitch), oscillator('sine', pitch * 2, 0, amp, 0.45), oscillator('sine', pitch * 3, 0, amp, 0.2)); },
      bell: () => this.fm(amp, pitch, 3.5, time, decay(3), sources),
      celesta: () => this.fm(amp, pitch, 4, time, decay(1.4), sources),
      bass: () => { end = envelope(0.01, 0.9, 0.25); const tone = filter('lowpass', 650); sources.push(oscillator('triangle', pitch, 0, tone), oscillator('sine', pitch / 2, 0, tone, 0.5)); },
      choir: () => {
        end = envelope(0.8, 1, 1.4);
        // Two vowel formants give the saws an 'ah'.
        const low = filter('bandpass', 800, 3), high = filter('bandpass', 1150, 4);
        for (const detune of [-9, 9]) {
          const osc = oscillator('sawtooth', pitch, detune, low, 0.6);
          osc.connect(high);
          sources.push(osc, vibrato(osc, pitch * 0.004, 0.5));
        }
      },
      drum: () => {
        end = decay(0.5);
        const osc = oscillator('sine', 110);
        osc.frequency.setValueAtTime(110, time); osc.frequency.exponentialRampToValueAtTime(42, time + 0.32);
        sources.push(osc, this.burst(filter('lowpass', 500)));
      },
      snare: () => { end = decay(0.2); sources.push(this.burst(filter('highpass', 1400))); },
    };
    voices[event.voice]();
    for (const source of sources) { source.start(time); source.stop(end); }
    sources[0]?.addEventListener('ended', () => amp.disconnect());
  }

  // Bells and celesta: a sine whose brightness fades as it rings.
  private fm(amp: GainNode, pitch: number, ratio: number, time: number, end: number, sources: AudioScheduledSourceNode[]) {
    const context = this.context!;
    const carrier = context.createOscillator(); carrier.frequency.value = pitch;
    const modulator = context.createOscillator(); modulator.frequency.value = pitch * ratio;
    const index = context.createGain();
    index.gain.setValueAtTime(pitch * 2.2, time); index.gain.exponentialRampToValueAtTime(pitch * 0.05, time + 0.9);
    modulator.connect(index).connect(carrier.frequency);
    carrier.connect(amp);
    sources.push(carrier, modulator);
  }

  // A burst of noise, for drums.
  private burst(into: AudioNode) {
    const source = this.context!.createBufferSource();
    source.buffer = this.noise!;
    source.connect(into);
    return source;
  }

  // Render a theme silently, for checking its levels: the loudest sample and the average loudness.
  async preview(id: ThemeId, seconds: number): Promise<{ peak: number; rms: number }> {
    const live = { context: this.context, output: this.output, room: this.room, noise: this.noise, track: this.track, volume: this.volume, muted: this.muted };
    const offline = new OfflineAudioContext(2, Math.floor(44100 * seconds), 44100);
    this.context = offline; this.volume = 1; this.muted = false; this.track = undefined;
    this.build();
    this.start(id);
    this.schedule(seconds);
    const rendered = await offline.startRendering();
    Object.assign(this, live);
    let peak = 0, sum = 0;
    const data = rendered.getChannelData(0);
    for (const sample of data) { peak = Math.max(peak, Math.abs(sample)); sum += sample * sample; }
    return { peak, rms: Math.sqrt(sum / data.length) };
  }

  stop() {
    clearInterval(this.timer);
    if (this.context instanceof AudioContext) void this.context.close();
  }
}

export const music = new Music();
