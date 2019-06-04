import { state } from './state.js';
import { showMenu } from './game.js';
import fsm from './fsm.js';
import { menuText } from './templates.js';

// TODO: Collision behaviour
// TODO: Better layouts (e.g. hex, pentagon, circle, square, random etc.)
// Game start / end
// Inputting of parameters

document.onreadystatechange = async () => {
  showMenu();
};
