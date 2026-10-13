import type { Tableau } from './stories';
import type { Effect } from '../audio/effects';

// Staging is presentation data, one picture for each line of the boar's rise scene; battle rules still decide when the phase changes.
export const BOAR_PHASE_SHOTS: readonly { caption: string; art: Tableau; actors: readonly string[]; pose: 'fallen' | 'bracing' | 'standing'; sound?: Effect }[] = [
  { caption: 'THE FIRST FALL', art: 'farmhouse-hearth', actors: ['boar'], pose: 'fallen', sound: 'wind' },
  { caption: 'STAY DOWN', art: 'farmhouse-hearth', actors: ['boar', 'badger'], pose: 'fallen' },
  { caption: 'LAST TIME', art: 'farmhouse-hearth', actors: ['boar'], pose: 'bracing', sound: 'heartbeat' },
  { caption: 'HE STANDS AGAIN', art: 'farmhouse', actors: ['boar', 'badger', 'rat'], pose: 'standing' },
];
