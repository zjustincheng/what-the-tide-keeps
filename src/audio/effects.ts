// Sound effects, synthesised on the spot: a few oscillators and some noise for each.
// What the ground underfoot is made of, which sets the sound of each footstep.
export type Surface = 'grass' | 'dirt' | 'stone' | 'wood' | 'water' | 'leaves' | 'straw' | 'snow';
export type Effect =
  | 'blip' | 'select' | 'open' | 'door' | 'find' | 'coins' | 'rest' | `step-${Surface}`
  | 'cast-line' | 'plop' | 'splash' | 'catch'
  | 'lash' | 'maul' | 'talons' | 'hit' | 'block' | 'barrier' | 'dodge' | 'graze'
  | 'key' | 'spell' | 'fizzle' | 'heal' | 'gather' | 'victory' | 'defeat' | 'roar';

// pitch shifts tonal effects by semitones, so each speaker's voice blips at their own pitch.
export function playEffect(context: BaseAudioContext, out: AudioNode, noise: AudioBuffer, name: Effect, pitch = 0) {
  const now = context.currentTime + 0.01;
  const shift = 2 ** (pitch / 12);

  // A tone with a quick attack and an exponential fall.
  const tone = (type: OscillatorType, from: number, to: number, start: number, length: number, level: number, cutoff = 6000) => {
    const osc = context.createOscillator(), gain = context.createGain(), filter = context.createBiquadFilter();
    osc.type = type;
    osc.frequency.setValueAtTime(from * shift, now + start);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to * shift, now + start + length);
    filter.type = 'lowpass'; filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(level, now + start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
    osc.connect(filter).connect(gain).connect(out);
    osc.start(now + start); osc.stop(now + start + length + 0.05);
  };
  // Filtered noise, swept from one frequency to another.
  const hiss = (type: BiquadFilterType, from: number, to: number, start: number, length: number, level: number, q = 1) => {
    const source = context.createBufferSource(), gain = context.createGain(), filter = context.createBiquadFilter();
    source.buffer = noise;
    filter.type = type; filter.Q.value = q;
    filter.frequency.setValueAtTime(from, now + start);
    filter.frequency.exponentialRampToValueAtTime(to, now + start + length);
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(level, now + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
    source.connect(filter).connect(gain).connect(out);
    source.start(now + start, Math.random() * 0.5); source.stop(now + start + length + 0.05);
  };
  // A bell-like ping: a sine whose overtone fades as it rings.
  const ping = (freq: number, start: number, length: number, level: number, ratio = 3.5) => {
    const carrier = context.createOscillator(), modulator = context.createOscillator(), index = context.createGain(), gain = context.createGain();
    carrier.frequency.value = freq * shift; modulator.frequency.value = freq * shift * ratio;
    index.gain.setValueAtTime(freq * 2, now + start); index.gain.exponentialRampToValueAtTime(freq * 0.05, now + start + length * 0.6);
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(level, now + start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
    modulator.connect(index).connect(carrier.frequency);
    carrier.connect(gain).connect(out);
    for (const osc of [carrier, modulator]) { osc.start(now + start); osc.stop(now + start + length + 0.05); }
  };

  const effects: Record<Effect, () => void> = {
    // A soft voice blip, one per few letters as someone speaks.
    blip: () => tone('square', 220, 200, 0, 0.05, 0.09, 1400),
    select: () => tone('sine', 880, 660, 0, 0.07, 0.12),
    // Footsteps, one sound per surface, kept well under everything else. The caller alternates the pitch for left and right feet.
    'step-grass': () => { hiss('bandpass', 1800, 900, 0, 0.16, 0.09, 1.2); tone('sine', 95, 60, 0, 0.06, 0.045); },
    'step-dirt': () => { hiss('bandpass', 1300, 600, 0, 0.08, 0.135, 2); tone('sine', 120, 70, 0, 0.07, 0.072); },
    'step-stone': () => { tone('sine', 210, 120, 0, 0.06, 0.135); hiss('highpass', 3200, 2400, 0, 0.035, 0.072); },
    'step-wood': () => { tone('triangle', 190, 150, 0, 0.1, 0.144); tone('sine', 380, 300, 0, 0.05, 0.045); hiss('bandpass', 900, 700, 0, 0.04, 0.045, 2); },
    'step-water': () => { hiss('lowpass', 2600, 500, 0, 0.2, 0.117); tone('sine', 320, 120, 0.01, 0.09, 0.045); },
    'step-leaves': () => { for (let i = 0; i < 3; i++) hiss('bandpass', 3600, 2400, i * 0.025, 0.035, 0.081, 3); tone('sine', 100, 65, 0, 0.05, 0.036); },
    'step-snow': () => { hiss('bandpass', 2200, 1100, 0, 0.12, 0.117, 2.5); hiss('lowpass', 700, 300, 0.02, 0.08, 0.054); },
    'step-straw': () => { hiss('bandpass', 2600, 1500, 0, 0.13, 0.099, 1); hiss('highpass', 4000, 3000, 0.04, 0.05, 0.036); },
    open: () => { hiss('bandpass', 600, 1800, 0, 0.18, 0.12, 0.8); tone('sine', 330, 330, 0, 0.12, 0.06); },
    door: () => { hiss('bandpass', 380, 140, 0, 0.45, 0.12, 6); tone('sine', 70, 50, 0.35, 0.2, 0.18); },
    find: () => [0, 4, 7, 12].forEach((step, i) => ping(659 * 2 ** (step / 12), i * 0.09, 0.9, 0.1)),
    coins: () => { ping(2200, 0, 0.25, 0.12, 1.41); ping(2600, 0.07, 0.3, 0.1, 1.41); },
    rest: () => { for (let i = 0; i < 6; i++) hiss('bandpass', 2400, 1800, i * 0.13 + (i % 2) * 0.04, 0.05, 0.05, 3); [0, 4, 7].forEach(step => tone('triangle', 262 * 2 ** (step / 12), 262 * 2 ** (step / 12), 0.2, 1.6, 0.04, 1800)); },
    'cast-line': () => hiss('highpass', 900, 3500, 0, 0.3, 0.07),
    plop: () => tone('sine', 420, 110, 0, 0.16, 0.18),
    splash: () => hiss('lowpass', 2400, 300, 0, 0.5, 0.18),
    catch: () => { hiss('lowpass', 2400, 300, 0, 0.45, 0.16); [0, 4, 7].forEach((step, i) => ping(784 * 2 ** (step / 12), 0.25 + i * 0.08, 0.7, 0.08)); },
    // Each hero strikes differently: a whip of a tail, a heavy maul, a rake of talons.
    lash: () => { hiss('highpass', 1200, 5000, 0, 0.12, 0.14); hiss('bandpass', 3000, 2000, 0.1, 0.04, 0.2, 2); },
    maul: () => { tone('sine', 95, 38, 0, 0.32, 0.28); hiss('lowpass', 900, 200, 0, 0.2, 0.16); },
    talons: () => { hiss('bandpass', 3400, 2400, 0, 0.07, 0.4, 3); hiss('bandpass', 3800, 2600, 0.08, 0.07, 0.4, 3); },
    hit: () => { tone('sine', 140, 50, 0, 0.22, 0.26); hiss('bandpass', 1200, 400, 0, 0.12, 0.16, 1.5); },
    block: () => { ping(440, 0, 0.4, 0.12, 1.41); hiss('bandpass', 2500, 1800, 0, 0.06, 0.08, 3); },
    barrier: () => { [0, 7, 12].forEach((step, i) => tone('sine', 523 * 2 ** (step / 12), 523 * 2 ** (step / 12), i * 0.05, 0.9, 0.05)); ping(1568, 0.1, 1, 0.04, 2); },
    dodge: () => { hiss('bandpass', 500, 2600, 0, 0.24, 0.5, 1); hiss('highpass', 2000, 6000, 0.1, 0.15, 0.12); },
    graze: () => { hiss('bandpass', 1800, 900, 0, 0.12, 0.12, 2); tone('sine', 120, 70, 0, 0.12, 0.12); },
    key: () => tone('sine', 1320, 1320, 0, 0.04, 0.1),
    spell: () => { [0, 3, 7, 10, 14].forEach((step, i) => ping(523 * 2 ** (step / 12), i * 0.05, 0.6, 0.07, 4)); hiss('highpass', 800, 4000, 0, 0.5, 0.05); },
    fizzle: () => { tone('sawtooth', 420, 70, 0, 0.5, 0.12, 1200); hiss('lowpass', 1500, 200, 0.05, 0.4, 0.1); },
    heal: () => [0, 4, 7, 12].forEach(step => tone('triangle', 392 * 2 ** (step / 12), 392 * 2 ** (step / 12), 0.02 * step, 1.2, 0.07, 2400)),
    gather: () => { tone('sine', 220, 440, 0, 0.6, 0.12); ping(880, 0.4, 0.6, 0.07, 2); },
    victory: () => [[0, 0], [4, 0.16], [7, 0.32], [12, 0.48]].forEach(([step, at]) => { tone('sawtooth', 392 * 2 ** (step / 12), 392 * 2 ** (step / 12), at, 0.9, 0.05, 1600); ping(784 * 2 ** (step / 12), at, 0.8, 0.04); }),
    // A boss turning: a low growl swelling under a rush of noise.
    roar: () => { tone('sawtooth', 70, 110, 0, 0.9, 0.12, 700); tone('sawtooth', 104, 150, 0.05, 0.8, 0.08, 900); hiss('bandpass', 400, 1600, 0, 0.9, 0.16, 1.5); },
    defeat: () => { tone('sawtooth', 110, 55, 0, 2.2, 0.08, 500); tone('sine', 220, 110, 0, 2, 0.06); },
  };
  effects[name]();
}
