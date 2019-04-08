import { state } from './state.js';
import { critter } from './critters.js';
import { detectCollisions } from './physics.js';

// Globals
const canvas = document.getElementById('canvas');
const globals = {
  numberOfCritters: 200,
  collisionDebug: true,
  rendering: true,
  canvas,
  ctx: canvas.getContext('2d'),
  canvasHeight: canvas.height,
  canvasWidth: canvas.width,
};

const generateTick = () => {
  setInterval(() => {
    document.dispatchEvent(new Event('tick'));
  }, 500);
};

const clearCanvas = () => {
  globals.ctx.clearRect(0, 0, canvas.width, canvas.height);
};

window.onkeypress = () => {
  globals.rendering = true;
};

const handleTick = () => {
  if (globals.rendering) {
    clearCanvas();
    state.critters.forEach((c) => {
      detectCollisions();
      c.move();
      c.draw();
    });
    globals.rendering = false;
    state.cycle += 1;
    state.critterDistances = [];
  }
};

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    for (let index = 0; index < globals.numberOfCritters; index += 1) {
      state.critters.push(new critter());
    }

    // Create clock
    generateTick();
    document.addEventListener('tick', handleTick, false);
  }
};

export { globals };
