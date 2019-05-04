import Species from './species.js';
import { state } from './state.js';

const zergs = id => new Species(
  id,
  'Zergs',
  '#FF00FF',
  20,
  'square_filled',
  state.directions[id], // TODO: Feels wrong
  'random',
  1.5,
  4.0,
  0.8,
  0.5,
  0.8,
  20,
  100,
  30, // calmSafetyNumber
  25, // scaredSafetyNumber
);

export { zergs };
