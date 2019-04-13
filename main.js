/* eslint-disable import/extensions */
import { state } from './state.js';
import { detectCollisions } from './physics.js';
import Species from './species.js';
import { randomColour } from './colours.js';

// TODO: Collision behaviour
// TODO: Better layouts (e.g. hex, pentagon, circle, square, random etc.)
// Respawn
// Game start / end
// Inputting of parameters

// Globals
const generateName = async () => {
  const response = await fetch('https://faker.hook.io?property=name.findName&locale=en');
  const json = await response.json();
  const speciesName = await JSON.stringify(json);
  return speciesName;
};


const canvas = document.getElementById('canvas');
const globals = {
  numberOfSpecies: 2,
  collisionDebug: true,
  collisionRadius: 2,
  rendering: true,
  canvas,
  ctx: canvas.getContext('2d'),
  canvasHeight: canvas.height,
  canvasWidth: canvas.width,
  canvasOffsetLeft: canvas.offsetLeft,
  canvasOffsetTop: canvas.offsetTop,
  totalSpeciesEnergy: 1000,
};

const generateTick = () => {
  setInterval(() => {
    document.dispatchEvent(new Event('tick'));
  }, 50);
};

const clearCanvas = () => {
  globals.ctx.clearRect(0, 0, canvas.width, canvas.height);
};

window.onkeypress = () => {
  globals.rendering = true;
};

const drawScore = () => {
  state.species.forEach((t, idx) => {
    const scoreString = `${t.name}: ${t.getScore()}`;
    globals.ctx.font = '14px sans-serif';
    globals.ctx.fillStyle = t.colour;
    globals.ctx.fillText(scoreString, globals.canvasWidth - 250, 20 + 20 * idx);
  });
};

const handleTick = () => {
  if (globals.rendering) {
    clearCanvas();
    state.species.forEach((v) => {
      v.critters.forEach((c) => {
        c.move();
        c.draw();
      });
      detectCollisions();
    });
    drawScore();
    // globals.rendering = false;
    state.cycle += 1;
  }
};


// Debug handling
canvas.addEventListener(
  'click',
  (e) => {
    const x = e.pageX - globals.canvasOffsetLeft;
    const y = e.pageY - globals.canvasOffsetTop;
    const allCritters = Object.values(state.critters).flat();
    const clickedCritters = allCritters.filter(
      c => Math.ceil(c.position.x) > x - 5
        && Math.ceil(c.position.x) < x + 5
        && Math.ceil(c.position.y) > y - 5
        && Math.ceil(c.position.y) < y + 5,
    );
    clickedCritters.forEach((c) => {
      // eslint-disable-next-line no-param-reassign
      c.species.colour = '#00FF00';
      c.draw();
    });
  },
  false,
);

// Assume direction is a value between 0 and 2*PI
/*
                 pi/2
                  |
           1      |     3
                  |
 pi     ----------|---------- 0
                  |
            2     |     0
                  |
                3*pi/2

  */

const determineSpeciesDirections = (numberOfSpecies) => {
  const speciesDirections = {};
  // Split the entire direction in to number of species fractions
  for (let i = 0; i < numberOfSpecies; i += 1) {
    switch (i % 4) {
      case 0:
        speciesDirections[i] = 1.5 * Math.PI + 0.5 * Math.PI * Math.random();
        break;

      case 1:
        speciesDirections[i] = 0.5 * Math.PI + 0.5 * Math.PI * Math.random();
        break;

      case 2:
        speciesDirections[i] = 1 * Math.PI + Math.PI * Math.random();
        break;

      case 3:
        speciesDirections[i] = 0 * Math.PI + 0.5 * Math.PI * Math.random();
        break;

      default:
        break;
    }
  }
  return speciesDirections;
};

document.onreadystatechange = async () => {
  if (document.readyState === 'complete') {
    const speciesDirection = determineSpeciesDirections(globals.numberOfSpecies);
    for (let i = 0; i < globals.numberOfSpecies; i += 1) {
      const s = new Species(
        i, // id
        `Team ${i + 1}`, // name
        randomColour(), // colour
        Math.ceil(10 * Math.random()), // group size
        speciesDirection[i], //  direction
        speciesDirection[i] + Math.PI, // conflict direction
        Math.random(), // aggression
        Math.random(), // respawn
        2 + Math.ceil(8 * Math.random()), // critter speed
        1 + Math.ceil(2 * Math.random()), // critter size
        Math.random(), // critter spacing
        5 + Math.ceil(Math.random() * 10), // scaredRadius,
        5 + Math.ceil(Math.random() * 5), // safetyRadius,
        5 + Math.ceil(Math.random() * 5), // scaredSafetyNumber,
        2 + Math.ceil(Math.random() * 3), // calmSafetyNumber,
      );
      s.generateCritters();
      state.species.push(s);
    }
    // Create clock
    generateTick();
    document.addEventListener('tick', handleTick, false);
  }
};

export { globals };
