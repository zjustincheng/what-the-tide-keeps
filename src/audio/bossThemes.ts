import type { Encounter } from '../rules/battle';
import type { NoteEvent, Theme, Voice } from './themes';

type Groove = 'march' | 'hunt' | 'waltz' | 'venom' | 'clock' | 'tide' | 'heart' | 'gallop' | 'flight' | 'skitter' | 'lurk' | 'submerged' | 'beacon';
type Chord = readonly [number, 'm' | 'M'];
type Score = {
  name: string; bpm: number; meter: number; tonic: number; register: number;
  lead: Voice; bed: Voice; groove: Groove; chords: readonly Chord[];
  // Eight authored bars. Pitch offsets are relative to the tonic, never snapped or
  // transposed to a changing chord. '-' is a rest; durations are actual beats.
  tune: readonly string[];
  openingLead?: Voice; repriseLead?: Voice; answerLead?: Voice;
  percussion?: number; fragmentedOpening?: boolean; waking?: boolean; gate?: number;
};

const SCORES = {
  // D minor: a stubborn low horn call, answered by a rising march. Dotted attacks
  // and short pickups leave room for the heavy bass rather than running over it.
  boar: { name: 'The farm they burned', bpm: 136, meter: 4, tonic: 38, register: 24, lead: 'brass', bed: 'staccato', groove: 'march', openingLead: 'strings',
    chords: [[0,'m'],[0,'m'],[8,'M'],[5,'m'],[0,'m'],[8,'M'],[7,'M'],[0,'m']],
    tune: ['0:1.5 0:.25 3:.25 7:1 -:.5 5:.5', '3:.5 2:.5 0:2 -:.5 7:.5', '8:1.5 7:.5 5:.5 3:.5 0:1', '5:1 8:.5 12:.5 10:1 8:1', '7:.5 12:.5 15:1 14:.5 12:.5 7:1', '8:1 12:.5 15:.5 12:1 8:1', '11:1.5 14:.5 11:.5 7:.5 2:.5 11:.5', '12:2 7:.5 3:.5 0:.5 -:.5'] },
  // G minor: a crooked funeral dance; the plucked tune answers itself across rests.
  hyena: { name: 'A table for the dead', bpm: 130, meter: 3, tonic: 43, register: 24, lead: 'pluck', bed: 'strings', groove: 'waltz', percussion: .7,
    chords: [[0,'m'],[3,'M'],[10,'M'],[0,'m'],[8,'M'],[5,'m'],[7,'M'],[0,'m']],
    tune: ['7:.5 3:.5 -:.5 0:.5 7:.75 10:.25', '10:1 7:.5 3:.5 -:1', '5:.75 7:.25 10:.5 14:.5 12:.5 10:.5', '7:1.5 3:.5 0:.5 -:.5', '8:.5 12:.5 15:.75 14:.25 12:1', '12:.5 8:.5 -:.5 5:.5 8:1', '11:.75 14:.25 11:.5 7:.5 2:.5 11:.5', '12:1.5 7:.25 3:.25 0:.5 -:.5'] },
  // B Phrygian with a major dominant: low strings linger on a recurring
  // semitone hook, with space between answers and restrained harp underneath.
  viper: { name: 'The bitter dose', bpm: 128, meter: 4, tonic: 35, register: 24, lead: 'strings', bed: 'harp', groove: 'flight', percussion: .65,
    chords: [[0,'m'],[1,'M'],[0,'m'],[7,'M'],[5,'m'],[1,'M'],[7,'M'],[0,'m']],
    tune: ['7:1.5 8:.5 7:.5 3:.5 -:1', '8:2 5:.5 1:.5 -:1', '3:1.5 1:.5 0:1 -:1', '11:1.5 12:.5 11:.5 7:.5 -:1', '12:1.5 13:.5 12:.5 8:.5 5:1', '8:1.5 5:.5 1:1 -:.5 5:.25 8:.25', '11:2 7:.5 5:.25 3:.25 2:.5 11:.5', '12:2.5 7:.5 0:.5 -:.5'] },
  // F minor: a stuttering music box with recurring neighbor-note ornaments.
  cuckoo: { name: 'A place in the nest', bpm: 138, meter: 3, tonic: 41, register: 24, lead: 'celesta', bed: 'harp', groove: 'clock',
    chords: [[0,'m'],[0,'m'],[8,'M'],[7,'M'],[5,'m'],[8,'M'],[7,'M'],[0,'m']],
    tune: ['12:.5 11:.25 12:.25 -:.5 7:.5 12:1','3:1.5 -:.5 2:.25 3:.25 0:.5','12:.5 10:.25 12:.25 -:.5 8:.5 12:1','11:1.5 -:.5 7:.25 11:.25 14:.5','8:.5 7:.25 8:.25 -:.5 5:.5 12:1','15:1.5 12:.5 -:.5 8:.5','14:.5 13:.25 14:.25 11:1 7:.5 -:.5','12:2 -:1'] },
  // A minor: broad brass over a rolling six-beat sea rhythm, not a waltz.
  cuttlefish: { name: 'The sea answers', bpm: 150, meter: 6, tonic: 33, register: 36, lead: 'brass', bed: 'strings', groove: 'tide', answerLead: 'flute',
    chords: [[0,'m'],[10,'M'],[8,'M'],[7,'M'],[0,'m'],[5,'m'],[8,'M'],[7,'M']],
    tune: ['0:1.5 3:.5 7:1 12:2 10:.5 7:.5', '10:2 14:.5 17:.5 14:1 10:1 -:1', '8:1.5 12:.5 15:1 17:1 15:1 12:1', '11:3 7:1 2:.5 6:.5 11:1', '12:1 15:.5 19:.5 24:2 22:1 19:1', '17:1.5 20:.5 24:1 20:1 17:1 12:1', '15:2 12:.5 8:.5 12:1 15:1 12:1', '11:2 7:1 6:.5 2:.5 0:1 -:1'] },
  // A minor: the child's three-note memory, then an anguished string answer.
  // Long silence and an uneven heartbeat make this one distinct from a battle march.
  human: { name: 'The door you opened', bpm: 112, meter: 4, tonic: 45, register: 24, lead: 'celesta', bed: 'strings', groove: 'heart',
    chords: [[0,'m'],[8,'M'],[3,'M'],[10,'M'],[5,'m'],[0,'m'],[7,'M'],[0,'m']],
    tune: ['7:1.5 3:.5 0:1 -:1', '3:2 5:.5 8:.5 7:.5 3:.5', '10:1.5 7:.5 3:1 -:1', '5:1 10:.5 14:.5 12:1 10:1', '12:2 8:.5 5:.5 -:1', '7:.5 12:.5 15:1 14:.5 12:.5 7:1', '11:2 7:.5 6:.5 2:.5 11:.5', '12:2.5 7:.5 0:.5 -:.5'] },
  inquisitor: { name: 'By order of the Covenant', bpm: 124, meter: 4, tonic: 38, register: 24, lead: 'organ', bed: 'choir', groove: 'march',
    chords: [[0,'m'],[7,'M'],[0,'m'],[8,'M'],[5,'m'],[0,'m'],[7,'M'],[0,'m']],
    tune: ['0:1 7:1.5 3:.5 0:1','2:1.5 7:.5 11:1 7:1','12:2 -:.5 7:.5 3:.5 0:.5','8:1 12:1 15:1.5 12:.5','5:1.5 8:.5 12:2','7:.5 3:.5 0:1 7:1 12:1','11:1 14:.5 11:.5 7:1 2:1','0:3 -:1'] },
  warden: { name: 'Thorns of the parish', bpm: 132, meter: 3, tonic: 40, register: 24, lead: 'organ', bed: 'staccato', groove: 'hunt',
    chords: [[0,'m'],[5,'m'],[0,'m'],[7,'M'],[8,'M'],[5,'m'],[7,'M'],[0,'m']],
    tune: ['0:.5 3:.5 7:1 3:.5 2:.5','5:1 8:.5 12:.5 8:1','7:.75 10:.25 12:.5 7:.5 3:1','11:1.5 7:.5 2:.5 -:.5','15:.5 12:.5 8:1 12:1','17:1 12:.5 8:.5 5:1','7:.5 11:.5 14:.75 11:.25 7:.5 2:.5','0:2.5 -:.5'] },
  leech: { name: 'Under the black water', bpm: 108, meter: 4, tonic: 36, register: 24, lead: 'pluck', bed: 'choir', groove: 'heart',
    chords: [[0,'m'],[0,'m'],[8,'M'],[8,'M'],[5,'m'],[0,'m'],[7,'M'],[0,'m']],
    tune: ['0:.75 -:.25 3:.5 7:.5 3:1 -:1','7:1.5 10:.5 7:.5 3:.5 -:1','8:2 7:.5 5:.5 3:1','3:.5 8:.5 12:1 -:1 8:1','5:1.5 8:.5 12:.5 8:.5 5:1','3:.75 2:.25 0:2 -:1','2:.5 7:.5 11:1 7:.5 2:.5 -:1','0:3 -:1'] },
  swarm: { name: 'A thousand wings', bpm: 148, meter: 4, tonic: 42, register: 24, lead: 'flute', bed: 'staccato', groove: 'skitter', gate: .96,
    chords: [[0,'m'],[5,'M'],[10,'M'],[0,'m'],[2,'m'],[5,'M'],[7,'M'],[0,'m']],
    tune: ['12:.5 14:.25 15:.25 14:.5 12:.5 7:1 9:.5 12:.5','17:1.5 16:.5 14:.5 12:.5 9:.5 -:.5','14:.5 12:.25 10:.25 12:.5 14:.5 17:1 14:.5 10:.5','15:1.5 14:.5 12:1 7:.5 -:.5','14:.5 16:.25 17:.25 16:.5 14:.5 9:1 7:.5 5:.5','17:1 21:.5 19:.5 17:.5 16:.5 12:1','19:.5 18:.25 14:.25 11:1 14:.5 11:.5 7:1','12:1.5 7:.5 3:.5 2:.25 3:.25 0:.5 -:.5'] },
  pack: { name: 'Teeth in the pass', bpm: 140, meter: 4, tonic: 40, register: 24, lead: 'strings', bed: 'staccato', groove: 'hunt',
    chords: [[0,'m'],[0,'m'],[10,'M'],[8,'M'],[5,'m'],[0,'m'],[7,'M'],[0,'m']],
    tune: ['12:2.5 10:.5 7:.5 -:.5','-:1 7:.5 7:.25 10:.25 3:1.5 -:.5','14:2.5 12:.5 10:.5 -:.5','-:1 12:.5 12:.25 15:.25 8:1.5 -:.5','17:2 15:.5 12:.5 8:.5 -:.5','15:1.5 14:.5 12:.5 10:.5 7:.5 -:.5','14:2 11:.5 7:.5 2:.5 -:.5','12:3 -:1'] },
  drowned: { name: 'The bell beneath', bpm: 88, meter: 3, tonic: 36, register: 24, lead: 'bell', bed: 'choir', groove: 'submerged',
    chords: [[0,'m'],[8,'M'],[5,'m'],[0,'m'],[3,'M'],[8,'M'],[7,'M'],[0,'m']],
    tune: ['12:2.5 -:.5','8:1.5 -:.5 12:.5 15:.5','12:2 -:.5 8:.25 5:.25','7:1.5 3:.5 -:1','10:2 -:.5 7:.25 3:.25','8:1.5 12:.5 15:.5 -:.5','11:2 7:.5 -:.5','0:2 -:1'] },
  vulture: { name: 'A friend forgotten', bpm: 134, meter: 4, tonic: 43, register: 24, lead: 'flute', bed: 'strings', groove: 'flight', fragmentedOpening: true, percussion: .7,
    chords: [[0,'m'],[3,'M'],[8,'M'],[10,'M'],[5,'m'],[0,'m'],[7,'M'],[0,'m']],
    tune: ['12:1.5 10:.5 7:.5 3:.5 0:1','10:2 7:.5 3:.5 -:1','8:.5 12:.5 15:1 14:.5 12:.5 8:1','14:1.5 12:.5 10:1 5:1','12:1 17:.5 15:.5 12:1 8:1','7:.75 10:.25 12:1 7:.5 3:.5 0:1','11:1.5 14:.5 11:.5 7:.5 2:1','12:3 -:1'] },
  pair: { name: 'Steel and sorcery', bpm: 130, meter: 4, tonic: 45, register: 24, lead: 'staccato', bed: 'organ', groove: 'venom', answerLead: 'organ',
    chords: [[0,'m'],[5,'m'],[10,'M'],[7,'M'],[8,'M'],[0,'m'],[7,'M'],[0,'m']],
    tune: ['0:.5 7:.5 -:.5 12:.5 7:1 3:1','5:.75 8:.25 12:1 -:.5 8:.5 5:1','10:.5 5:.5 14:1 12:.5 10:.5 5:1','11:.75 7:.25 2:1 7:1 -:1','8:.5 15:.5 12:1 8:.5 3:.5 -:1','12:.5 7:.5 15:.5 12:.5 7:1 3:1','14:.75 11:.25 7:.5 2:.5 11:1 7:1','12:2 3:.5 7:.5 0:1'] },
  captain: { name: 'The last command', bpm: 128, meter: 4, tonic: 41, register: 24, lead: 'brass', bed: 'strings', groove: 'march', percussion: .8,
    chords: [[0,'m'],[3,'M'],[10,'M'],[0,'m'],[8,'M'],[5,'m'],[7,'M'],[0,'m']],
    tune: ['7:1.5 7:.5 12:1 3:1','10:1 7:.75 3:.25 7:2','5:1.5 10:.5 14:1 10:1','12:2 -:.5 7:.5 3:.5 0:.5','8:1 12:.5 15:.5 20:1 15:1','17:1.5 12:.5 8:1 5:1','11:.5 14:.5 19:1 14:.75 11:.25 7:1','12:3 -:1'] },
  brood: { name: 'The nest awakes', bpm: 138, meter: 5, tonic: 37, register: 24, lead: 'pluck', bed: 'organ', groove: 'lurk', waking: true,
    chords: [[0,'m'],[0,'m'],[8,'M'],[8,'M'],[5,'m'],[0,'m'],[7,'M'],[0,'m']],
    tune: ['0:.75 -:.25 0:.5 3:.5 -:1 7:1.5 3:.5','0:.75 -:.25 0:.5 3:.5 -:1 10:1 7:.5 -:.5','8:.75 -:.25 8:.5 3:.5 -:1 12:1.5 8:.5','8:.75 -:.25 8:.5 3:.5 -:1 15:1 12:.5 -:.5','5:.75 -:.25 5:.5 8:.5 -:1 12:1.5 8:.5','7:.5 3:.5 0:1 -:1 7:.25 3:.25 0:1.5','7:.75 -:.25 7:.5 11:.5 -:1 14:1.5 11:.5','12:2 7:.5 3:.5 0:1 -:1'] },
  apprentice: { name: 'The stolen lesson', bpm: 132, meter: 4, tonic: 47, register: 24, lead: 'flute', bed: 'strings', groove: 'flight', answerLead: 'celesta',
    chords: [[0,'m'],[5,'M'],[10,'M'],[0,'m'],[2,'m'],[5,'M'],[7,'M'],[0,'m']],
    tune: ['3:.75 2:.25 0:.5 2:.5 3:1 7:1','9:1.5 7:.5 5:1 -:1','2:.75 0:.25 10:.5 12:.5 14:1 10:1','7:1.5 5:.5 3:1 -:1','9:.75 7:.25 5:.5 7:.5 9:1 14:1','17:1.5 16:.5 14:.5 12:.5 9:1','11:.75 9:.25 7:.5 9:.5 11:1 14:1','12:2 3:.5 2:.5 0:.5 -:.5'] },
  duellist: { name: 'A blade above the clouds', bpm: 160, meter: 3, tonic: 38, register: 36, lead: 'harp', bed: 'pluck', groove: 'hunt', gate: .98,
    chords: [[0,'m'],[5,'M'],[0,'m'],[10,'M'],[2,'m'],[5,'M'],[7,'M'],[0,'m']],
    tune: ['7:.5 9:.5 7:.5 3:.5 2:.5 0:.5','5:.5 9:.25 12:.25 17:1 16:.5 12:.5','12:.75 10:.25 7:.5 5:.5 3:.5 2:.5','10:.5 14:.5 17:.5 14:.5 12:.5 10:.5','9:1.5 7:.5 5:.5 2:.5','5:.5 9:.25 12:.25 17:.5 16:.5 14:.5 12:.5','11:.5 14:.5 19:.75 18:.25 14:.5 11:.5','12:1 7:.5 3:.5 2:.5 3:.5'] },
  keeper: { name: 'The lighthouse remembers', bpm: 108, meter: 6, tonic: 36, register: 24, lead: 'bell', bed: 'choir', groove: 'beacon',
    chords: [[0,'m'],[5,'m'],[8,'M'],[0,'m'],[3,'M'],[5,'m'],[7,'M'],[0,'m']],
    tune: ['12:2 -:1 7:1 -:2','12:2 -:1 8:.5 5:.5 -:2','12:2 -:1 8:.5 12:.5 15:1 -:1','12:2 -:1 7:.5 3:.5 0:1 -:1','15:2 -:1 10:.5 7:.5 -:2','17:2 -:1 12:.5 8:.5 5:1 -:1','14:2 -:1 11:.5 7:.5 2:1 -:1','12:3 -:3'] },
  champion: { name: 'The talon crown', bpm: 138, meter: 4, tonic: 43, register: 24, lead: 'brass', bed: 'staccato', groove: 'march',
    chords: [[0,'M'],[10,'M'],[5,'M'],[0,'M'],[8,'M'],[5,'M'],[7,'M'],[0,'M']],
    tune: ['7:.5 7:.5 12:2 16:.5 14:.5','14:1.5 10:.5 5:1 -:1','9:.5 9:.5 12:2 17:.5 16:.5','16:1.5 14:.5 12:1 -:1','15:1 12:.5 8:.5 12:1 15:1','17:1.5 16:.5 14:.5 12:.5 9:1','14:.5 14:.5 19:2 18:.5 14:.5','16:1 14:.5 11:.5 12:1.5 -:.5'] },
  flight: { name: 'Undelivered', bpm: 112, meter: 3, tonic: 42, register: 24, lead: 'flute', bed: 'harp', groove: 'flight', percussion: .5,
    chords: [[0,'m'],[10,'M'],[3,'M'],[8,'M'],[5,'m'],[0,'m'],[7,'M'],[0,'m']],
    tune: ['7:1.5 12:.5 -:1','10:1 14:.75 12:.25 -:1','7:.5 10:.5 15:1 -:1','12:1.5 8:.5 -:1','5:.5 8:.5 12:.75 15:.25 17:1','15:1 12:.5 7:.5 3:1','11:1.5 14:.5 7:.5 2:.5','7:1.5 -:1.5'] },
} satisfies Partial<Record<Encounter, Score>>;

