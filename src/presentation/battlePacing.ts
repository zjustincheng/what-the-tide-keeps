import type {Encounter} from '../rules/battle';

const BOSSES:readonly Encounter[]=['kraken','boar','hyena','viper','cuckoo','cuttlefish','human'];

// Only presentation pauses vary. Reaction windows and battle rules stay unchanged.
export function battlePacing(encounter:Encounter,leader=true) {
  const heavy=leader && BOSSES.includes(encounter);
  return {heavy,turnLead:heavy?420:240,windup:heavy?300:180,recovery:heavy?320:180,warning:800,phaseReturn:420};
}
