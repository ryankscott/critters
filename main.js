/* eslint-disable import/extensions */
import { state } from './state.js';
import { detectCollisions } from './physics.js';
import Species from './species.js';

// TODO: Collision behaviour
// TODO: Better layouts (e.g. hex, pentagon, circle, square, random etc.)
// Respawn
// Game start / end
// Inputting of parameters

// Globals
const canvas = document.getElementById('canvas');
const globals = {
  numberOfSpecies: 2,
  debug: true,
  collisionRadius: 2,
  rendering: true,
  canvas,
  ctx: canvas.getContext('2d'),
  canvasHeight: canvas.height,
  canvasWidth: canvas.width,
  canvasOffsetLeft: canvas.offsetLeft,
  canvasOffsetTop: canvas.offsetTop,
  totalSpeciesEnergy: 2000,
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

const drawSpeciesParameters = () => {
  globals.ctx.font = '14px sans-serif';
  globals.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const metricsOfInterest = ['name', 'groupSize', 'critterSpeed', 'critterSize', 'critterSpacing', 'respawnRate', 'scaredRadius', 'safetyRadius', 'calmSafetyNumber', 'scaredSafetyNumber', 'maxAge'];
  state.species.forEach((t, idx) => {
    let metricsDrawn = 0;
    Object.entries(t).forEach((e) => {
      if (metricsOfInterest.includes(e[0])) {
        globals.ctx.fillText(e.join(': '), 0, 14 + 175 * idx + 14 * metricsDrawn);
        metricsDrawn += 1;
      }
    });
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
      v.respawnCritters();
      v.ageCritters();
      v.killOldCritters();
    });
    drawScore();
    drawSpeciesParameters();
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

const determineSpeciesDirections = () => {
  const speciesDirections = {};
  // Split the entire direction in to number of species fractions
  for (let i = 0; i < globals.numberOfSpecies; i += 1) {
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

const generateColours = () => chroma.scale(['yellow', '008ae5']).colors(globals.numberOfSpecies);

document.onreadystatechange = async () => {
  if (document.readyState === 'complete') {
    const speciesDirection = determineSpeciesDirections();
    const colours = generateColours();
    for (let i = 0; i < globals.numberOfSpecies; i += 1) {
      const size = 4 - Math.ceil((Math.random() * 2));
      const groupSize = Math.ceil(50 * Math.random());
      const s = new Species(
        i, // id
        `Team ${i + 1}`, // name
        colours.pop(), // colour
        Math.ceil(50 * Math.random()), // group size
        speciesDirection[i], //  direction
        speciesDirection[i] + Math.PI, // conflict direction
        Math.random(), // aggression
        Math.random() * 0.05, // respawn
        10 - size, // critter speed
        size, // critter size
        2 * Math.random(), // critter spacing
        3 * size + Math.ceil(Math.random() * 5), // scaredRadius,
        1 * size + Math.ceil(Math.random() * 5), // safetyRadius,
        Math.ceil(groupSize * 0.2), // scaredSafetyNumber,
        Math.ceil(groupSize * 0.1), // calmSafetyNumber,
        50000 + Math.ceil(Math.random() * 20000), // maxAge
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
