import Species from './species.js';
import { state } from './state.js';

const levels = [
  new Species(
    1, // id
    'Horde', // name
    '#FF00FF', // colour
    20, // groupSize
    'square_filled', // groupShape
    0.5 * Math.PI + 0.25 * Math.PI + 0.25 * Math.PI * (Math.random() - 0.5), // TODO: Fix this
    'do_nothing', //scaredBehaviour
    3.5, //respawnRate
    4.0, // critterSpeed
    0.9, // critterSize
    0.6, // critterSpacing
    400, // totalEnergy
    0.9, // critter energy
    20, // scared radius
    120, //safety radius
    30, // calmSafetyNumber
    50, // scaredSafetyNumber
    'These critters come in waves of fast moving, small packs that are afraid of nothing. Kill them quickly as they respawn like crazy!',
    'Easy',
  ),
  new Species(
    1, // TODO: I think this is pointless :/
    'Roaches',
    '#FF00FF',
    5,
    'square_filled',
    0.5 * Math.PI + 0.25 * Math.PI + 0.25 * Math.PI * (Math.random() - 0.5), // TODO: Fix this
    'nearest_neighbour',
    1.05, //respawnRate
    2.0, //critterSpeed
    2.5, //critterSize
    2.5, //critterSpacing
    500, //totalEnergy
    3.0, //critterEnergy
    30, //scaredRadius
    80, // safetyRadius
    20, // calmSafetyNumber
    10, // scaredSafetyNumber
    'These slow moving, solitary animals will clump together when scared',
    'Easy',
  ),
];

export { levels };
