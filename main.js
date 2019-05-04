import { state } from './state.js';
import { createTeam, createRandomTeam, determineSpeciesDirections } from './game.js';
import fsm from './fsm.js';
import { generateColours } from './utils.js';

// TODO: Collision behaviour
// TODO: Better layouts (e.g. hex, pentagon, circle, square, random etc.)
// Game start / end
// Inputting of parameters


document.onreadystatechange = async () => {
  document.getElementById('randomiseBtn').addEventListener('click', () => {
    createRandomTeam();
  });
  document.getElementById('startBtn').addEventListener('click', () => {
    state.directions = determineSpeciesDirections(); // TODO: Move me
    state.colours = generateColours(2); // TODO: Move me
    createTeam();
  });
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    fsm.restart();
  });
};