// Accompaniment uses the SAME explicit harmony as the written melody. Rhythms
// belong to the opponent: no universal root/fifth bass or recycled lead generator.
function compose(score: Score): Theme {
  const events: NoteEvent[] = [];
  const note = (beat: number, voice: Voice, midi: number, beats: number, velocity: number) => events.push({ beat, voice, midi, beats, velocity });
  for (let bar = 0; bar < 16; bar++) {
    const start = bar * score.meter;
    const [offset, quality] = score.chords[bar % 8];
    const root = score.tonic + offset;
    const chord = [root + 12, root + 12 + (quality === 'm' ? 3 : 4), root + 19];
    const lift = bar >= 8;
    const energy = score.waking ? .5 + bar / 30 : lift ? 1 : .82;
    const bass = (at: number, pitch: number, length: number, strength = .24) => note(start + at, 'bass', pitch, length, strength * energy);
    const hit = (at: number, voice: 'drum' | 'snare', strength: number) => note(start + at, voice, voice === 'drum' ? 36 : 60, .16, strength * energy * (score.percussion ?? 1));
    switch (score.groove) {
      case 'submerged':
        bass(0,root,2.8,.17);
        if(bar%2===0) hit(0,'drum',.1);
        break;
      case 'beacon':
        bass(0,root,4.8,.19); bass(5,root+7,.8,.1);
        hit(0,'drum',.14);
        break;
      case 'skitter':
        bass(0,root,.5,.2); bass(1.25,root,.25,.12); bass(2.5,root+7,.45,.18); bass(3.25,root,.25,.12);
        hit(0,'drum',.28); hit(1.25,'snare',.09); hit(2.5,'drum',.2); hit(3.75,'snare',.1);
        break;
      case 'lurk':
        bass(0,root,1.7,.25); bass(3,root+7,.65,.17); bass(4.25,root,.4,.14);
        hit(0,'drum',.35); hit(2,'snare',.11); hit(3,'drum',.23); hit(4.5,'snare',.08);
        break;
      case 'march':
        bass(0, root, 1.3); bass(1.5, root, .35, .16); bass(2, root + 7, .8); bass(3.5, root, .35, .17);
        hit(0,'drum',.38); hit(2,'drum',.3); hit(1,'snare',.13); hit(3,'snare',.16);
        break;
      case 'waltz':
        bass(0, root, 1.4); bass(2.5, root + 7, .35, .13);
        hit(0,'drum',.32); hit(1,'snare',.09); hit(2,'snare',.13);
        break;
      case 'venom':
        bass(0,root,.35); bass(.75,root,.35,.16); bass(1.5,root+7,.35,.19); bass(2.5,root,.6); bass(3.5,root+7,.35,.16);
        hit(0,'drum',.32); hit(1.5,'drum',.19); hit(2.5,'drum',.26); hit(1,'snare',.13); hit(3,'snare',.16);
        break;
      case 'clock':
        bass(0,root,.8); bass(1.5,root+7,.35,.17); bass(2,root,.7,.2);
        hit(0,'drum',.28); hit(1.5,'snare',.08); hit(2.5,'snare',.12);
        break;
      case 'tide':
        bass(0,root,1.3); bass(1.5,root+7,.8,.18); bass(3,root,1.3); bass(4.5,root+7,.8,.18);
        hit(0,'drum',.4); hit(2,'drum',.18); hit(3,'snare',.17); hit(4.5,'drum',.25); hit(5.5,'snare',.08);
        break;
      case 'heart':
        bass(0,root,1.6,.22); bass(2.75,root,.65,.16);
        hit(0,'drum',.24); hit(.5,'drum',.12); if(lift) hit(2.75,'snare',.09);
        break;
      case 'gallop':
        for(let at=0;at<score.meter;at++) { bass(at, at % 2 ? root+7 : root,.35,.2); bass(at+.5,root,.15,.1); bass(at+.75,root,.15,.12); }
        hit(0,'drum',.35); hit(score.meter===3?1.5:2,'drum',.26); hit(1,'snare',.12); hit(score.meter-.5,'snare',.16);
        break;
      case 'hunt':
        bass(0,root,.7); bass(1,root,.35,.17); bass(1.75,root+7,.7,.21);
        if(score.meter===4) bass(3,root,.7);
        hit(0,'drum',.36); hit(1.75,'drum',.27); hit(score.meter-.5,'snare',.15);
        break;
      case 'flight':
        bass(0,root,score.meter-1.1,.22); bass(score.meter-.75,root+7,.6,.14);
        hit(0,'drum',.26); hit(score.meter-1,'snare',.12);
        break;
    }
    if (['strings','organ','choir'].includes(score.bed)) {
      chord.forEach(midi=>note(start,score.bed,midi,score.meter-.15,(score.bed==='choir'?.032:.045)*energy));
    } else {
      const spacing = score.groove==='gallop'?.5:score.groove==='tide'?.75:score.groove==='clock'?.5:score.groove==='venom'?.5:1;
      const steps = score.groove==='clock'?[2,1,0,1]:score.groove==='venom'?[0,2,1,2]:[0,1,2,1];
      for(let i=0;i*spacing<score.meter;i++) {
        // Offbeat accompaniment in the marsh; leave space for its flute.
        const at=i*spacing+(score.groove==='venom'?.25:0);
        if(at+.2<=score.meter) note(start+at,score.bed,chord[steps[i%steps.length]],Math.min(.28,spacing*.7,score.meter-at),.075*energy);
      }
    }
    let beat = start;
    const phrase = score.tune[bar % 8].split(' ');
    for (const [index, token] of phrase.entries()) {
      const [pitch, length] = token.split(':');
      const duration = Number(length);
      if(pitch!=='-' && !(score.fragmentedOpening && !lift && index>1 && index<phrase.length-1)) {
        // Human's second statement is a string lament instead of the music box.
        const voice = score.answerLead && bar%2===1 ? score.answerLead :
          lift ? score.repriseLead ?? (score.groove==='heart' && score.lead==='celesta' ? 'strings' : score.lead) :
          score.openingLead ?? score.lead;
        note(beat,voice,score.tonic+score.register+Number(pitch),duration*(score.gate ?? .9),(voice==='celesta'||voice==='bell'?.2:.19)*(lift?1.08:1));
      }
      beat+=duration;
    }
    if(Math.abs(beat-start-score.meter)>.001) throw new Error(`${score.name}: bar ${bar+1} has ${beat-start} beats`);
    // The reprise adds a quiet chord-tone response, not an arbitrary octave shift.
    if(lift && bar%2===1 && !['heart','submerged','beacon'].includes(score.groove)) {
      note(start+score.meter-1,'strings',chord[1]+12,.8,.055);
    }
    if((bar===7 || bar===15) && !['submerged','beacon'].includes(score.groove)) {
      [.75,.5,.25].forEach((back,i)=>hit(score.meter-back,'snare',.06+i*.025));
    }
  }
  return {name:score.name,bpm:score.bpm,beatsPerBar:score.meter,bars:16,events};
}

export type BossThemeId = `boss-${keyof typeof SCORES}`;
export const BOSS_THEMES = Object.fromEntries(Object.entries(SCORES).map(([id, score]) => [`boss-${id}`, compose(score)])) as Record<BossThemeId, Theme>;
export const BOSS_MUSIC: Partial<Record<Encounter, BossThemeId>> = Object.fromEntries(Object.keys(SCORES).map(id => [id, `boss-${id}`]));
